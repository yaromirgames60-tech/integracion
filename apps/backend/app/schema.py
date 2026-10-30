from datetime import UTC, datetime
from typing import Literal

from pydantic import BaseModel as PBaseModel
from pydantic import ConfigDict, Field, field_serializer


class BaseModel(PBaseModel):
	model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class Course(BaseModel):
	id: str
	title: str


class UserToken(BaseModel):
	access_token: str
	token_type: Literal['bearer'] = 'bearer'


class JwtSubject(BaseModel):
	username: str
	role: Literal['user', 'admin']


class User(BaseModel):
	username: str = Field(..., min_length=2)
	password: str = Field(..., min_length=6)
	role: Literal['user', 'admin'] | None = Field(default='user')


class UserResponse(User):
	password: str = Field(..., min_length=6, exclude=True)


class RecordResponse(BaseModel):
	id: int
	created_at: datetime
	course: Course
	author: UserResponse


class RecordCreate(BaseModel):
	course_id: str


class RecordsListResponse(BaseModel):
	records: list[RecordResponse]
	records_count: int


class CourseStats(Course):
	records_count: int