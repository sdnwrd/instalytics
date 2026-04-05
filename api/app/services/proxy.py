import re
from typing import Optional

import httpx
from fastapi import Request, Response

INSTAGRAM_BASE = "https://www.instagram.com"


def rewrite_location(location: Optional[str], proxy_base: str) -> Optional[str]:
    """Replace instagram.com with our proxy domain in redirect Location headers."""
    if location is None:
        return None
    return location.replace(INSTAGRAM_BASE, proxy_base).replace(
        "https://instagram.com", proxy_base
    )


def extract_sessionid_from_set_cookie(set_cookie: str) -> Optional[str]:
    """Extract sessionid value from a Set-Cookie header string."""
    match = re.search(r"sessionid=([^;]+)", set_cookie)
    return match.group(1) if match else None


async def forward_request(
    request: Request,
    path: str,
    proxy_base: str,
) -> tuple[Response, Optional[str]]:
    """
    Forward an incoming request to instagram.com.
    Returns (response, sessionid) where sessionid is set if Instagram returned one.
    """
    target_url = f"{INSTAGRAM_BASE}/{path.lstrip('/')}"

    # Build forwarded headers — replace Host with instagram's host
    forward_headers = {
        k: v
        for k, v in request.headers.items()
        if k.lower() not in ("host", "x-internal-secret", "x-forwarded-for")
    }
    forward_headers["host"] = "www.instagram.com"

    body = await request.body()
    params = dict(request.query_params)

    async with httpx.AsyncClient(follow_redirects=False, timeout=30.0) as client:
        ig_response = await client.request(
            method=request.method,
            url=target_url,
            headers=forward_headers,
            content=body,
            params=params,
        )

    # Extract sessionid from Set-Cookie if present
    sessionid: Optional[str] = None
    set_cookie_header = ig_response.headers.get("set-cookie", "")
    if set_cookie_header:
        sessionid = extract_sessionid_from_set_cookie(set_cookie_header)

    # Build response headers — rewrite Location, remove Transfer-Encoding
    resp_headers: dict[str, str] = {}
    skip_headers = {"transfer-encoding", "content-encoding", "content-length"}
    for k, v in ig_response.headers.items():
        if k.lower() in skip_headers:
            continue
        if k.lower() == "location":
            v = rewrite_location(v, proxy_base) or v
        resp_headers[k] = v

    response = Response(
        content=ig_response.content,
        status_code=ig_response.status_code,
        headers=resp_headers,
        media_type=ig_response.headers.get("content-type"),
    )
    return response, sessionid
