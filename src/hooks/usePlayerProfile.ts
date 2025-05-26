
import { useState } from "react";

export interface BackendUserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  city?: string;
  age?: number;
  preferredPosition?: string;
  bio?: string;
  profilePicture?: string;
  suspendedUntil?: string | null;
  badges?: Array<{ _id: string; name: string; description: string; level: number }>;
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
    setLoading(true);
    setProfile(null);
    setError(null);
    try {
      const resp = await fetch(`http://127.0.0.1:3000/users/${userId}`);
      if (!resp.ok) throw new Error("Network error");
      const json = await resp.json();
      if (json.status === "success" && json.data?.user) {
        setProfile(json.data.user);
      } else {
        setError(json.message || "Error fetching profile");
      }
    } catch (e: any) {
      setError(e.message || "Unknown error");
    }
    setLoading(false);
  };

  return { profile, loading, error, fetchProfile };
};
