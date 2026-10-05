// 전 feature 공용 fetch 래퍼 (TRD §4)

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let code = "UNKNOWN";
    let message = res.statusText;
    try {
      const body = await res.json();
      code = body.code ?? code;
      message = body.message ?? message;
    } catch {
      // 응답 바디가 JSON이 아닌 경우 무시
    }
    throw new ApiError(res.status, code, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown, extraHeaders?: Record<string, string>) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body), headers: extraHeaders }),
  patch: <T>(path: string, body?: unknown, extraHeaders?: Record<string, string>) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body), headers: extraHeaders }),
  delete: <T>(path: string, extraHeaders?: Record<string, string>) =>
    request<T>(path, { method: "DELETE", headers: extraHeaders }),
};
