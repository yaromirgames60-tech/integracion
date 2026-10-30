from sqlalchemy import delete, select
from sqlalchemy.orm import Session, joinedload

from app import schema
from app.database import models


def get_record_by_id(*, session: Session, id: int) -> models.Record | None:
	return (
		session.scalars(
			select(models.Record)
			.where(models.Record.id == id)
			.options(joinedload(models.Record.author), joinedload(models.Record.course))
		)
		.unique()
		.one_or_none()
	)


def get_records_list(
	*,
	session: Session,
	limit: int,
	offset: int,
	author: str | None = None,
	course: str | None = None,
) -> schema.RecordsListResponse:
	expr = select(models.Record).options(
		joinedload(models.Record.author), joinedload(models.Record.course)
	)

	if author:
		expr = expr.where(models.Record.author_id == author)
	if course:
		expr = expr.where(models.Record.course_id == course)

	records = session.scalars(expr).unique().all()
	paginated_records = [
		schema.RecordResponse.model_validate(record)
		for record in session.scalars(expr.limit(limit).offset(offset)).unique().all()
	]

	return schema.RecordsListResponse(records=paginated_records, records_count=len(records))


def create_record(*, session: Session, course_id: str, author_id: str) -> models.Record | None:
	record = models.Record(author_id=author_id, course_id=course_id)

	session.add(record)
	session.commit()
	session.refresh(record)

	return session.scalar(
		select(models.Record)
		.where(models.Record.id == record.id)
		.options(joinedload(models.Record.course), joinedload(models.Record.author))
	)


def delete_record(*, session: Session, record_id: int) -> None:
	session.execute(delete(models.Record).where(models.Record.id == record_id))
	session.commit()
