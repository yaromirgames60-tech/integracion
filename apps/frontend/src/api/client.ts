import fetcher, { ApiError } from './fetcher'

export { ApiError }

export type Role = 'user' | 'admin'

export type UserResponse = {
	username: string
	role: Role
}

export type Course = {
	id: string
	title: string
}

export type CourseStats = Course & {
	records_count: number
}

export type RecordResponse = {
	id: number
	created_at: string
	course: Course
	author: UserResponse
}

export type RecordsListResponse = {
	records: RecordResponse[]
	records_count: number
}

export type UserToken = {
	access_token: string
	token_type: 'bearer'
}

const allRecordsFn = async ({
	accessToken,
	author,
	course,
	limit,
	offset,
}: {
	accessToken: string
	author?: string
	course?: string
	limit?: number
	offset?: number
}): Promise<RecordsListResponse> => {
	return fetcher({
		path: '/records/',
		method: 'get',
		headers: { Authorization: `Bearer ${accessToken}` },
		searchParams: { author, course, limit, offset },
	})
}

const getRecordFn = async ({
	accessToken,
	id,
}: {
	accessToken: string
	id: number
}): Promise<RecordResponse> => {
	return fetcher({
		path: `/records/${id}`,
		method: 'get',
		headers: { Authorization: `Bearer ${accessToken}` },
	})
}

const createRecordFn = async ({
	accessToken,
	courseId,
}: {
	accessToken: string
	courseId: string
}): Promise<RecordResponse> => {
	return fetcher({
		path: '/records/',
		method: 'post',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
		body: { course_id: courseId },
	})
}

const deleteRecordFn = async ({
	accessToken,
	id,
}: {
	accessToken: string
	id: number
}): Promise<void> => {
	return fetcher<void>({
		path: `/records/${id}`,
		method: 'delete',
		headers: { Authorization: `Bearer ${accessToken}` },
	})
}

const getMeFn = async ({
	accessToken,
}: {
	accessToken: string
}): Promise<UserResponse> => {
	return fetcher({
		path: '/auth/me',
		method: 'get',
		headers: { Authorization: `Bearer ${accessToken}` },
	})
}

const loginFn = async ({
	username,
	password,
}: {
	username: string
	password: string
}): Promise<UserToken> => {
	const data = await fetcher<UserToken>({
		path: '/auth/login',
		method: 'post',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ username, password }),
	})

	if (!data.access_token) {
		throw new Error('No access token provided')
	}

	return data
}

const registerFn = async ({
	username,
	password,
}: {
	username: string
	password: string
}): Promise<void> => {
	await fetcher<void>({
		path: '/auth/',
		method: 'post',
		headers: { 'Content-Type': 'application/json' },
		body: { username, password },
	})
}

const getCoursesFn = async (): Promise<Course[]> => {
	return fetcher({ path: '/courses/', method: 'get' })
}

const getCourseStatsFn = async (): Promise<CourseStats[]> => {
	return fetcher({ path: '/courses/stats', method: 'get' })
}

export default {
	records: {
		all: allRecordsFn,
		get: getRecordFn,
		create: createRecordFn,
		delete: deleteRecordFn,
	},
	auth: {
		login: loginFn,
		register: registerFn,
		me: getMeFn,
	},
	courses: {
		all: getCoursesFn,
		stats: getCourseStatsFn,
	},
}