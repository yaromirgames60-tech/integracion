import sqlite3
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
	pass


def get_sqlite3_connection() -> sqlite3.Connection:
	return sqlite3.connect(
		settings.DATABASE_URI.lstrip('sqlite:///'), autocommit=False, check_same_thread=False
	)


engine = create_engine(settings.DATABASE_URI.__str__(), pool_pre_ping=True)
SessionLocal = sessionmaker(autoflush=False, bind=engine)
