import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./Login.css";
import StudentDuesLookup from "./StudentDuesLookup";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "student">("login");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      sessionStorage.setItem("token", token);
      sessionStorage.setItem(
        "user",
        JSON.stringify({
          id: user.id,
          email: user.email,
          role: user.role,
          department: user.department,
        })
      );

      // Update navigation paths
      if (user.role === "super_admin" || user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "department_operator") {
        navigate("/operator");
      } else if (user.role === "hod") {
        navigate("/hod");
      } else {
        navigate("/student-lookup");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "student") {
    return <StudentDuesLookup />;
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-left">
          <h1 className="login-brand">VNRVJIET</h1>
          <p className="login-brand-sub">
            Empowering Students. Managing Departments. Seamlessly.
          </p>
        </div>

        <div className="login-right">
          <div className="login-card">
            <h2 className="login-header">Welcome Back</h2>
            <p className="login-subtitle">Sign in to access your dashboard</p>
            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="login-input"
                placeholder="your.email@vnrvjiet.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && <p className="login-error">{error}</p>}

              <button type="submit" disabled={loading} className="login-button">
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <button
                type="button"
                className="login-button"
                style={{ marginTop: "12px", backgroundColor: "#6366f1" }}
                onClick={() => setMode("student")}
              >
                Student? Check Your Dues
              </button>
            </form>

            <p className="login-footer">
              © 2025 VNR Vignana Jyothi Institute of Engineering & Technology
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
