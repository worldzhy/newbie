import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

// ---------------------------------------------------------------------------
// Project-specific configuration — edit these for your backend contract.
// ---------------------------------------------------------------------------

/** Base URL of the API; same-origin by default. */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/** localStorage key of the short-lived access token. */
const ACCESS_TOKEN_KEY = "access-token";

/** localStorage key of the access-token expiry epoch in milliseconds. */
const ACCESS_TOKEN_EXPIRES_AT_KEY = "access-token-expires-at";

/** Endpoint that exchanges the httpOnly refresh cookie for a new access token. */
const REFRESH_PATH = "/auth/refresh-access-token";

/** Paths that must never trigger a silent refresh (would recurse). */
const AUTH_PATH_PATTERN = /^\/auth\//;

/** Refresh this early so business requests never carry an expired token. */
const PROACTIVE_REFRESH_LEAD_MS = 60_000;

/** How often the proactive scheduler checks expiry. */
const PROACTIVE_REFRESH_CHECK_INTERVAL_MS = 30_000;

/**
 * Pause before retrying a failed refresh. When another tab rotates the
 * refresh cookie, its Set-Cookie reaches this tab a moment later; the retry
 * then carries the renewed cookie.
 */
const REFRESH_RETRY_DELAY_MS = 1_500;

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------

export function getAccessToken(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? "";
}

/** Persist token + expiry after login or refresh. */
export function setSession(token: string, expiresInSeconds?: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  if (typeof expiresInSeconds === "number" && expiresInSeconds > 0) {
    window.localStorage.setItem(
      ACCESS_TOKEN_EXPIRES_AT_KEY,
      String(Date.now() + expiresInSeconds * 1000),
    );
  }
}

/** Remove all locally stored session data. */
export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
}

/** Normalized error so callers never depend on the axios error shape. */
export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Hook invoked when the refresh cookie is missing/expired. Wire it to your
 * router (e.g. redirect to the login page); the client itself stays
 * router-agnostic.
 */
let sessionExpiredHandler: (() => void) | null = null;
export function onSessionExpired(handler: () => void): void {
  sessionExpiredHandler = handler;
}

// ---------------------------------------------------------------------------
// Refresh-token rotation
// ---------------------------------------------------------------------------

function isUnauthorized(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

/** One refresh round-trip; persists the renewed token and its expiry. */
async function requestRefreshOnce(): Promise<string | null> {
  const response = await axios.get(`${BASE_URL}${REFRESH_PATH}`, {
    withCredentials: true,
  });
  // Default envelope: { token, tokenExpiresInSeconds }.
  const data = response.data as {
    token?: string;
    tokenExpiresInSeconds?: number;
  };
  if (!data?.token) return null;
  setSession(data.token, data.tokenExpiresInSeconds);
  return data.token;
}

// Shared in-flight refresh. The backend rotates the refresh cookie on every
// call, so concurrent 401s must await the same request instead of issuing
// parallel refreshes that invalidate each other's cookie.
let refreshPromise: Promise<string | null> | null = null;

/** Exchange the httpOnly refresh cookie for a new access token (single-flight). */
function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      return await requestRefreshOnce();
    } catch (firstError) {
      if (!isUnauthorized(firstError)) return null;
      // Possible cross-tab cookie rotation: retry once after a short pause.
      await new Promise((resolve) =>
        setTimeout(resolve, REFRESH_RETRY_DELAY_MS),
      );
      try {
        return await requestRefreshOnce();
      } catch {
        return null;
      }
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ---------------------------------------------------------------------------
// Proactive refresh scheduler (module-level singleton)
// ---------------------------------------------------------------------------

let schedulerTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Start the scheduler that renews the token shortly before expiry. Call once
 * on the client (e.g. in the authenticated layout). Reactive 401 refresh
 * stays as a fallback for laptop sleep / scheduler drift.
 */
export function initProactiveTokenRefresh(): void {
  if (typeof window === "undefined" || schedulerTimer) return;

  const refreshIfDue = (): void => {
    const token = getAccessToken();
    const expiresAt = Number(
      window.localStorage.getItem(ACCESS_TOKEN_EXPIRES_AT_KEY) ?? 0,
    );
    if (
      token &&
      expiresAt &&
      Date.now() >= expiresAt - PROACTIVE_REFRESH_LEAD_MS
    ) {
      void refreshAccessToken();
    }
  };

  // Run immediately (tabs reopened after sleep) and then on an interval.
  refreshIfDue();
  schedulerTimer = setInterval(
    refreshIfDue,
    PROACTIVE_REFRESH_CHECK_INTERVAL_MS,
  );
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  // Within the interceptor chain headers is always an AxiosHeaders instance.
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error?.config as
      | (InternalAxiosRequestConfig & { _retriedAfterRefresh?: boolean })
      | undefined;
    const url: string = original?.url ?? "";
    const canSilentlyRefresh =
      typeof window !== "undefined" &&
      !original?._retriedAfterRefresh &&
      !AUTH_PATH_PATTERN.test(url);

    if (isUnauthorized(error) && original && canSilentlyRefresh) {
      original._retriedAfterRefresh = true;
      const renewed = await refreshAccessToken();
      if (renewed) {
        original.headers.set("Authorization", `Bearer ${renewed}`);
        return api(original);
      }
      // Refresh cookie missing or expired: the session is over.
      clearSession();
      sessionExpiredHandler?.();
    }

    if (axios.isAxiosError(error)) {
      const data = error.response?.data as { message?: string } | undefined;
      throw new ApiError(
        data?.message ?? error.message,
        error.response?.status ?? 0,
        data,
      );
    }
    throw error;
  },
);

// ---------------------------------------------------------------------------
// Typed convenience methods — return the response body directly.
// ---------------------------------------------------------------------------

export const apiClient = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return api.get<unknown, AxiosResponse<T>>(url, config).then((r) => r.data);
  },
  post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return api
      .post<unknown, AxiosResponse<T>>(url, data, config)
      .then((r) => r.data);
  },
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return api
      .put<unknown, AxiosResponse<T>>(url, data, config)
      .then((r) => r.data);
  },
  patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return api
      .patch<unknown, AxiosResponse<T>>(url, data, config)
      .then((r) => r.data);
  },
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return api
      .delete<unknown, AxiosResponse<T>>(url, config)
      .then((r) => r.data);
  },
};
