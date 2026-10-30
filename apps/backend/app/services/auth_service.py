from sqlalchemy import select
from sqlalchemy.orm import Session

from app import schema, security
from app.database import models

# from app.security import create_access_token, get_password_hash, verify_password


def register(*, session: Session, user_data: schema.User) -> models.User:
	new_user = models.User(
		username=user_data.username,
		password=security.get_password_hash(user_data.password),
		role='user',
	)

	session.add(new_user)
	session.commit()
	session.refresh(new_user)

	return new_user


def authenticate(*, session: Session, user_data: schema.User) -> str | None:
	user = (
		session.scalars(select(models.User).where(models.User.username == user_data.username))
		.unique()
		.one()
	)

	if not user.password:
		return None

	if not security.verify_password(user_data.password, user.password):
		return None

	return security.create_access_token(subject=schema.JwtSubject.model_validate(user))
