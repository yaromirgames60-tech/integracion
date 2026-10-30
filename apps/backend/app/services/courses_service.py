from collections.abc import Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import schema
from app.database import models


def get_list(
	*,
	session: Session,
) -> Sequence[models.Course]:
	return session.scalars(select(models.Course)).unique().all()


def get_stats(*, session: Session) -> list[schema.CourseStats]:
	stmt = (
		select(models.Course, func.count(models.Record.id))
		.outerjoin(models.Record, models.Record.course_id == models.Course.id)
		.group_by(models.Course.id)
		.order_by(models.Course.title)
	)
	return [
		schema.CourseStats(id=course.id, title=course.title, records_count=count)
		for course, count in session.execute(stmt).all()
	]