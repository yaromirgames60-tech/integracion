import os
import sys

from sqlalchemy import delete, exc, select

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir)))

from app import schema
from app.database import Base, SessionLocal, engine, models
from app.security import get_password_hash


def main() -> None:
	with SessionLocal(bind=engine) as session:
		try:
			session.execute(delete(models.Record))
			session.execute(delete(models.Course))
			session.execute(delete(models.User))
			session.commit()
		except exc.OperationalError:
			session.rollback()

	with SessionLocal(bind=engine) as session:
		Base.metadata.create_all(bind=engine)
		session.commit()

	with SessionLocal(bind=engine) as session:
		try:
			session.add(
				models.User(
					username='testuser', password=get_password_hash('testuserpassword'), role='user'
				)
			)

			session.add(
				models.User(
					username='testadmin',
					password=get_password_hash('testadminpassword'),
					role='admin',
				)
			)

			session.commit()

			users = (session.scalars(select(models.User))).unique().all()

			print('Created users')
			print([schema.UserResponse.model_validate(user) for user in users])

		except exc.IntegrityError:
			session.commit()

	with SessionLocal(bind=engine) as session:
		for course in [
			{'id': 'algorithms', 'title': 'Алгоритмы'},
			{'id': 'python', 'title': 'Основы Python'},
			{'id': 'devops', 'title': 'Основы DevOps'},
		]:
			session.add(models.Course(id=course['id'], title=course['title']))
			session.commit()

		courses = (session.scalars(select(models.Course))).unique().all()

		print('Generated courses')
		print([schema.Course.model_validate(course) for course in courses])


if __name__ == '__main__':
	main()
