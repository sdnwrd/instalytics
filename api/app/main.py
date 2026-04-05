from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import instagram, analytics

app = FastAPI(title="Instalytics API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://instalytics.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(instagram.router, prefix="/instagram", tags=["instagram"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])


@app.get("/health")
async def health():
    return {"status": "ok"}
