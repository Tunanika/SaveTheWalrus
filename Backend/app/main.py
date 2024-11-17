from fastapi import FastAPI
from app.dependencies.database import create_db_and_tables
from app.routers import observations

api = FastAPI()
api.include_router(observations.router)

@api.on_event("startup")
def __on_startup():
    """
    On startup (before serving any requests) we initialize the table structure to ensure
    all relevant tables are created/updated. This makes development easy.
    """
    create_db_and_tables()