import { useEffect, useState } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import apiClient, { ApiError, type RecordResponse } from '#/api/client'

export const Route = createFileRoute('/records/$id')({
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
	component: RecordDetails,
})

function RecordDetails() {
	const { id } = Route.useParams()
	const { accessToken, setAccessToken } = Route.useRouteContext()
	const navigate = Route.useNavigate()

	const [record, setRecord] = useState<RecordResponse | null>(null)
	const [isLoading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!accessToken) return

		const recordId = Number(id)

		if (Number.isNaN(recordId)) {
			setError('Некорректный идентификатор')
			setLoading(false)
			return
		}

		let cancelled = false
		setLoading(true)
		setError(null)

		apiClient.records
			.get({ accessToken, id: recordId })
			.then(data => {
				if (!cancelled) setRecord(data)
			})
			.catch((e: unknown) => {
				if (cancelled) return
				if (e instanceof ApiError && e.status === 401) {
					setAccessToken(null)
					navigate({ to: '/login' })
					return
				}
				setError(e instanceof ApiError ? e.detail : 'Ошибка загрузки')
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})

		return () => {
			cancelled = true
		}
	}, [accessToken, id])

	if (!accessToken) return null

	return (
		<div className="p-8">
			<h1>Запись №{id}</h1>

			{isLoading && <p>Загрузка...</p>}
			{error && <p role="alert">{error}</p>}

			{!isLoading && record && (
				<article>
					<p>Курс: {record.course.title}</p>
					<p>Автор: {record.author.username}</p>
					<p>Создана: {new Date(record.created_at).toLocaleString()}</p>
				</article>
			)}

			<Link to="/records">Все заявки</Link>
		</div>
	)
}