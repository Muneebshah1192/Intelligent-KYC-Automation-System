from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# What we expect from the user when they register
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# What we show to the world (No password included!)
class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: Optional[str] = "user"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# What we expect when someone tries to login
class UserLogin(BaseModel):
    email: EmailStr
    password: str