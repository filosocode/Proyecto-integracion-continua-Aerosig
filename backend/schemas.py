from pydantic import BaseModel
from typing import Optional

# ─── USER SCHEMAS ───────────────────────────────────────────────────────────

class UserPublic(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    full_name: Optional[str] = None
    password: str
    role: str = "pilot"

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

# ─── DRONE SCHEMAS ──────────────────────────────────────────────────────────

class DroneBase(BaseModel):
    name: str
    model: str
    status: str = "Activo"
    serial_number: str
    pilot: Optional[str] = None
    flight_hours: float = 0.0
    last_maintenance: Optional[str] = None

class DroneCreate(DroneBase):
    pass

class DroneUpdate(BaseModel):
    name: Optional[str] = None
    model: Optional[str] = None
    status: Optional[str] = None
    serial_number: Optional[str] = None
    pilot: Optional[str] = None
    flight_hours: Optional[float] = None
    last_maintenance: Optional[str] = None

class Drone(DroneBase):
    id: int

    class Config:
        from_attributes = True

# ─── AUTH SCHEMAS ────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None
