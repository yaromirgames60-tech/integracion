from fastapi import HTTPException, status


class ConflictHTTPException(HTTPException):
	def __init__(self, detail: str | None = 'Ошибка при создании записи'):
		super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class CredentialsHTTPException(HTTPException):
	def __init__(self):
		super().__init__(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail='Ошибка при проверке данных',
			headers={'WWW-Authenticate': 'Bearer'},
		)


class LoginHTTPException(HTTPException):
	def __init__(self, detail='Некорректное имя или пароль'):
		super().__init__(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail=detail,
			headers={'WWW-Authenticate': 'Bearer'},
		)


class NotFoundHTTPException(HTTPException):
	def __init__(self, detail: str | None = 'Ресурс не найден'):
		super().__init__(
			status_code=status.HTTP_404_NOT_FOUND,
			detail=detail,
		)


class NotAuthorizedHTTPException(HTTPException):
	def __init__(self, detail: str | None = 'Недостаточно прав'):
		super().__init__(
			status_code=status.HTTP_403_FORBIDDEN,
			detail=detail,
		)
