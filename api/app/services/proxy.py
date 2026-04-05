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


def rewrite_set_cookie(set_cookie: str, proxy_host: str) -> str:
    """Strip domain from Set-Cookie so it applies to our proxy domain."""
    # Remove domain= attribute so cookie applies to the current host
    set_cookie = re.sub(r";\s*domain=[^;]+", "", set_cookie, flags=re.IGNORECASE)
    # Make cookie accessible (remove HttpOnly for session capture if needed)
    return set_cookie


def rewrite_content(content: bytes, content_type: str, proxy_base: str, token: str = "") -> bytes:
    """Rewrite instagram.com URLs in HTML/JS content to route through our proxy."""
    if not content:
        return content

    ct = content_type.lower()
    is_html = "text/html" in ct
    is_js = "javascript" in ct or "application/json" in ct

    if not (is_html or is_js):
        return content

    try:
        text = content.decode("utf-8", errors="replace")
    except Exception:
        return content

    # Replace Instagram URLs with proxy base
    text = text.replace("https://www.instagram.com", proxy_base)
    text = text.replace("https://instagram.com", proxy_base)
    text = text.replace("http://www.instagram.com", proxy_base)
    text = text.replace("\\/\\/www.instagram.com", proxy_base.replace("https://", "\\/\\/"))

    # Inject token as hidden field into any forms so it survives POST
    if token and is_html:
        text = text.replace(
            "</form>",
            f'<input type="hidden" name="token" value="{token}"></form>',
        )
        # Also append token to form action URLs that go to our proxy
        text = re.sub(
            r'(action="' + re.escape(proxy_base) + r'([^"]*)")',
            lambda m: m.group(0).rstrip('"') + (
                ("&token=" if "?" in m.group(2) else "?token=") + token + '"'
            ) if "token=" not in m.group(0) else m.group(0),
            text,
        )

    return text.encode("utf-8")


async def forward_request(
    request: Request,
    path: str,
    proxy_base: str,
    token: str = "",
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
    # Strip our token param before forwarding to Instagram
    params = {k: v for k, v in request.query_params.items() if k != "token"}

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

    content_type = ig_response.headers.get("content-type", "")

    # Rewrite response content
    rewritten_content = rewrite_content(ig_response.content, content_type, proxy_base, token)

    # Build response headers
    resp_headers: dict[str, str] = {}
    skip_headers = {"transfer-encoding", "content-encoding", "content-length", "content-security-policy"}
    for k, v in ig_response.headers.items():
        if k.lower() in skip_headers:
            continue
        if k.lower() == "location":
            v = rewrite_location(v, proxy_base) or v
        if k.lower() == "set-cookie":
            v = rewrite_set_cookie(v, proxy_base)
        resp_headers[k] = v

    if rewritten_content != ig_response.content:
        resp_headers["content-length"] = str(len(rewritten_content))

    response = Response(
        content=rewritten_content,
        status_code=ig_response.status_code,
        headers=resp_headers,
        media_type=content_type,
    )
    return response, sessionid
