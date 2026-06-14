from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import models
from database import Base, get_db
from main import app

engine_test = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)
Base.metadata.create_all(bind=engine_test)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_docs_disponibles():
    response = client.get("/docs")
    assert response.status_code == 200


def test_login_credenciales_incorrectas_retorna_401():
    response = client.post("/login", data={"username": "noexiste", "password": "mal"})
    assert response.status_code == 401


def test_drones_sin_autenticacion_retorna_401():
    response = client.get("/api/drones")
    assert response.status_code == 401


def test_usuarios_sin_autenticacion_retorna_401():
    response = client.get("/api/users")
    assert response.status_code == 401


def test_login_usuario_inexistente():
    response = client.post("/login", data={"username": "fantasma", "password": "1234"})
    assert response.status_code == 401
    assert "detail" in response.json()
