from sqlmodel import Field, SQLModel, Column
from enum import Enum as TypeEnum
from sqlmodel import Enum as DatabaseEnum

class Species(TypeEnum):
    DAMHERT = "Damhert"
    EDELHERT = "Edelhert"
    REE = "Ree"
    WILDZWIJN = "Wildzwijn"
    SCHOTSE_HOOGLANDER = "Schotse Hooglander"
    WOLF = "Wolf"

class Gender(TypeEnum):
    MALE = "Mannelijk"
    FEMALE = "Vrouwelijk"
    UNKNOWN ="Onbekend"

class Age(TypeEnum):
    YOUNG = "Jong"
    ADOLESCENT = "Adolecent"
    MATURE = "Volwassen"
    UNKNOWN = "Onbekend"


class Health(TypeEnum):
    ONE = "1"
    TWO = "2"
    THREE = "3"
    FOUR = "4"
    FIVE = "5"

class ObservationBase(SQLModel):
    """
    This is the base class for Observation entities containing all fields the
    user can set.
    """
    species: Species = Field(sa_column=Column(DatabaseEnum(Species)))
    observed_count: int
    gender: Gender = Field(sa_column=Column(DatabaseEnum(Gender)))
    age: Age = Field(sa_column=Column(DatabaseEnum(Age)))
    health: Health = Field(sa_column=Column(DatabaseEnum(Health)))
    location: str
    timestamp: int
    user: str
    additional_description: str

class Observation(ObservationBase, table=True):
    """
    This is the table representation for the Observation entity, it includes
    all fields from the base class and our auto increment ID.
    """
    id: int | None = Field(default=None, primary_key=True)

class ObservationCreate(ObservationBase):
    """
    Model defining the data required to create an Observation. Currently this
    adds nothing to the base class.
    """
    pass

class ObservationUpdate(SQLModel):
    """
    Model defining data required for our PATCH endpoint. All fields are
    optional here since we only require to send in fields the user wants
    to change.
    """
    species: Species | None = None
    observed_count: int | None = None
    gender: Gender | None = None
    age: Age | None = None
    health: Health | None = None
    location: str | None = None
    timestamp: int  | None = None
    user: str  | None = None
    additional_description: str  | None = None