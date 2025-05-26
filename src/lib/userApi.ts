
const API_BASE_URL = 'http://127.0.0.1:3000';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};

// Helper function to get headers with auth
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to get headers for file upload
const getFileUploadHeaders = () => {
  const token = getAuthToken();
  return {
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export interface UserStats {
  matches: number;
  wins: number;
  mvp: number;
  goals: number;
  assists: number;
  interceptions: number;
  cleanSheets: number;
}

export interface UserBadge {
  _id: string;
  name: string;
  description: string;
  level: number;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  age: number;
  preferredPosition?: string;
  bio?: string;
  profilePicture?: string;
  stats: UserStats;
  badges: UserBadge[];
  suspendedUntil?: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  message?: string;
  data?: T;
  results?: number;
}

// GET my profile
export const getMyProfile = async (): Promise<ApiResponse<{ user: User }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

// PATCH update my profile
export const updateMyProfile = async (updates: Partial<User>, profilePicture?: File): Promise<ApiResponse<{ user: User }>> => {
  try {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof User] !== undefined && key !== 'profilePicture') {
        formData.append(key, String(updates[key as keyof User]));
      }
    });

    // Add profile picture if provided
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PATCH',
      headers: getFileUploadHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update profile: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// DELETE my profile
export const deleteMyProfile = async (): Promise<ApiResponse<{}>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete profile: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
};

// GET my bookings
export const getMyBookings = async (): Promise<ApiResponse<{ reservations: any[] }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/bookings`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

// GET user by ID
export const getUserById = async (userId: string): Promise<ApiResponse<{ user: User }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

// Transform backend user data to frontend format
export const transformUserToFrontend = (backendUser: User) => {
  return {
    id: backendUser._id,
    firstName: backendUser.firstName,
    lastName: backendUser.lastName,
    email: backendUser.email,
    phone: backendUser.phone,
    phoneNumber: backendUser.phone,
    city: backendUser.city,
    age: backendUser.age.toString(),
    position: backendUser.preferredPosition || '',
    bio: backendUser.bio || '',
    avatarUrl: backendUser.profilePicture || '',
    profilePicture: backendUser.profilePicture || '',
    stats: {
      gamesPlayed: backendUser.stats.matches,
      wins: backendUser.stats.wins,
      goals: backendUser.stats.goals,
      goalsScored: backendUser.stats.goals,
      assists: backendUser.stats.assists,
      cleansheets: backendUser.stats.cleanSheets,
      mvps: backendUser.stats.mvp,
      losses: Math.max(0, backendUser.stats.matches - backendUser.stats.wins),
      draws: 0, // Not available in backend
      matchesPlayed: backendUser.stats.matches,
      winPercentage: backendUser.stats.matches > 0 ? 
        parseFloat(((backendUser.stats.wins / backendUser.stats.matches) * 100).toFixed(1)) : 0
    },
    badges: backendUser.badges || [],
    suspendedUntil: backendUser.suspendedUntil
  };
};
