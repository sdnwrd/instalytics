const FASTAPI_URL = process.env.API_BASE_URL!
const INTERNAL_SECRET = process.env.INTERNAL_SECRET!

export async function callFastAPI<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${FASTAPI_URL}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Secret": INTERNAL_SECRET,
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(body.detail ?? `FastAPI error ${res.status}`)
  }
  return res.json() as Promise<T>
}
