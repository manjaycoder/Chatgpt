import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    
    function handleChange(e) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);

        console.log(form);

        try {
            const response = await fetch("http://localhost:3000/api/auth/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',  // Equivalent to withCredentials: true for cookies/credentials
                body: JSON.stringify({
                    email: form.email,
                    password: form.password
                })
            });

            if (!response.ok) {
                // Throw error for non-2xx responses (e.g., 400, 401)
                const errorData = await response.json().catch(() => ({}));  // Try to parse error body
                throw new Error(errorData.message || `Login failed: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);
            navigate("/Home");
        } catch (err) {
            console.error(err);
            // Optional: Add error state/display here if needed (e.g., setErrors({ submit: err.message }))
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="center-min-h-screen">
            <div className="auth-card" role="main" aria-labelledby="login-heading">
                <header className="auth-header">
                    <h1 id="login-heading">Sign in</h1>
                    <p className="auth-sub">Welcome back. We've missed you.</p>
                </header>
                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="field-group">
                        <label htmlFor="login-email">Email</label>
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
                        />
                    </div>
                    <div className="field-group">
                        <label htmlFor="login-password">Password</label>
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
                        />
                    </div>
                    <button type="submit" className="primary-btn" disabled={submitting}>
                        {submitting ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
                <p className="auth-alt">Need an account? <Link to="/">Create one</Link></p>
            </div>
        </div>
    );
};

export default Login;
