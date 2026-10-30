from typing import Literal
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Course(Base):
	__tablename__ = 'courses'

	id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
	title: Mapped[str] = mapped_column(String, nullable=False)

	records: Mapped[list['Record']] = relationship('Record', back_populates='course', lazy='joined')


class Record(Base):
	__tablename__ = 'records'

	id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
	author_id: Mapped[str] = mapped_column(String, ForeignKey('users.username'), nullable=False)
	course_id: Mapped[str] = mapped_column(String, ForeignKey('courses.id'), nullable=False)
	created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, nullable=False)

	course: Mapped['Course'] = relationship('Course', back_populates='records', lazy='joined')
	author: Mapped['User'] = relationship('User', back_populates='records', lazy='joined')

	__table_args__ = (UniqueConstraint('author_id', 'course_id', name='uq_author_course'),)


class User(Base):
	__tablename__ = 'users'

	username: Mapped[str] = mapped_column(String, primary_key=True, index=True)
	password: Mapped[str | None] = mapped_column(String, nullable=False)
	role: Mapped[Literal['user'] | Literal['admin']] = mapped_column(
		String, nullable=False, default='user'
	)

	records: Mapped[list[Record]] = relationship('Record', back_populates='author', lazy='joined')
