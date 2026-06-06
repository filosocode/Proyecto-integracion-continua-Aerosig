from sqlalchemy import Boolean, Column, Integer, String, Float
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String)
    role = Column(String, default="pilot")
    is_active = Column(Boolean, default=True)

class Drone(Base):
    __tablename__ = "drones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    model = Column(String, index=True)
    status = Column(String, default="Activo")
    serial_number = Column(String, unique=True, index=True)
    pilot = Column(String, nullable=True)
    flight_hours = Column(Float, default=0.0)
    last_maintenance = Column(String, nullable=True)
