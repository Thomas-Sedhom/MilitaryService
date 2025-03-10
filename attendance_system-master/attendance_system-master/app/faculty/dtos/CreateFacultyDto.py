from pydantic import BaseModel


#  DTO (Data Transfer Object)
class CreateFacultyDto(BaseModel):
    name: str
