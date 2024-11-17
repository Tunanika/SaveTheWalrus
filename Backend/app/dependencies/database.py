from sqlmodel import SQLModel, create_engine, Session
from os import getenv
from app.models import *

__db_url = getenv("BOSWACHTER_DB_URL")
engine = create_engine(__db_url)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def add_to_session(entity: SQLModel, session: Session):
    session.add(entity)
    session.commit()
    session.refresh(entity)