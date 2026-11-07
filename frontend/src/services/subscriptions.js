// Subscription/admin routes run on the Render API service that owns their database.
const API_URL = import.meta.env.VITE_API_URL || "https://interviewiq-api-3ww1.onrender.com";

export const subscriptionPlans = {
  starter: {
    name: "InterviewIQ Starter",
    category: "Interview and resume preparation",
    listPrice: 199,
    discountPercent: 40,
    amount: 119.4,
    duration: "30 days",
    features: [
      "Company-specific interview preparation",
      "Resume review and improvement guidance",
      "Interview practice with AI feedback",
      "Progress tracking for your preparation",
    ],
  },
  plus: {
    name: "InterviewIQ Plus",
    category: "Interview, resume, and coding preparation",
    listPrice: 299,
    discountPercent: 50,
    amount: 149.5,
    duration: "30 days",
    features: [
      "Everything in Starter",
      "Coding practice and technical preparation",
      "Expanded company-specific preparation paths",
      "Interview feedback and progress tracking",
    ],
  },
};

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "Request failed. Please try again.");
  return data;
}

export async function submitDemoPayment(payload) {
  const response = await fetch(`${API_URL}/subscriptions/demo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return readResponse(response);
}

export async function loadSubscriptionStatus(paymentReference) {
  const response = await fetch(
    `${API_URL}/subscriptions/status/${encodeURIComponent(paymentReference)}`,
  );
  return readResponse(response);
}

export async function loadAdminSubscriptions(adminPassword) {
  const response = await fetch(`${API_URL}/admin/subscriptions`, {
    headers: { "X-Admin-Password": adminPassword },
  });
  return readResponse(response);
}

export async function loadAdminOverview(adminPassword) {
  const response = await fetch(`${API_URL}/admin/overview`, {
    headers: { "X-Admin-Password": adminPassword },
  });
  return readResponse(response);
}

export async function loadAdminUsers(adminPassword, search = "") {
  const response = await fetch(`${API_URL}/admin/users?search=${encodeURIComponent(search)}`, {
    headers: { "X-Admin-Password": adminPassword },
  });
  return readResponse(response);
}

export async function activateSubscription(id, adminPassword) {
  const response = await fetch(`${API_URL}/admin/subscriptions/${id}/activate`, {
    method: "POST",
    headers: { "X-Admin-Password": adminPassword },
  });
  return readResponse(response);
}

export async function rejectSubscription(id, adminPassword) {
  const response = await fetch(`${API_URL}/admin/subscriptions/${id}/reject`, {
    method: "POST",
    headers: { "X-Admin-Password": adminPassword },
  });
  return readResponse(response);
}

export async function revokeSubscription(id, adminPassword) {
  const response = await fetch(`${API_URL}/admin/subscriptions/${id}/revoke`, {
    method: "POST",
    headers: { "X-Admin-Password": adminPassword },
  });
  return readResponse(response);
}

