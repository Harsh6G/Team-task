const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.details = data.errors || [];
    throw error;
  }
  return data;
}
