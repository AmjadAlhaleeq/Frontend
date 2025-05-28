
import { useState } from "react";

export interface BackendUserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  city?: string;
  age?: number;
  preferredPosition?: string;
  bio?: string;
  profilePicture?: string;
  role?: string;
  suspended?: boolean;
  suspendedUntil?: string | null;
  badges?: Array<{ 
    _id: string; 
    name: string; 
    description: string; 
    level: number;
    requiredValue?: number;
  }>;
  stats?: {
    matches: number;
    wins: number;
    mvp: number;
    goals: number;
    assists: number;
    interceptions: number;
    cleanSheets: number;
  };
}

export const usePlayerProfile = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<BackendUserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    if (!userId || userId.length < 10) {
      setError("Invalid user ID");
      return;
    }

    setLoading(true);
    setProfile(null);
    setError(null);
    
    try {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const resp = await fetch(`http://127.0.0.1:3000/users/${userId}`, {
        method: "GET",
        headers,
      });
      
      if (!resp.ok) {
        throw new Error(`Network error: ${resp.status}`);
      }
      
      const json = await resp.json();
      console.log("API Response:", json);
      
      if (json.status === "success" && json.data?.user) {
        setProfile(json.data.user);
      } else {
        setError(json.message || "Error fetching profile");
      }
    } catch (e: any) {
      console.error("Error fetching profile:", e);
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, fetchProfile };
};
