
import React, { useState } from 'react';

const API_BASE_URL = 'http://127.0.0.1:3000';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgotPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (response.ok && result.status === "success") {
        setStatus("sent");
      } else {
        setStatus("error");
        setError(result.message || "Failed to send reset instructions");
      }
    } catch (err) {
      setStatus("error");
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="email" className="block font-medium">Email address</label>
        <input
          id="email"
          type="email"
          required
          className="input input-bordered w-full px-3 py-2 mb-2 rounded border"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button type="submit" className="btn btn-primary w-full" disabled={status === "loading"}>
          {status === "loading" ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      {status === "sent" && (
        <div className="mt-4 text-green-600">If the email exists, reset instructions have been sent.</div>
      )}
      {status === "error" && error && (
        <div className="mt-4 text-red-500">{error}</div>
      )}
    </div>
  );
};

export default ForgotPassword;
