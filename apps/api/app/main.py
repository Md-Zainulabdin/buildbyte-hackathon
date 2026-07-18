from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes.applications import router as applications_router
from app.routes.auth import router as auth_router
from app.routes.matching import router as matching_router
from app.routes.opportunities import router as opportunities_router
from app.routes.reviews import router as reviews_router
from app.routes.users import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="SkillBridge API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(opportunities_router)
app.include_router(applications_router)
app.include_router(reviews_router)
app.include_router(matching_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "SkillBridge API is running"}
