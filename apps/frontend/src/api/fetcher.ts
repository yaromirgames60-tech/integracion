const baseUrl = 'http://127.0.0.1:8000'

export type RequestHeaders = {
	Authorization?: `Bearer ${string}`
	'Content-Type'?: 'application/json' | 'application/x-www-form-urlencoded'
}

type SearchParams = Record<string, string | number | undefined>

type BaseOptions = {
	path: `/${string}`
	headers?: RequestHeaders
	searchParams?: SearchParams
}

type GetOptions = BaseOptions & {
	method: 'get'
	body?: never
}

type DeleteOptions = BaseOptions & {
	method: 'delete'
	body?: never
}

type FormPostOptions = BaseOptions & {
	method: 'post'
	headers: RequestHeaders & { 'Content-Type': 'application/x-www-form-urlencoded' }
	body: URLSearchParams
}

type JsonPostOptions = BaseOptions & {
	method: 'post'
	headers: RequestHeaders & { 'Content-Type': 'application/json' }
	body: Record<string, unknown>
}

export type FetcherOptions =
	| GetOptions
	| DeleteOptions
	| FormPostOptions
	| JsonPostOptions

export class ApiError extends Error {
	status: number
	detail: string

	constructor(status: number, detail: string) {
		super(detail)
		this.name = 'ApiError'
		this.status = status
		this.detail = detail
	}
}

export default async function fetcher<T>({
	path,
	headers = {},
	method,
	body,
	searchParams = {},
}: FetcherOptions): Promise<T> {
	const url = new URL(path, baseUrl)

	for (const [param, value] of Object.entries(searchParams)) {
		if (value !== undefined) {
			url.searchParams.append(param, String(value))
		}
	}

	const requestInit: RequestInit = {
		credentials: 'include',
		method,
		headers: headers as HeadersInit,
	}

	if (body instanceof URLSearchParams) {
		requestInit.body = body
	} else if (body) {
		requestInit.body = JSON.stringify(body)
	}

	const response = await fetch(url.toString(), requestInit)

	if (!response.ok) {
		let detail = 'Сетевая ошибка'

		try {
			const data = await response.json()
			detail = data?.detail ?? detail
		} catch {

		}

		throw new ApiError(response.status, detail)
	}

	if (response.status === 204) {
		return undefined as T
	}

	const text = await response.text()
	return (text ? JSON.parse(text) : undefined) as T
}