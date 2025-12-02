from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.database import get_db
from backend.db.models import User
from backend.db.schemas import UserCreate, UserResponse

from backend.utils.hashing import hash_password, verify_password
from backend.utils.jwt_handler import create_access_token


router = APIRouter(prefix="/auth", tags=["Auth"])


# ---------------------------
# Register
# ---------------------------
@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):

    # check if email exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(400, "Email already registered")

    # create user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        age=user_data.age,
        location=user_data.location
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user


# ---------------------------
# Login
# ---------------------------
@router.post("/login")
async def login(email: str, password: str, db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(400, "Invalid email or password")

    if not verify_password(password, user.password_hash):
        raise HTTPException(400, "Invalid email or password")

    token = create_access_token(user.user_id)

    return {"access_token": token, "token_type": "bearer"}
