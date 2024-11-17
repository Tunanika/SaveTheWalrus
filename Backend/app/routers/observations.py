from fastapi import HTTPException, Query, APIRouter
from app.models.observation import *
from sqlmodel import select, Session
from app.dependencies.database import engine, add_to_session
from typing import Annotated

router = APIRouter(
    prefix="/observations",
    tags=["observations"],
)

def __require_observation(id: int, session: Session) -> Observation:
    observation = session.get(Observation, id)
    if not observation:
        raise HTTPException(status_code=404, detail="Observation not found")
    return observation

@router.get("/")
def __get_observations(
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[Observation]:
    with Session(engine) as session:
        observations = session.exec(select(Observation).offset(offset).limit(limit)).all()
        return observations

@router.get("/{id}")
def __get_observation(id: int) -> Observation:
    with Session(engine) as session:
        return __require_observation(id, session)

@router.delete("/{id}", status_code=204)
def __delete_observation(id: int):
    with Session(engine) as session:
        db_observation = __require_observation(id, session)
        session.delete(db_observation)
        session.commit()

@router.patch("/{id}")
def __patch_observation(id: int, observation: ObservationUpdate):
    with Session(engine) as session:
        db_observation = __require_observation(id, session)
        db_observation.sqlmodel_update(observation.model_dump(exclude_unset=True))
        add_to_session(db_observation, session)
        return db_observation

@router.post("/", status_code=201)
def __post_observation(observation: ObservationCreate) -> Observation:
    with Session(engine) as session:
        db_observation = Observation.model_validate(observation)
        add_to_session(db_observation, session)
        return db_observation