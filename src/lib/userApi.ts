import { apiRequest, API_BASE_URL } from "../services/apiConfig";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Backend User type definition
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  age?: number;
  preferredPosition?: string;
  bio?: string;
  profilePicture?: string;
  suspendedUntil?: string;
  badges?: Array<{
    _id: string;
    name: string;
    description: string;
    level: number;
  }>;
  stats?: {
    matches: number;
    wins: number;
    goals: number;
    assists: number;
    cleanSheets: number;
    mvp: number;
    interceptions: number;
  };
}

// Get user's profile
export const getMyProfile = async () => {
  try {
    const response = await apiRequest("/users/me", {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (result.status === "success" && result.data?.user) {
      return result;
    }

    throw new Error(result.message || "Failed to fetch profile");
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Get any user's profile by ID
export const getUserProfile = async (userId: string) => {
  try {
    const response = await apiRequest(`/users/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (result.status === "success" && result.data?.user) {
      return result;
    }

    throw new Error(result.message || "Failed to fetch user profile");
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Update user's profile
export const updateMyProfile = async (
  profileData: Partial<User>,
  profilePictureFile?: File
) => {
  try {
    let response;

    if (profilePictureFile) {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append("profilePicture", profilePictureFile);

      // Add other profile data as individual form fields
      Object.entries(profileData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      });
    } else {
      // Regular JSON update
      response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === "success" && result.data?.user) {
      return result;
    }

    throw new Error(result.message || "Failed to update profile");
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// FIXED: Delete user account and handle logout
export const deleteMyAccount = async () => {
  try {
    const response = await apiRequest("/users/me", {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (result.status === "success") {
      // Clear local storage
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userRole");
      localStorage.removeItem("isLoggedIn");

      // Dispatch logout event to notify navbar and other components
      window.dispatchEvent(new Event("userLoggedOut"));

      return result;
    }

    throw new Error(result.message || "Failed to delete account");
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};

// Transform backend user to frontend format
export const transformUserToFrontend = (backendUser: User) => {
  return {
    id: backendUser._id,
    firstName: backendUser.firstName,
    lastName: backendUser.lastName,
    email: backendUser.email,
    phoneNumber: backendUser.phone,
    city: backendUser.city,
    age: backendUser.age?.toString(),
    position: backendUser.preferredPosition,
    bio: backendUser.bio,
    avatarUrl: backendUser.profilePicture,
    stats: {
      matches: backendUser.stats?.matches || 0,
      goalsScored: backendUser.stats?.goals || 0,
      assists: backendUser.stats?.assists || 0,
      cleanSheets: backendUser.stats?.cleanSheets || 0,
      mvp: backendUser.stats?.mvp || 0,
      wins: backendUser.stats?.wins || 0,
      losses: 0, // optional
      draws: 0, // optional
      goals: backendUser.stats?.goals || 0,
      winPercentage:
        backendUser.stats?.matches > 0
          ? Math.round(
              (backendUser.stats.wins / backendUser.stats.matches) * 100
            )
          : 0,
      interceptions: backendUser.stats?.interceptions || 0,
    },
  };
};

// Get user's bookings/reservations
export const getMyBookings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === "success" && result.data?.reservations) {
      // Filter reservations to show only those the user has joined
      const userId = JSON.parse(localStorage.getItem("user") || "{}")._id;
      const userReservations = result.data.reservations.filter(
        (reservation: any) =>
          reservation.currentPlayers.some(
            (player: any) => player._id === userId
          )
      );

      return {
        status: "success",
        data: {
          reservations: userReservations,
        },
      };
    }

    throw new Error(result.message || "Failed to fetch bookings");
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
};
