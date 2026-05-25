from database import SessionLocal, engine
import models
from auth import get_password_hash

USERS = [
    dict(username="admin",    full_name="Jorge Mendez",      password="admin123",    role="admin"),
    dict(username="piloto",   full_name="Sebastian Ramirez", password="piloto123",   role="pilot"),
    dict(username="analista", full_name="Carlos Lopez",      password="analista123", role="analyst"),
    dict(username="tecnico",  full_name="Maria Torres",      password="tecnico123",  role="technician"),
]

DRONES = [
    dict(name="Halcon 01",  model="DJI Mavic 3",          serial_number="SN-HAL-001", status="Activo",             pilot="Andres Perez",    flight_hours=18.5, last_maintenance="2024-04-12"),
    dict(name="Condor 02",  model="DJI Matrice 300 RTK",  serial_number="SN-CON-002", status="En Mantenimiento",   pilot="Laura Morales",   flight_hours=22.3, last_maintenance="2024-04-08"),
    dict(name="Aguila 03",  model="DJI Mavic 3",          serial_number="SN-AGU-003", status="Fuera de Servicio",  pilot="Daniel Rios",     flight_hours=9.75, last_maintenance="2024-04-05"),
    dict(name="Phantom 04", model="DJI Phantom 4 Pro",    serial_number="SN-PHA-004", status="Activo",             pilot="Santiago Torres", flight_hours=16.0, last_maintenance="2024-03-20"),
    dict(name="Kestrel 05", model="DJI Matrice 300 RTK",  serial_number="SN-KES-005", status="Activo",             pilot="Ana Gomez",       flight_hours=31.2, last_maintenance="2024-04-01"),
]

def seed_db():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    for u in USERS:
        exists = db.query(models.User).filter(models.User.username == u["username"]).first()
        if not exists:
            db.add(models.User(
                username=u["username"],
                full_name=u["full_name"],
                hashed_password=get_password_hash(u["password"]),
                role=u["role"],
            ))
            print(f"Usuario creado: {u['username']} ({u['role']})")
        else:
            # Actualizar rol y full_name si ya existe
            exists.role = u["role"]
            exists.full_name = u["full_name"]
            print(f"Usuario actualizado: {u['username']} ({u['role']})")

    for d in DRONES:
        exists = db.query(models.Drone).filter(models.Drone.serial_number == d["serial_number"]).first()
        if not exists:
            db.add(models.Drone(**d))
            print(f"Dron creado: {d['name']}")

    db.commit()
    db.close()
    print("Seed completado.")

if __name__ == "__main__":
    seed_db()
