from sqlalchemy import select
from sqlalchemy.orm import Session

from app import schema
from app.database import models


def get_by_username(*, session: Session, username: str) -> schema.UserResponse | None:
	user = session.scalar(select(models.User).where(models.User.username == username))

	if not user:
		return None

	return schema.UserResponse.model_validate(user)
