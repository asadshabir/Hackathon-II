"""
Authentication service for password hashing and JWT token management.
"""

import uuid
from datetime import datetime, timedelta

import bcrypt
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from src.config import get_settings
from src.models import User, UserCreate

settings = get_settings()


def hash_password(password: str) -> str:
    """Hash a password using bcrypt directly. Truncate to 72 bytes to comply with bcrypt limits."""
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]

    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    password_bytes = plain_password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]

    return bcrypt.checkpw(password_bytes, hashed_password.encode('utf-8'))


def create_access_token(user_id: uuid.UUID) -> str:
    """
    Create a JWT access token for a user.

    Args:
        user_id: The user's UUID

    Returns:
        Encoded JWT token string
    """
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access",
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> uuid.UUID | None:
    """
    Decode and validate a JWT access token.

    Args:
        token: The JWT token string

    Returns:
        User UUID if valid, None otherwise
    """
    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        user_id_str = payload.get("sub")
        if user_id_str is None:
            return None
        return uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        return None


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    """Get a user by email address."""
    statement = select(User).where(User.email == email)
    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def get_user_by_id(session: AsyncSession, user_id: uuid.UUID) -> User | None:
    """Get a user by ID."""
    statement = select(User).where(User.id == user_id)
    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def create_user(session: AsyncSession, user_data: UserCreate) -> User:
    """
    Create a new user account.

    Args:
        session: Database session
        user_data: User creation data (email, password)

    Returns:
        Created User object
    """
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email.lower().strip(),
        hashed_password=hashed_password,
    )
    session.add(user)
    await session.flush()
    await session.refresh(user)
    return user


async def authenticate_user(
    session: AsyncSession, email: str, password: str
) -> User | None:
    """
    Authenticate a user with email and password.

    Args:
        session: Database session
        email: User's email
        password: Plain text password

    Returns:
        User if authentication successful, None otherwise
    """
    user = await get_user_by_email(session, email.lower().strip())
    if user is None:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
