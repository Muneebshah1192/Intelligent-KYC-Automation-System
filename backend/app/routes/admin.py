from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard")
def dashboard():
    return {"message": "Admin dashboard"}
