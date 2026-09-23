from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

import fastapi_cdn_host

from db import get_db
from ml import predict_service_load, detect_trends

app = FastAPI(
    title="MediTrack AI — Service IA",
    description="Service d'analyse et d'aide à la décision pour MediTrack AI",
    version="0.1.0",
)

fastapi_cdn_host.patch_docs(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# Endpoints de base
# ============================================

@app.get("/")
def root():
    return {
        "message": "MediTrack AI — Service d'intelligence artificielle",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "meditrack-ai-service",
        "version": "0.1.0",
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/health/db")
def health_db(db: Session = Depends(get_db)):
    """Vérifie que le service peut bien lire la base MediTrack AI."""
    try:
        patients = db.execute(text("SELECT COUNT(*) FROM patients")).scalar()
        doctors = db.execute(text("SELECT COUNT(*) FROM doctors")).scalar()
        appointments = db.execute(text("SELECT COUNT(*) FROM appointments")).scalar()
        consultations = db.execute(text("SELECT COUNT(*) FROM consultations")).scalar()

        return {
            "status": "ok",
            "database": "meditrack_ai",
            "counts": {
                "patients": patients,
                "doctors": doctors,
                "appointments": appointments,
                "consultations": consultations,
            },
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============================================
# Statistiques
# ============================================

@app.get("/stats/services")
def stats_services(days: int = 30, db: Session = Depends(get_db)):
    """
    Renvoie le nombre de rendez-vous par service sur les N derniers jours.
    Utilisé comme base pour la prédiction de charge.
    """
    since = datetime.now() - timedelta(days=days)

    query = text("""
        SELECT
            s.id            AS service_id,
            s.name          AS service_name,
            COUNT(a.id)     AS appointments_count
        FROM services s
        LEFT JOIN appointments a
            ON a.service_id = s.id
            AND a.scheduled_at >= :since
            AND a.status NOT IN ('cancelled', 'no_show')
        GROUP BY s.id, s.name
        ORDER BY appointments_count DESC, s.name ASC
    """)

    rows = db.execute(query, {"since": since}).mappings().all()

    return {
        "period_days": days,
        "since": since.isoformat(),
        "services": [dict(row) for row in rows],
    }


# ============================================
# Prédictions IA
# ============================================

@app.get("/predict/service-load")
def predict_load(
    days_history: int = 90,
    days_future: int = 7,
    db: Session = Depends(get_db),
):
    """
    Prévoit la charge par service pour les N prochains jours.

    - `days_history` : nombre de jours d'historique utilisés (défaut 90)
    - `days_future` : nombre de jours à prédire (défaut 7)
    """
    return predict_service_load(db, days_history=days_history, days_future=days_future)


@app.get("/predict/trends")
def trends(
    days_history: int = 60,
    db: Session = Depends(get_db),
):
    """
    Détecte les tendances et renvoie les alertes (services en tension).
    """
    return detect_trends(db, days_history=days_history)