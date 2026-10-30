import { useEffect, useState } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import apiClient, { ApiError, type RecordResponse } from '#/api/client'

export const Route = createFileRoute('/records/')({
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
	component: RecordsPage,
})

function RecordsPage() {
	const { accessToken, username, setAccessToken, setUsername } =
		Route.useRouteContext()
	const navigate = Route.useNavigate()

	const [records, setRecords] = useState<RecordResponse[]>([])
	const [isLoading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)

	useEffect(() => {
		if (!accessToken) return

		let cancelled = false
		setLoading(true)
		setError(null)

		apiClient.records
			.all({ accessToken })
			.then(data => {
				if (!cancelled) setRecords(data.records)
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
	}, [accessToken])

	if (!accessToken) return null

	const handleDelete = async (id: number) => {
		if (!window.confirm(`Удалить заявку №${id}?`)) return

		setError(null)
		setSuccess(null)

		try {
			await apiClient.records.delete({ accessToken, id })
			setRecords(prev => prev.filter(record => record.id !== id))
			setSuccess('Заявка удалена')
		} catch (e: unknown) {
			setError(e instanceof ApiError ? e.detail : 'Не удалось удалить заявку')
		}
	}

	const handleLogout = () => {
		setAccessToken(null)
		setUsername(null)
		navigate({ to: '/login' })
	}

	return (
		<div className="p-8">
			<header
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<div>
					Вы вошли как <strong>{username}</strong>
				</div>
				<button type="button" onClick={handleLogout}>
					Выйти
				</button>
			</header>

			<h1>Мои заявки</h1>

			<Link to="/records/create">Создать заявку</Link>

			{success && <p>{success}</p>}
			{error && <p role="alert">{error}</p>}
			{isLoading && <p>Загрузка...</p>}

			{!isLoading && !error && (
				<table>
					<thead>
						<tr>
							<th>№</th>
							<th>Курс</th>
							<th>Создана</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{records.length === 0 ? (
							<tr>
								<td colSpan={4}>Заявок пока нет</td>
							</tr>
						) : (
							records.map(record => (
								<tr key={record.id}>
									<td>
										<Link
											to="/records/$id"
											params={{ id: String(record.id) }}
										>
											{record.id}
										</Link>
									</td>
									<td>{record.course.title}</td>
									<td>{new Date(record.created_at).toLocaleString()}</td>
									<td>
										<button
											type="button"
											onClick={() => handleDelete(record.id)}
										>
											Удалить
										</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			)}
		</div>
	)
}