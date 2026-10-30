import { useState, type SubmitEvent } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import apiClient, { ApiError } from '#/api/client'

type LoginSearch = {
	registered?: string
}

export const Route = createFileRoute('/login')({
	validateSearch: (search: Record<string, unknown>): LoginSearch => ({
		registered: (search.registered as string) || undefined,
	}),
	beforeLoad: ({ context }) => {
		if (context.accessToken) {
			throw redirect({ to: '/records' })
		}
	},
	component: Login,
})

function Login() {
	const { setAccessToken } = Route.useRouteContext()
	const navigate = Route.useNavigate()
	const search = Route.useSearch()

	const [isLoading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError(null)
		setLoading(true)

		const formData = new FormData(e.currentTarget)
		const username = String(formData.get('username') ?? '')
		const password = String(formData.get('password') ?? '')

		try {
			const data = await apiClient.auth.login({ username, password })
			setAccessToken(data.access_token)
			navigate({ to: '/records' })
		} catch (e: unknown) {
			setError(e instanceof ApiError ? e.detail : 'Не удалось войти')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="p-8">
			<h1>Вход</h1>

			{search.registered && (
				<p>Регистрация успешна. Войдите в аккаунт.</p>
			)}

			<form onSubmit={handleSubmit}>
				<label>
					Логин
					<input name="username" minLength={2} required autoComplete="username" />
				</label>

				<label>
					Пароль
					<input
						name="password"
						type="password"
						minLength={6}
						required
						autoComplete="current-password"
					/>
				</label>

				{error && <p role="alert">{error}</p>}

				<button type="submit" disabled={isLoading}>
					{isLoading ? 'Вход...' : 'Войти'}
				</button>
			</form>

			<Link to="/register">Нет аккаунта? Зарегистрироваться</Link>
		</div>
	)
}