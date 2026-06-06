from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

import models, schemas, auth, database
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AeroSIG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── AUTH ────────────────────────────────────────────────────────────────────

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = auth.create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/me", response_model=schemas.UserPublic)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# ─── USUARIOS ────────────────────────────────────────────────────────────────

@app.get("/api/users", response_model=List[schemas.UserPublic])
def list_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_roles("admin"))
):
    return db.query(models.User).all()

@app.post("/api/users", response_model=schemas.UserPublic, status_code=201)
def create_user(
    payload: schemas.UserCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_roles("admin"))
):
    if db.query(models.User).filter(models.User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")
    user = models.User(
        username=payload.username,
        full_name=payload.full_name,
        hashed_password=auth.get_password_hash(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.put("/api/users/{user_id}", response_model=schemas.UserPublic)
def update_user(
    user_id: int,
    payload: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Solo admin puede editar a otros; cualquiera puede editar su propio perfil
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos para editar este usuario")

    # Solo admin puede cambiar roles
    if payload.role and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No puedes cambiar roles")

    # Admin no puede quitarse a sí mismo el rol admin
    if user.id == current_user.id and payload.role and payload.role != "admin":
        raise HTTPException(status_code=400, detail="No puedes cambiar tu propio rol de administrador")

    data = payload.model_dump(exclude_unset=True)
    if "password" in data and data["password"]:
        data["hashed_password"] = auth.get_password_hash(data.pop("password"))
    else:
        data.pop("password", None)

    for k, v in data.items():
        setattr(user, k, v)
    db.commit()
    db.refresh(user)
    return user

@app.delete("/api/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.require_roles("admin"))
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta")
    db.delete(user)
    db.commit()
    return {"message": "Usuario eliminado"}

# ─── DRONES ──────────────────────────────────────────────────────────────────

@app.get("/api/drones", response_model=List[schemas.Drone])
def read_drones(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Drone).offset(skip).limit(limit).all()

@app.get("/api/drones/{drone_id}", response_model=schemas.Drone)
def read_drone(
    drone_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.get_current_user)
):
    drone = db.query(models.Drone).filter(models.Drone.id == drone_id).first()
    if not drone:
        raise HTTPException(status_code=404, detail="Dron no encontrado")
    return drone

@app.post("/api/drones", response_model=schemas.Drone, status_code=201)
def create_drone(
    drone: schemas.DroneCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_roles("admin", "technician"))
):
    if db.query(models.Drone).filter(models.Drone.serial_number == drone.serial_number).first():
        raise HTTPException(status_code=400, detail="El número de serie ya está registrado")
    new_drone = models.Drone(**drone.model_dump())
    db.add(new_drone)
    db.commit()
    db.refresh(new_drone)
    return new_drone

@app.put("/api/drones/{drone_id}", response_model=schemas.Drone)
def update_drone(
    drone_id: int,
    drone: schemas.DroneUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_roles("admin", "technician"))
):
    db_drone = db.query(models.Drone).filter(models.Drone.id == drone_id).first()
    if not db_drone:
        raise HTTPException(status_code=404, detail="Dron no encontrado")
    for k, v in drone.model_dump(exclude_unset=True).items():
        setattr(db_drone, k, v)
    db.commit()
    db.refresh(db_drone)
    return db_drone

@app.delete("/api/drones/{drone_id}")
def delete_drone(
    drone_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_roles("admin", "technician"))
):
    db_drone = db.query(models.Drone).filter(models.Drone.id == drone_id).first()
    if not db_drone:
        raise HTTPException(status_code=404, detail="Dron no encontrado")
    db.delete(db_drone)
    db.commit()
    return {"message": "Dron eliminado exitosamente"}
