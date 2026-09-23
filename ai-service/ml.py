"""
Modèles d'analyse et de prédiction pour MediTrack AI.

Approche :
- On récupère l'historique des RDV quotidiens par service
- On entraîne un modèle de régression linéaire simple par service
- On prédit les N prochains jours
- On calcule une tendance (hausse / baisse / stable)

C'est volontairement simple et interprétable : pour un premier module IA,
mieux vaut un modèle clair qu'un réseau de neurones opaque.
"""
import pandas as pd
from datetime import datetime, timedelta
from sqlalchemy import text
from sqlalchemy.orm import Session
from sklearn.linear_model import LinearRegression
import numpy as np


def fetch_daily_appointments_by_service(db: Session, days: int = 90) -> pd.DataFrame:
    """Récupère le nombre de RDV par jour et par service sur les N derniers jours."""
    since = datetime.now() - timedelta(days=days)

    query = text("""
        SELECT
            DATE(a.scheduled_at) AS day,
            a.service_id,
            s.name AS service_name,
            COUNT(a.id) AS appointments
        FROM appointments a
        JOIN services s ON s.id = a.service_id
        WHERE a.scheduled_at >= :since
          AND a.status NOT IN ('cancelled', 'no_show')
        GROUP BY DATE(a.scheduled_at), a.service_id, s.name
        ORDER BY day ASC
    """)

    rows = db.execute(query, {"since": since}).mappings().all()
    return pd.DataFrame(rows)


def build_daily_series(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transforme le DataFrame groupé en série complète :
    une ligne par jour, une colonne par service.
    Comble les jours sans RDV par 0.
    """
    if df.empty:
        return pd.DataFrame()

    df["day"] = pd.to_datetime(df["day"])
    pivot = df.pivot_table(
        index="day",
        columns="service_name",
        values="appointments",
        aggfunc="sum",
        fill_value=0,
    )

    # Complète les jours manquants
    full_range = pd.date_range(pivot.index.min(), pivot.index.max(), freq="D")
    pivot = pivot.reindex(full_range, fill_value=0)

    return pivot


def predict_service_load(
    db: Session,
    days_history: int = 90,
    days_future: int = 7,
) -> dict:
    """
    Pour chaque service, entraîne un modèle de régression sur l'historique
    et prédit la charge des N prochains jours.
    """
    df = fetch_daily_appointments_by_service(db, days=days_history)
    pivot = build_daily_series(df)

    if pivot.empty:
        return {"error": "Pas assez de données historiques."}

    forecasts = []

    for service_name in pivot.columns:
        series = pivot[service_name].values
        n = len(series)

        # Si le service n'a jamais eu de RDV, on ignore
        if series.sum() == 0:
            continue

        # X = numéro du jour (0..n-1), y = nombre de RDV
        X = np.arange(n).reshape(-1, 1)
        y = series

        model = LinearRegression()
        model.fit(X, y)

        # Prédictions futures
        X_future = np.arange(n, n + days_future).reshape(-1, 1)
        y_future = model.predict(X_future)

        # On borne à 0 (pas de RDV négatifs)
        y_future = np.maximum(y_future, 0)

        # Moyenne historique
        avg_history = float(np.mean(y))

        # Moyenne prévue
        avg_forecast = float(np.mean(y_future))

        # Tendance
        if avg_history > 0:
            variation = (avg_forecast - avg_history) / avg_history
        else:
            variation = 0

        if variation > 0.15:
            trend = "hausse"
        elif variation < -0.15:
            trend = "baisse"
        else:
            trend = "stable"

        # Dates futures
        last_date = pivot.index[-1]
        future_dates = [
            (last_date + timedelta(days=i + 1)).strftime("%Y-%m-%d")
            for i in range(days_future)
        ]

        forecasts.append({
            "service_name": service_name,
            "average_history": round(avg_history, 2),
            "average_forecast": round(avg_forecast, 2),
            "variation_pct": round(variation * 100, 1),
            "trend": trend,
            "forecast": [
                {"date": d, "predicted_appointments": round(max(v, 0), 1)}
                for d, v in zip(future_dates, y_future)
            ],
        })

    # Tri par volume prévu décroissant
    forecasts.sort(key=lambda x: x["average_forecast"], reverse=True)

    return {
        "history_days": days_history,
        "forecast_days": days_future,
        "generated_at": datetime.now().isoformat(),
        "services": forecasts,
    }


def detect_trends(db: Session, days_history: int = 60) -> dict:
    """
    Détecte les tendances globales :
    - Services en hausse / baisse
    - Alerte de tension (prévision > moyenne + 30 %)
    """
    forecast_data = predict_service_load(db, days_history=days_history, days_future=7)

    if "error" in forecast_data:
        return forecast_data

    alerts = []
    for service in forecast_data["services"]:
        if service["variation_pct"] > 20:
            alerts.append({
                "level": "warning",
                "service": service["service_name"],
                "message": (
                    f"Charge prévue en hausse de {service['variation_pct']}% "
                    f"pour {service['service_name']} dans les 7 prochains jours."
                ),
            })

    return {
        "generated_at": datetime.now().isoformat(),
        "alerts": alerts,
        "services_summary": [
            {
                "service": s["service_name"],
                "trend": s["trend"],
                "variation_pct": s["variation_pct"],
            }
            for s in forecast_data["services"]
        ],
    }