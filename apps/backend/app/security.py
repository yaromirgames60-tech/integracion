from datetime import UTC, datetime, timedelta

import jwt
from pwdlib import PasswordHash

from app import schema
from app.config import settings


def create_access_token(subject: schema.JwtSubject) -> str:
	expire = datetime.now(UTC) + timedelta(minutes=settings.JWT_EXPIRE)
	to_encode = {'exp': expire, 'sub': subject.model_dump()}
	return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> schema.JwtSubject:
	raw_token_data = jwt.decode(
		token,
		settings.JWT_SECRET_KEY,
		algorithms=[settings.JWT_ALGORITHM],
		options={'verify_sub': False},
	)

	return schema.JwtSubject.model_validate(raw_token_data['sub'])


def verify_password(plain_password: str, hashed_password: str) -> bool:
	return get_password_hash(plain_password) == hashed_password


def get_password_hash(password: str) -> str:
	return password_hasher.hash(password, salt=settings.PASSWORD_SALT)


password_hasher = PasswordHash.recommended()
