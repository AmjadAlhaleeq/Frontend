interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl = "http://localhost:3001/api") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const config: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      };

      // Add auth token if available
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Leaderboard APIs - Updated to match backend
  async getLeaderboardByType(type: string): Promise<ApiResponse<any>> {
    return this.request(`/leaderboards/${type}`);
  }

  async getLeaderboard(params?: {
    sortBy?: string;
    order?: "asc" | "desc";
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.order) queryParams.append("order", params.order);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const query = queryParams.toString();
    return this.request(`/leaderboard${query ? `?${query}` : ""}`);
  }

  async updatePlayerStats(
    playerId: string,
    stats: any
  ): Promise<ApiResponse<any>> {
    return this.request(`/players/${playerId}/stats`, {
      method: "PATCH",
      body: JSON.stringify(stats),
    });
  }

  // Pitch APIs
  async getPitches(params?: {
    city?: string;
    type?: "indoor" | "outdoor";
    minPrice?: number;
    maxPrice?: number;
    facilities?: string[];
    availability?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.city) queryParams.append("city", params.city);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.minPrice)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params?.maxPrice)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params?.facilities) {
      params.facilities.forEach((facility) =>
        queryParams.append("facilities", facility)
      );
    }
    if (params?.availability)
      queryParams.append("availability", params.availability);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const query = queryParams.toString();
    return this.request(`/pitches${query ? `?${query}` : ""}`);
  }

  async getPitchById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/pitches/${id}`);
  }

  async createPitch(pitchData: any): Promise<ApiResponse<any>> {
    return this.request("/pitches", {
      method: "POST",
      body: JSON.stringify(pitchData),
    });
  }

  async updatePitch(id: string, pitchData: any): Promise<ApiResponse<any>> {
    return this.request(`/pitches/${id}`, {
      method: "PATCH",
      body: JSON.stringify(pitchData),
    });
  }

  async deletePitch(id: string): Promise<ApiResponse<any>> {
    return this.request(`/pitches/${id}`, {
      method: "DELETE",
    });
  }

  // Booking APIs
  async createBooking(bookingData: {
    pitchId: string;
    userId: string;
    date: string;
    startTime: string;
    endTime: string;
    players: number;
  }): Promise<ApiResponse<any>> {
    return this.request("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  async getUserBookings(userId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/users/${userId}/bookings`);
  }

  async cancelBooking(bookingId: string): Promise<ApiResponse<any>> {
    return this.request(`/bookings/${bookingId}`, {
      method: "DELETE",
    });
  }

  // Reviews APIs
  async createReview(reviewData: {
    pitchId: string;
    userId: string;
    rating: number;
    comment: string;
  }): Promise<ApiResponse<any>> {
    return this.request("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  }

  async getPitchReviews(pitchId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/pitches/${pitchId}/reviews`);
  }
}

export const apiService = new ApiService();
export default ApiService;
