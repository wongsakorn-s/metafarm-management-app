from __future__ import annotations

from datetime import UTC, datetime, timedelta
import base64
import hashlib
import hmac
import secrets
import uuid

import jwt
from fastapi import Depends, HTTPException, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from . import models
from .database import get_db
from .settings import get_settings

ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"
PASSWORD_HASH_ALGORITHM = "pbkdf2_sha256"
PASSWORD_HASH_ITERATIONS = 390000

bearer_scheme = HTTPBearer(auto_error=False)


def utcnow() -> datetime:
    return datetime.now(UTC)


def to_utc_datetime(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_HASH_ITERATIONS)
    return "$".join(
        [
            PASSWORD_HASH_ALGORITHM,
            str(PASSWORD_HASH_ITERATIONS),
            base64.urlsafe_b64encode(salt).decode("utf-8"),
            base64.urlsafe_b64encode(derived_key).decode("utf-8"),
        ]
    )


def verify_password(password: str, password_hash: str) -> bool:
    try:
        algorithm, iterations_raw, salt_raw, digest_raw = password_hash.split("$", maxsplit=3)
        if algorithm != PASSWORD_HASH_ALGORITHM:
            return False
        salt = base64.urlsafe_b64decode(salt_raw.encode("utf-8"))
        expected_digest = base64.urlsafe_b64decode(digest_raw.encode("utf-8"))
        derived_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, int(iterations_raw))
    except (ValueError, TypeError):
        return False

    return hmac.compare_digest(derived_key, expected_digest)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_access_token(user: models.User) -> str:
    settings = get_settings()
    issued_at = utcnow()
    expires_at = utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": str(user.id),
        "username": user.username,
        "role": user.role.value,
        "type": ACCESS_TOKEN_TYPE,
        "jti": str(uuid.uuid4()),
        "iat": issued_at,
        "exp": expires_at,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(user: models.User) -> tuple[str, str, datetime]:
    settings = get_settings()
    expires_at = utcnow() + timedelta(days=settings.refresh_token_expire_days)
    token_jti = str(uuid.uuid4())
    payload = {
        "sub": str(user.id),
        "username": user.username,
        "role": user.role.value,
        "type": REFRESH_TOKEN_TYPE,
        "jti": token_jti,
        "exp": expires_at,
    }
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return token, token_jti, expires_at


def decode_token(token: str) -> dict:
    settings = get_settings()
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def authenticate_user(db: Session, username: str, password: str) -> models.User | None:
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or not user.is_active:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def persist_refresh_token(
    db: Session,
    user: models.User,
    refresh_token: str,
    token_jti: str,
    expires_at: datetime,
) -> models.RefreshToken:
    db_token = models.RefreshToken(
        user_id=user.id,
        token_jti=token_jti,
        token_hash=hash_token(refresh_token),
        expires_at=expires_at,
    )
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token


def issue_auth_tokens(db: Session, user: models.User) -> tuple[str, str]:
    access_token = create_access_token(user)
    refresh_token, token_jti, expires_at = create_refresh_token(user)
    persist_refresh_token(db, user, refresh_token, token_jti, expires_at)
    return access_token, refresh_token


def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=refresh_token,
        httponly=True,
        secure=settings.refresh_cookie_secure,
        samesite=settings.refresh_cookie_samesite,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        path="/api/auth",
    )


def clear_refresh_cookie(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(
        key=settings.refresh_cookie_name,
        httponly=True,
        secure=settings.refresh_cookie_secure,
        samesite=settings.refresh_cookie_samesite,
        path="/api/auth",
    )


def revoke_refresh_token(db: Session, refresh_token: str) -> None:
    payload = decode_token(refresh_token)
    if payload.get("type") != REFRESH_TOKEN_TYPE:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    token_jti = payload.get("jti")
    db_token = db.query(models.RefreshToken).filter(models.RefreshToken.token_jti == token_jti).first()
    if not db_token or db_token.revoked_at is not None:
        return

    db_token.revoked_at = utcnow()
    db.commit()


def rotate_refresh_token(db: Session, refresh_token: str) -> tuple[models.User, str, str]:
    payload = decode_token(refresh_token)
    if payload.get("type") != REFRESH_TOKEN_TYPE:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    token_jti = payload.get("jti")
    user_id = int(payload["sub"])
    db_token = db.query(models.RefreshToken).filter(models.RefreshToken.token_jti == token_jti).first()
    if not db_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token not recognized")
    if db_token.revoked_at is not None or to_utc_datetime(db_token.expires_at) <= utcnow():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token has been revoked")
    if not hmac.compare_digest(db_token.token_hash, hash_token(refresh_token)):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token mismatch")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is inactive")

    db_token.revoked_at = utcnow()
    db.commit()
    access_token, new_refresh_token = issue_auth_tokens(db, user)
    return user, access_token, new_refresh_token


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_token(credentials.credentials)
    if payload.get("type") != ACCESS_TOKEN_TYPE:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token")

    user = db.query(models.User).filter(models.User.id == int(payload["sub"])).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is inactive")
    return user


def require_write_access(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    return current_user


def ensure_bootstrap_admin(db: Session) -> None:
    settings = get_settings()
    existing_user = db.query(models.User).filter(models.User.username == settings.admin_username).first()
    if existing_user:
        return

    admin_user = models.User(
        username=settings.admin_username,
        password_hash=hash_password(settings.admin_password),
        full_name="MetaFarm Administrator",
        role=models.UserRole.ADMIN,
        is_active=True,
    )
    db.add(admin_user)
    db.commit()
