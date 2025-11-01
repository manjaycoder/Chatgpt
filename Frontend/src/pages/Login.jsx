import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Enhanced theme setup with smooth transitions
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "pure-dark");
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.5s ease-in-out";

    const timer = setTimeout(() => {
      document.body.style.opacity = "1";
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  const validateForm = () => {
    const newErrors = {};

    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          email: form.email,
          password: form.password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Login successful:", response.data);

      // Show success message with Toastify
      toast.success("🎉 Welcome back! Signing you in...", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });

      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate("/Home");
      }, 2000);
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";

      setErrors({ submit: errorMessage });

      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
        theme: "dark",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-zinc-900 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-zinc-800 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-zinc-900 rounded-full blur-3xl opacity-10"></div>
      </div>

      <div
        className="auth-card-glass"
        role="main"
        aria-labelledby="login-heading"
      >
        {/* Header Section */}
        <header className="auth-header-glow text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-zinc-800">
            <svg
              className="w-8 h-8 text-zinc-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </div>
          <h1
            id="login-heading"
            className="text-3xl font-bold bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent"
          >
            Welcome Back
          </h1>
          <p className="auth-sub-glow text-zinc-400 mt-2">
            Sign in to continue your journey
          </p>
        </header>

        {/* Form Section */}
        <form
          data-testid="login-form"
          className="auth-form-modern"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Email Field */}
          <div className="field-group-glow">
            <label htmlFor="login-email" className="field-label">
              Email Address
            </label>
            <div className="relative">
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                disabled={submitting}
                className="auth-input-modern"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="w-5 h-5 text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              </div>
            </div>
            {errors.email && (
              <span className="error-message-glow">{errors.email}</span>
            )}
          </div>

          {/* Password Field */}
          <div className="field-group-glow">
            <label htmlFor="login-password" className="field-label">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                required
                disabled={submitting}
                className="auth-input-modern"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="w-5 h-5 text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            {errors.password && (
              <span className="error-message-glow">{errors.password}</span>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm auth-link-glow hover:text-zinc-200 transition-colors duration-200"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="error-message-glow submit-error-glow text-center py-3">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-btn-primary w-full group relative overflow-hidden"
            disabled={submitting}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-700 to-zinc-800 group-hover:from-zinc-600 group-hover:to-zinc-700 transition-all duration-300"></div>
            <div className="relative flex items-center justify-center space-x-2">
              {submitting ? (
                <>
                  <div className="loading-spinner-modern"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </div>
          </button>
        </form>

        {/* Alternative Auth Link */}
        <p className="auth-alt-glow text-center mt-8">
          Need an account?{" "}
          <Link to="/" className="auth-link-glow">
            Create one
          </Link>
        </p>

        {/* Demo Credentials Hint */}
        <div className="mt-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <p className="text-xs text-zinc-400 text-center">
            💡 <strong>Demo Tip:</strong> Use the same credentials you
            registered with
          </p>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        style={{ zIndex: 9999 }}
        toastStyle={{
          background: "#18181b",
          border: "1px solid #27272a",
          color: "#f4f4f5",
        }}
      />
    </div>
  );
};

export default Login;
