"""
Génère un historique réaliste de rendez-vous pour entraîner le modèle ML.

- 6 mois d'historique
- Distribution réaliste : plus de RDV en semaine, moins le week-end
- Chaque service a un volume moyen différent
- Heures ouvrées uniquement (8h-18h)

Usage :
    python scripts/generate_history.py
"""
import os
import sys
import random
from datetime import datetime, timedelta

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv()

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_DATABASE = os.getenv("DB_DATABASE", "meditrack_ai")
DB_USERNAME = os.getenv("DB_USERNAME", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

DATABASE_URL = (
    f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_DATABASE}?charset=utf8mb4"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Volume moyen de RDV par jour et par service
SERVICE_PROFILES = {
    "Médecine générale": 6,
    "Pédiatrie": 4,
    "Maternité": 3,
    "Cardiologie": 2,
    "Laboratoire": 5,
    "Radiologie": 3,
    "Ophtalmologie": 1,
    "Dermatologie": 1,
    "Neurologie": 1,
}

# Facteur par jour de la semaine (0=lundi, 6=dimanche)
WEEKDAY_FACTORS = [1.2, 1.1, 1.3, 1.0, 1.2, 0.5, 0.1]

# Heures de travail (probabilité plus forte le matin)
HOURS = list(range(8, 18))
HOUR_WEIGHTS = [3, 4, 5, 5, 4, 3, 4, 4, 3, 2]


def main():
    with engine.begin() as conn:
        # Récupère les services et médecins existants
        services = conn.execute(text("SELECT id, name FROM services")).mappings().all()
        doctors = conn.execute(text("SELECT id, service_id FROM doctors")).mappings().all()
        patients = conn.execute(text("SELECT id FROM patients")).mappings().all()
        creator = conn.execute(text("SELECT id FROM users LIMIT 1")).scalar()

        if not services or not patients:
            print("❌ Pas assez de données de base (services / patients).")
            return

        service_by_name = {s["name"]: s["id"] for s in services}
        doctors_by_service = {}
        for d in doctors:
            doctors_by_service.setdefault(d["service_id"], []).append(d["id"])

        # Étend la liste des patients : crée des patients fictifs supplémentaires si besoin
        patient_ids = [p["id"] for p in patients]
        while len(patient_ids) < 40:
            new_id = conn.execute(text("""
                INSERT INTO patients (code, first_name, last_name, created_by, is_archived, created_at, updated_at)
                VALUES (:code, :fn, :ln, :cb, 0, NOW(), NOW())
            """), {
                "code": f"PAT-GEN-{len(patient_ids)+1:04d}",
                "fn": f"Patient{len(patient_ids)+1}",
                "ln": "Démo",
                "cb": creator,
            }).lastrowid
            patient_ids.append(new_id)

        print(f"✅ {len(patient_ids)} patients disponibles")

        # Génère 6 mois d'historique
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        start_date = today - timedelta(days=180)

        total_inserted = 0

        for service_name, base_volume in SERVICE_PROFILES.items():
            if service_name not in service_by_name:
                continue

            service_id = service_by_name[service_name]
            service_doctors = doctors_by_service.get(service_id) or [doctors[0]["id"]]

            for day_offset in range(180):
                day = start_date + timedelta(days=day_offset)
                factor = WEEKDAY_FACTORS[day.weekday()]

                # Variation aléatoire ±30 %
                noise = random.uniform(0.7, 1.3)
                daily_count = int(base_volume * factor * noise)

                for _ in range(daily_count):
                    hour = random.choices(HOURS, weights=HOUR_WEIGHTS, k=1)[0]
                    minute = random.choice([0, 15, 30, 45])
                    scheduled_at = day.replace(hour=hour, minute=minute)

                    # Ignore le futur
                    if scheduled_at > datetime.now():
                        continue

                    # Statut réaliste : la plupart terminés, quelques annulés
                    status = random.choices(
                        ["completed", "cancelled", "no_show"],
                        weights=[85, 10, 5],
                        k=1,
                    )[0]

                    conn.execute(text("""
                        INSERT INTO appointments
                            (patient_id, doctor_id, service_id, scheduled_at,
                             duration_minutes, status, created_by, created_at, updated_at)
                        VALUES
                            (:pid, :did, :sid, :sched, 30, :status, :cb, NOW(), NOW())
                    """), {
                        "pid": random.choice(patient_ids),
                        "did": random.choice(service_doctors),
                        "sid": service_id,
                        "sched": scheduled_at,
                        "status": status,
                        "cb": creator,
                    })
                    total_inserted += 1

        print(f"✅ {total_inserted} rendez-vous générés sur 6 mois")


if __name__ == "__main__":
    main()