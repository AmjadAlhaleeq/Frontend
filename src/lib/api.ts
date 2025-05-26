
// This file contains functions to interact with the backend API for managing pitches

export const API_BASE_URL = "http://127.0.0.1:3000";

// Fetch all pitches from the backend
export async function fetchPitches() {
  const response = await fetch(`${API_BASE_URL}/pitches`);
  if (!response.ok) throw new Error("Failed to fetch pitches");
  const result = await response.json();
  return result.data?.pitches || result.data?.pitch || [];
}

// Fetch all reservations from the backend
export async function fetchReservations() {
  const response = await fetch(`${API_BASE_URL}/reservations`);
  if (!response.ok) throw new Error("Failed to fetch reservations");
  const result = await response.json();
  return result.data?.reservations || result.data || [];
}

// Delete a pitch by its _id
export const deletePitchById = async (id: string) => {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`http://127.0.0.1:3000/pitches/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok || data.status !== "success") {
    throw new Error(data.message || "Failed to delete pitch");
  }
};

//! help you to handle API calls
