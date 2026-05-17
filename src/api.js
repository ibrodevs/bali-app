import Constants from "expo-constants";

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function inferExpoHost() {
  const expoHost =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost ||
    "";

  if (!expoHost) {
    return null;
  }

  return expoHost.split(":")[0];
}

export function resolveApiBaseUrl() {
  const explicitBase = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (explicitBase) {
    return trimTrailingSlash(explicitBase);
  }

  if (typeof window !== "undefined" && window.location?.hostname) {
    return `http://${window.location.hostname}:8000/api/v1`;
  }

  const expoHost = inferExpoHost();
  if (expoHost) {
    return `http://${expoHost}:8000/api/v1`;
  }

  return "https://bali21.pythonanywhere.com/api/v1";
}

export const API_BASE_URL = resolveApiBaseUrl();

export class ApiError extends Error {
  constructor(message, details = null, status = 500) {
    super(message);
    this.name = "ApiError";
    this.details = details;
    this.status = status;
  }
}

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }

  return `${API_BASE_URL}/${path}`;
}

async function parseResponse(response) {
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      data?.error ||
      data?.detail ||
      data?.message ||
      (typeof data === "string" ? data : "Request failed");

    throw new ApiError(message, data, response.status);
  }

  return data;
}

export async function apiRequest(path, options = {}) {
  const { token, language = "en", body, headers = {}, isMultipart = false, ...rest } = options;
  const requestHeaders = {
    Accept: "application/json",
    "X-Language": language,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  if (!isMultipart) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: requestHeaders,
    body: body == null ? undefined : isMultipart ? body : JSON.stringify(body),
  });

  return parseResponse(response);
}
