import { useState } from "react";

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Read values directly from form
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = "/manage";
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label htmlFor="email" style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            fontSize: "1rem",
          }}
        />
      </div>
      <div>
        <label htmlFor="password" style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            fontSize: "1rem",
          }}
        />
      </div>
      {error && <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="button"
        style={{ width: "100%", opacity: loading ? 0.7 : 1 }}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
