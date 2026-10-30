import { useState, type SubmitEvent } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import apiClient, { ApiError } from '#/api/client'

export const Route = createFileRoute('/register')({
	beforeLoad: ({ context }) => {
		if (context.accessToken) {
			throw redirect({ to: '/records' })
		}
	},
	component: Register,
})

function Register() {
	const navigate = Route.useNavigate()

	const [isLoading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError(null)

		const formData = new FormData(e.currentTarget)
		const username = String(formData.get('username') ?? '')
		const password = String(formData.get('password') ?? '')
		const passwordRepeat = String(formData.get('password_repeat') ?? '')

		if (password !== passwordRepeat) {
			setError('Пароли не совпадают')
			return
		}

		setLoading(true)

		try {
			await apiClient.auth.register({ username, password })
			navigate({ to: '/login', search: { registered: '1' } })
		} catch (e: unknown) {
			setError(e instanceof ApiError ? e.detail : 'Не удалось зарегистрироваться')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="p-8">
			<h1>Регистрация</h1>

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
						autoComplete="new-password"
					/>
				</label>

				<label>
					Повторите пароль
					<input
						name="password_repeat"
						type="password"
						minLength={6}
						required
						autoComplete="new-password"
					/>
				</label>

				{error && <p role="alert">{error}</p>}

				<button type="submit" disabled={isLoading}>
					{isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
				</button>
			</form>

			<Link to="/login">Уже есть аккаунт? Войти</Link>
		</div>
	)
}