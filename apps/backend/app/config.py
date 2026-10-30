import os
import secrets
import typing

from pydantic_settings import BaseSettings, SettingsConfigDict


def get_database_uri():
	if os.getenv('PYTHON_ENVIRONMENT') == 'testing':
		return 'sqlite:///./testing.sqlite3'
	return 'sqlite:///./local.sqlite3'


class Settings(BaseSettings):
	DEBUG: bool = os.getenv('PYTHON_ENVIRONMENT') != 'testing'

	JWT_SECRET_KEY: str = secrets.token_urlsafe(32)
	JWT_EXPIRE: int = 60 * 3
	JWT_ALGORITHM: typing.Literal['HS256'] = 'HS256'

	PASSWORD_SALT: bytes = secrets.token_bytes(32)

	DATABASE_URI: str = get_database_uri()

	model_config = SettingsConfigDict(
		env_file='.env',
		strict=True,
	)


settings = Settings()
