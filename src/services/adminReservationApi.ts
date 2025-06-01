
import { apiRequest, API_BASE_URL } from "./apiConfig";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Delete a reservation
export const deleteReservationApi = async (reservationId: string) => {
  try {
    const response = await apiRequest(`/reservations/${reservationId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (result.status !== "success") {
      throw new Error(result.message || "Failed to delete reservation");
    }

    return result;
  } catch (error) {
    console.error("Delete reservation error:", error);
    throw error;
  }
};

// Enhanced kick player function that properly removes player from reservation
export const kickPlayer = async (
  reservationId: string,
  playerId: string,
  reason: string,
  suspensionDays: number
) => {
  try {
    console.log(
      `Kicking player ${playerId} from reservation ${reservationId} for reason: ${reason}, suspension days: ${suspensionDays}`
    );
    
    // Log the exact body being sent
    const requestBody = {
      userId: playerId,
      reason,
      suspensionDays,
    };
    console.log("Request body for kick:", JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/kick`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Raw error response:", errorText);
      
      let errorMessage = "Failed to kick player";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        // If JSON parsing fails, use the raw text or a default message
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Kick player response:", result);

    if (result.status !== "success") {
      throw new Error(result.message || "Failed to kick player");
    }

    return result;
  } catch (error) {
    console.error("Kick player error:", error);
    throw error;
  }
};

// Add game summary with backend format
export const addGameSummary = async (
  reservationId: string,
  summaryData: {
    mvp?: string;
    players: Array<{
      userId: string;
      played: boolean;
      won: boolean;
      goals?: number;
      assists?: number;
      interceptions?: number;
      cleanSheet?: boolean;
    }>;
    absentees?: Array<{
      userId: string;
      reason: string;
      suspensionDays: number;
    }>;
  }
) => {
  const response = await fetch(
    `${API_BASE_URL}/reservations/${reservationId}/summary`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(summaryData),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add summary");
  }

  const result = await response.json();

  if (result.status !== "success") {
    throw new Error(result.message || "Failed to add summary");
  }

  return result;
};

// Create a reservation with maxPlayers support
export const createReservation = async (reservationData: any) => {
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(reservationData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create reservation");
  }

  const result = await response.json();

  if (result.status !== "success") {
    throw new Error(result.message || "Failed to create reservation");
  }

  return result;
};

// Add user suspension API
export const suspendUser = async (
  userId: string,
  reason: string,
  suspensionDays: number
) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/suspend`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      reason,
      suspensionDays,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to suspend user");
  }

  const result = await response.json();

  if (result.status !== "success") {
    throw new Error(result.message || "Failed to suspend user");
  }

  return result;
};
