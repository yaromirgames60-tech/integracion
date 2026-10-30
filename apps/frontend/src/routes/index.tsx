import { useEffect, useState } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import apiClient, { ApiError, type CourseStats } from '#/api/client'

export const Route = createFileRoute('/')({
	beforeLoad: ({ context }) => {
		if (context.accessToken) {
			throw redirect({ to: '/records' })
		}
	},
	component: Landing,
})

function Landing() {
	const [stats, setStats] = useState<CourseStats[]>([])
	const [isLoading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let cancelled = false

		apiClient.courses
			.stats()
			.then(data => {
				if (!cancelled) setStats(data)
			})
			.catch((e: unknown) => {
				if (!cancelled) {
					setError(e instanceof ApiError ? e.detail : 'Ошибка загрузки')
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})

		return () => {
			cancelled = true
		}
	}, [])

	return (
		<div className="p-8">
			<h1 className="text-4xl font-bold">Сервис заявок</h1>
			<p>Курсы и количество заявок</p>

			{isLoading && <p>Загрузка...</p>}
			{error && <p role="alert">{error}</p>}

			{!isLoading && !error && (
				<ul>
					{stats.map(course => (
						<li key={course.id}>
							{course.title} — заявок: {course.records_count}
						</li>
					))}
				</ul>
			)}

			<nav style={{ display: 'flex', gap: '1rem' }}>
				<Link to="/login">Войти</Link>
				<Link to="/register">Зарегистрироваться</Link>
			</nav>
		</div>
	)
}