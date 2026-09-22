const API_URL =
  "https://pfawuqu0j2.execute-api.eu-central-1.amazonaws.com/develop";

const xApiKey = process.env.REACT_APP_API_KEY;

const getHeaders = () => {
  if (!xApiKey) {
    throw new Error("REACT_APP_API_KEY is not configured");
  }
  return {
    "x-api-key": xApiKey,
  };
};

export const checkAuth = async () => {
  const response = await fetch(`${API_URL}/ping`, {
    method: "GET",
    credentials: "include",
    headers: getHeaders(),
  });
  if (response.status === 200) {
    return true;
  }
  if (response.status === 401) {
    return false;
  }

  throw new Error(`Authentication check failed: ${response.status}`);
};

export const login = async (username, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });
  if (response.status === 200) {
    return { success: true };
  }
  if (response.status === 403) {
    return {
      success: false,
      error: "INVALID_CREDENTIALS",
    };
  }
  if (!response.ok) {
    return { success: false, error: "SERVER_ERROR", status: response.status };
  }
  return { success: false, error: "UNKNOWN_ERROR" };
};

export const getPayments = async () => {
  const response = await fetch(`${API_URL}/payments`, {
    method: "GET",
    credentials: "include",
    headers: getHeaders(),
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch payments");
  }

  const text = await response.text();
  if (!text.trim()) {
    return "empty";
  }
  return JSON.parse(text);
};

export const createPayment = async (payment) => {
  const response = await fetch(`${API_URL}/payments`, {
    method: "POST",
    credentials: "include",
    headers: getHeaders(),
    body: JSON.stringify(payment),
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to create payment");
  }

  const text = await response.text();
  if (!text.trim()) {
    return "empty";
  }

  return JSON.parse(text);
};

export const updatePayment = async (id, payment) => {
  const response = await fetch(`${API_URL}/payments?id=${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: getHeaders(),
    body: JSON.stringify(payment),
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to update payment");
  }

  const text = await response.text();
  if (!text.trim()) {
    return "empty";
  }

  return JSON.parse(text);
};

export const deletePayment = async (id) => {
  const response = await fetch(`${API_URL}/payments?id=${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: getHeaders(),
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to delete payment");
  }

  const text = await response.text();
  if (!text.trim()) {
    return "empty";
  }

  return JSON.parse(text);
};

export const getPaymentTypes = async () => {
  const response = await fetch(`${API_URL}/payment-types`, {
    method: "GET",
    credentials: "include",
    headers: getHeaders(),
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch payment types");
  }

  const text = await response.text();
  if (!text.trim()) {
    return "empty";
  }
  return JSON.parse(text);
};
