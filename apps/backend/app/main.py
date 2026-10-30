from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_auth, api_courses, api_records
from app.config import settings

app = FastAPI(debug=settings.DEBUG, title='InDreams', description='InDreams API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_records.records_router)
app.include_router(api_auth.auth_router)
app.include_router(api_courses.courses_router)
