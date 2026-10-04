const JSON_HEADERS = {
  "Content-Type": "application/json"
};

const BACKEND_BASE_PATH = "/api/v1";
let accessToken = null;

export function setAccessToken(token) { accessToken = token || null; }

async function refreshAccessToken() {
  const response = await fetch(`${BACKEND_BASE_PATH}/auth/refresh`, { method: "POST", credentials: "include" });
  if (!response.ok) { accessToken = null; return false; }
  const payload = await response.json();
  accessToken = payload.accessToken;
  return true;
}

async function request(path, options = {}, retry = true) {
  const headers = {
    ...(options.body ? JSON_HEADERS : {}),
    ...(options.headers || {})
  };
  if (accessToken && !headers.Authorization) headers.Authorization = `Bearer ${accessToken}`;
  let response = await fetch(path, {
    credentials: "include",
    ...options,
    headers
  });

  if (response.status === 401 && retry && accessToken && !path.endsWith("/auth/refresh")) {
    if (await refreshAccessToken()) return request(path, options, false);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.message || payload?.error || "Request failed";
    throw new Error(message);
  }

  if (payload?.accessToken) accessToken = payload.accessToken;

  return payload;
}

export const api = {
  getSession: async () => {
    if (!accessToken && !(await refreshAccessToken())) return { authenticated: false };
    return request(`${BACKEND_BASE_PATH}/auth/session`);
  },
  loginWithPassword: (body) =>
    request(`${BACKEND_BASE_PATH}/auth/password/login`, {
      method: "POST",
      body: JSON.stringify(body)
    }),
  configureTelegramCredentials: (body) =>
    request(`${BACKEND_BASE_PATH}/auth/password/telegram-setup`, { method: "POST", body: JSON.stringify(body) }),
  registerWithPassword: (body) =>
    request(`${BACKEND_BASE_PATH}/auth/password/register`, {
      method: "POST",
      body: JSON.stringify(body)
    }),
  requestPasswordReset: (body) =>
    request(`${BACKEND_BASE_PATH}/auth/password/reset/request`, {
      method: "POST",
      body: JSON.stringify(body)
    }),
  confirmPasswordReset: (body) =>
    request(`${BACKEND_BASE_PATH}/auth/password/reset/confirm`, {
      method: "POST",
      body: JSON.stringify(body)
    }),
  logout: async () => {
    try { await request(`${BACKEND_BASE_PATH}/auth/logout`, {
      method: "POST"
    }); } finally { accessToken = null; }
  },
  createTelegramInvite: () => request(`${BACKEND_BASE_PATH}/admin/telegram/invites`, { method: "POST" }),
  listTelegramClaims: () => request(`${BACKEND_BASE_PATH}/admin/telegram/claims`),
  approveTelegramClaim: (id) => request(`${BACKEND_BASE_PATH}/admin/telegram/claims/${id}/approve`, { method: "POST" }),
  rejectTelegramClaim: (id) => request(`${BACKEND_BASE_PATH}/admin/telegram/claims/${id}/reject`, { method: "POST" }),
  revokeTelegramInvite: (id) => request(`${BACKEND_BASE_PATH}/admin/telegram/invites/${id}/revoke`, { method: "POST" }),
  getProfile: () => request(`${BACKEND_BASE_PATH}/profile`),
  updateProfile: (body) =>
    request(`${BACKEND_BASE_PATH}/profile`, {
      method: "PUT",
      body: JSON.stringify(body)
    }),
  listExpenses: (query = "") => request(`${BACKEND_BASE_PATH}/expenses${query}`),
  createExpense: (body) =>
    request(`${BACKEND_BASE_PATH}/expenses`, {
      method: "POST",
      body: JSON.stringify(body)
    }),
  updateExpense: (id, body) =>
    request(`${BACKEND_BASE_PATH}/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    }),
  deleteExpense: (id) =>
    request(`${BACKEND_BASE_PATH}/expenses/${id}`, {
      method: "DELETE"
    }),
  listCategories: () => request(`${BACKEND_BASE_PATH}/categories`),
  createCategory: (body) =>
    request(`${BACKEND_BASE_PATH}/categories`, {
      method: "POST",
      body: JSON.stringify(body)
    }),
  updateCategory: (id, body) =>
    request(`${BACKEND_BASE_PATH}/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    }),
  getBudgets: (month) => request(`${BACKEND_BASE_PATH}/budgets?month=${month}`),
  createBudget: (body) =>
    request(`${BACKEND_BASE_PATH}/budgets`, {
      method: "POST",
      body: JSON.stringify(body)
    }),
  getMonthlySummary: (month) => request(`${BACKEND_BASE_PATH}/analytics/monthly-summary?month=${month}`),
  getCategorySummary: (month) => request(`${BACKEND_BASE_PATH}/analytics/category-summary?month=${month}`),
  getTrend: (from, to) => request(`${BACKEND_BASE_PATH}/analytics/trend?from=${from}&to=${to}`),
  listApiKeys: () => request(`${BACKEND_BASE_PATH}/api-keys`),
  createApiKey: (body) =>
    request(`${BACKEND_BASE_PATH}/api-keys`, {
      method: "POST",
      body: JSON.stringify(body)
    }),
  revokeApiKey: (id) =>
    request(`${BACKEND_BASE_PATH}/api-keys/${id}`, {
      method: "DELETE"
    })
};
