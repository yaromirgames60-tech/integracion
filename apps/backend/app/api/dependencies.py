from collections.abc import Generator
from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt import InvalidTokenError
from pydantic import ValidationError
from sqlalchemy import exc
from sqlalchemy.orm import Session

from app import schema, security
from app.api.exceptions import CredentialsHTTPException, NotFoundHTTPException
from app.database import SessionLocal, models
from app.services import users_service

oauth2 = OAuth2PasswordBearer(tokenUrl='/auth/login')
TokenDependency = Annotated[str, Depends(oauth2)]
OAuth2Form = Annotated[OAuth2PasswordRequestForm, Depends()]


def _get_db_sa() -> Generator[Session]:
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()


SessionDatabase = Annotated[Session, Depends(_get_db_sa)]


def _get_current_user(
	session: SessionDatabase,
	token: TokenDependency,
) -> schema.UserResponse:
	try:
		jwt_payload = security.decode_access_token(token)

		user = users_service.get_by_username(session=session, username=jwt_payload.username)
		if not user:
			raise NotFoundHTTPException(detail='Пользователь не найден')
		return user
	except (InvalidTokenError, ValidationError, KeyError):
		raise CredentialsHTTPException


CurrentUser = Annotated[schema.UserResponse, Depends(_get_current_user)]
