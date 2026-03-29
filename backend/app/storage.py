from __future__ import annotations

from pathlib import Path

import httpx

from .settings import settings


def build_supabase_public_url(path: str) -> str:
    base = (settings.supabase_url or "").rstrip("/")
    bucket = settings.supabase_storage_bucket or ""
    return f"{base}/storage/v1/object/public/{bucket}/{path}"


async def upload_supabase_object(path: str, content: bytes, content_type: str) -> str:
    if not settings.supabase_storage_enabled:
        raise RuntimeError("Supabase storage is not configured")

    base = (settings.supabase_url or "").rstrip("/")
    bucket = settings.supabase_storage_bucket or ""
    token = settings.supabase_service_role_key or ""
    upload_url = f"{base}/storage/v1/object/{bucket}/{path}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            upload_url,
            content=content,
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": token,
                "Content-Type": content_type,
                "x-upsert": "false",
            },
        )
        response.raise_for_status()

    return build_supabase_public_url(path)


def save_local_object(path: str, content: bytes) -> str:
    file_path = settings.upload_dir / Path(path)
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_bytes(content)
    return f"/static/uploads/{path.replace('\\', '/')}"
