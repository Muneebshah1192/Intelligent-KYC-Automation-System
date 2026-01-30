from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.routes import auth, kyc 
import os

app = FastAPI()

# This line tells FastAPI where your CSS/JS files are
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router)
app.include_router(kyc.router)

@app.get("/kyc")
async def get_kyc_page():
    # This serves the HTML file
    return FileResponse(os.path.join("static", "kyc.html"))