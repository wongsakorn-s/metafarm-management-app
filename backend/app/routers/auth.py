from __future__ import annotations

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from .. import models
from ..auth import (
    authenticate_user,
    clear_refresh_cookie,
    get_current_user,
    issue_auth_tokens,
    revoke_refresh_token,
    rotate_refresh_token,
    set_refresh_cookie,
)
from ..database import get_db
from ..schemas import AuthUser, LoginRequest, LoginResponse
from ..settings import get_settings

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()


def build_login_response(user: models.User, access_token: str) -> LoginResponse:
    settings = get_settings()
    return LoginResponse(
        access_token=access_token,
        expires_in_seconds=settings.jwt_expire_minutes * 60,
        refresh_expires_in_seconds=settings.refresh_token_expire_days * 24 * 60 * 60,
    )


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> LoginResponse:
    user = authenticate_user(db, payload.username, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    access_token, refresh_token = issue_auth_tokens(db, user)
    set_refresh_cookie(response, refresh_token)
    return build_login_response(user, access_token)


@router.get("/me", response_model=AuthUser)
def read_current_user(current_user: models.User = Depends(get_current_user)) -> AuthUser:
    return AuthUser.model_validate(current_user)


@router.post("/refresh", response_model=LoginResponse)
def refresh_session(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=settings.refresh_cookie_name),
    db: Session = Depends(get_db),
) -> LoginResponse:
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token cookie")

    user, access_token, new_refresh_token = rotate_refresh_token(db, refresh_token)
    set_refresh_cookie(response, new_refresh_token)
    return build_login_response(user, access_token)


@router.post("/logout")
def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=settings.refresh_cookie_name),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    if refresh_token:
        revoke_refresh_token(db, refresh_token)
    clear_refresh_cookie(response)
    return {"message": "Logged out successfully"}
