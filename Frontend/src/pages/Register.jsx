import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Register.css";

const Register = () => {
  const [form, setForm] = useState({
    email: "",
    firstname: "",
    lastname: "",
    password: "",
  });
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
    setForm((f) => ({ ...f, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  const validateForm = () => {
    const newErrors = {};

    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (form.firstname.length < 2) {
      newErrors.firstname = "First name must be at least 2 characters";
    }
    if (form.lastname.length < 2) {
      newErrors.lastname = "Last name must be at least 2 characters";
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
        "http://localhost:3000/api/auth/register",
        {
          fullName: {
            firstName: form.firstname,
            lastName: form.lastname,
          },
          email: form.email,
          password: form.password,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Registration successful:", response.data);

      toast.success("🎉 Registration successful! Welcome aboard!", {
        position: "top-right",
        autoClose: 5000,
        theme: "dark",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
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
        aria-labelledby="register-heading"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h1
            id="register-heading"
            className="text-3xl font-bold bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent"
          >
            Create Account
          </h1>
          <p className="auth-sub-glow text-zinc-400 mt-2">
            Join the future of AI conversations
          </p>
        </header>

        {/* Form Section */}
        <form
          data-testid="register-form"
          className="auth-form-modern"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Email Field */}
          <div className="field-group-glow">
            <label htmlFor="email" className="field-label">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
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

          {/* Name Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="field-group-glow">
              <label htmlFor="firstname" className="field-label">
                First Name
              </label>
              <input
                id="firstname"
                name="firstname"
                placeholder="Jane"
                value={form.firstname}
                onChange={handleChange}
                required
                className="auth-input-modern"
              />
              {errors.firstname && (
                <span className="error-message-glow">{errors.firstname}</span>
              )}
            </div>
            <div className="field-group-glow">
              <label htmlFor="lastname" className="field-label">
                Last Name
              </label>
              <input
                id="lastname"
                name="lastname"
                placeholder="Doe"
                value={form.lastname}
                onChange={handleChange}
                required
                className="auth-input-modern"
              />
              {errors.lastname && (
                <span className="error-message-glow">{errors.lastname}</span>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div className="field-group-glow">
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
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
          Already have an account?{" "}
          <Link to="/login" className="auth-link-glow">
            Sign in
          </Link>
        </p>
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

export default Register;
