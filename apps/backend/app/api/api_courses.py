from fastapi import APIRouter

from app import schema
from app.api.dependencies import SessionDatabase
from app.services import courses_service

courses_router = APIRouter(
	prefix='/courses',
	tags=['Курсы'],
)


@courses_router.get(
	'/',
	summary='Список курсов',
	response_model=list[schema.Course],
)
def get_courses_list(
	session: SessionDatabase,
):
	return courses_service.get_list(session=session)


@courses_router.get(
	'/stats',
	summary='Статистика по курсам (публичная)',
	response_model=list[schema.CourseStats],
)
def get_courses_stats(
	session: SessionDatabase,
):
	return courses_service.get_stats(session=session)