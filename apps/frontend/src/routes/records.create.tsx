import { useEffect, useState, type SubmitEvent } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import apiClient, { ApiError, type Course } from '#/api/client'

export const Route = createFileRoute('/records/create')({
	beforeLoad: async ({ context }) => {
		if (!context.accessToken) {
			throw redirect({ to: '/login' })
		}

		if (!context.username) {
			try {
				const { username } = await apiClient.auth.me({
					accessToken: context.accessToken,
				})
				return { username }
			} catch {
				context.setAccessToken(null)
				throw redirect({ to: '/login' })
			}
		}

		return {}
	},
	component: CreateRecordPage,
})

function CreateRecordPage() {
	const { accessToken } = Route.useRouteContext()
	const navigate = Route.useNavigate()

	const [courses, setCourses] = useState<Course[]>([])
	const [isLoading, setLoading] = useState(true)
	const [isSubmitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let cancelled = false

		apiClient.courses
			.all()
			.then(data => {
				if (!cancelled) setCourses(data)
			})
			.catch((e: unknown) => {
				if (!cancelled) {
					setError(e instanceof ApiError ? e.detail : 'Ошибка загрузки курсов')
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})

		return () => {
			cancelled = true
		}
	}, [])

	if (!accessToken) return null

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError(null)

		const formData = new FormData(e.currentTarget)
		const courseId = String(formData.get('course_id') ?? '')

		if (!courseId) {
			setError('Выберите курс')
			return
		}

		setSubmitting(true)

		try {
			await apiClient.records.create({ accessToken, courseId })
			navigate({ to: '/records' })
		} catch (e: unknown) {
			setError(e instanceof ApiError ? e.detail : 'Не удалось создать заявку')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="p-8">
			<h1>Создать заявку</h1>

			{isLoading && <p>Загрузка...</p>}
			{error && <p role="alert">{error}</p>}

			{!isLoading && (
				<form onSubmit={handleSubmit}>
					<label>
						Курс
						<select name="course_id" required defaultValue="">
							<option value="" disabled>
								Выберите курс
							</option>
							{courses.map(course => (
								<option key={course.id} value={course.id}>
									{course.title}
								</option>
							))}
						</select>
					</label>

					<button type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Создание...' : 'Создать'}
					</button>
				</form>
			)}

			<Link to="/records">Назад к заявкам</Link>
		</div>
	)
}