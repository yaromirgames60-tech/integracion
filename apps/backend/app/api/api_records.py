from fastapi import APIRouter, Path, Query, status
from sqlalchemy import exc as dbExceptions

from app import schema
from app.api.dependencies import CurrentUser, SessionDatabase
from app.api.exceptions import (
	ConflictHTTPException,
	CredentialsHTTPException,
	NotAuthorizedHTTPException,
	NotFoundHTTPException,
)
from app.services import records_service

records_router = APIRouter(
	prefix='/records',
	tags=['Записи'],
)


@records_router.get(
	'/',
	summary='Список записей текущего пользователя',
	description='Список записей текущего пользователя с фильтрацией и пагинацией',
	response_model=schema.RecordsListResponse,
	responses={
		status.HTTP_401_UNAUTHORIZED: {'description': 'err: token or not valid user data'},
		status.HTTP_403_FORBIDDEN: {'description': 'err: user is not creator'},
		status.HTTP_404_NOT_FOUND: {'description': 'err: log is not found'},
		status.HTTP_422_UNPROCESSABLE_CONTENT: {'description': 'err: id is not valid'},
	},
)
def get_records_list(
	current_user: CurrentUser,
	session: SessionDatabase,
	limit: int = Query(20, title='Количество записей (по умолчанию 20)'),
	offset: int = Query(0, title='Величина отступа (по умолчанию 0)'),
	author: str = Query(None, title='Фильтр по юзернейму автора'),
	course: str = Query(None, title='Фильтр по курсу'),
) -> schema.RecordsListResponse:
	author_filter = author if current_user.role == 'admin' else current_user.username
	return records_service.get_records_list(
		session=session, limit=limit, offset=offset, course=course, author=author_filter
	)


@records_router.post(
	'/',
	summary='Добавление записи',
	description='Добавление записи (требуется авторизация)',
	response_model=schema.RecordResponse,
	status_code=201,
	responses={
		status.HTTP_401_UNAUTHORIZED: {'description': 'err: token or not valid user data'},
		status.HTTP_403_FORBIDDEN: {'description': 'err: user is not creator'},
		status.HTTP_404_NOT_FOUND: {'description': 'err: log is not found'},
		status.HTTP_422_UNPROCESSABLE_CONTENT: {'description': 'err: id is not valid'},
	},
)
def create_record(
	current_user: CurrentUser,
	session: SessionDatabase,
	new_record_payload: schema.RecordCreate,
) -> schema.RecordResponse:
	if not current_user:
		raise CredentialsHTTPException

	try:
		new_record = records_service.create_record(
			session=session,
			author_id=current_user.username,
			course_id=new_record_payload.course_id,
		)
		return schema.RecordResponse.model_validate(new_record)
	except dbExceptions.IntegrityError:
		raise ConflictHTTPException


@records_router.get(
	'/{id}',
	summary='Чтение записи',
	response_model=schema.RecordResponse,
	responses={
		status.HTTP_401_UNAUTHORIZED: {'description': 'err: token or not valid user data'},
		status.HTTP_403_FORBIDDEN: {'description': 'err: user is not creator'},
		status.HTTP_404_NOT_FOUND: {'description': 'err: log is not found'},
		status.HTTP_422_UNPROCESSABLE_CONTENT: {'description': 'err: id is not valid'},
	},
)
def get_record(
	current_user: CurrentUser,
	session: SessionDatabase,
	id: int = Path(..., title='Идентификатор записи для чтения'),
) -> schema.RecordResponse:
	record = records_service.get_record_by_id(session=session, id=id)

	if not record:
		raise NotFoundHTTPException

	if record.author_id != current_user.username and current_user.role != 'admin':
		raise NotAuthorizedHTTPException

	return schema.RecordResponse.model_validate(record)


@records_router.delete(
	'/{id}',
	summary='Удаление записи',
	description='Удаление собственной записи',
	status_code=204,
	responses={
		status.HTTP_401_UNAUTHORIZED: {'description': 'err: token or not valid user data'},
		status.HTTP_403_FORBIDDEN: {'description': 'err: user is not creator'},
		status.HTTP_404_NOT_FOUND: {'description': 'err: log is not found'},
		status.HTTP_422_UNPROCESSABLE_CONTENT: {'description': 'err: id is not valid'},
	},
)
def delete_record(
	current_user: CurrentUser,
	session: SessionDatabase,
	id: int = Path(..., title='Идентификатор записи для удаления'),
) -> None:
	if not current_user:
		raise CredentialsHTTPException

	record_to_delete = records_service.get_record_by_id(session=session, id=id)

	if not record_to_delete:
		raise NotFoundHTTPException

	if record_to_delete.author_id != current_user.username and current_user.role != 'admin':
		raise NotAuthorizedHTTPException

	records_service.delete_record(session=session, record_id=id)