import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Register.css'; // Updated import to styles.css

const Register = () => {
    const [form, setForm] = useState({ 
        email: '', 
        firstname: '', 
        lastname: '', 
        password: '' 
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    // Set pure dark theme on mount
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }

    const validateForm = () => {
        const newErrors = {};
        
        // Uncomment for client-side validation if needed
        // if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        //     newErrors.email = 'Please enter a valid email address';
        // }
        // if (form.firstname.length < 2) {
        //     newErrors.firstname = 'First name must be at least 2 characters';
        // }
        // if (form.lastname.length < 2) {
        //     newErrors.lastname = 'Last name must be at least 2 characters';
        // }
        // if (form.password.length < 6) {
        //     newErrors.password = 'Password must be at least 6 characters';
        // }
        
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
            const response = await axios.post("http://localhost:3000/api/auth/register", {
                fullName: {
                    firstName: form.firstname,
                    lastName: form.lastname
                },
                email: form.email,
                password: form.password
            }, {
                withCredentials: true
            });

            console.log('Registration successful:', response.data);
            
            // Show success message with Toastify
            toast.success('Registration successful! Welcome aboard!', {
                position: "top-right",
                autoClose: 5000,
                theme: "dark"
            });
            navigate("/login");
            
        } catch (err) {
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
            console.log(errorMessage, "error for register");
            setErrors({ submit: errorMessage });
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
                theme: "dark"
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="center-min-h-screen">
            <div className="auth-card" role="main" aria-labelledby="register-heading">
                <header className="auth-header">
                    <h1 id="register-heading">Create Account</h1>
                    <p className="auth-sub">Join us and start exploring the future.</p>
                </header>
                
                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="field-group">
                        <label htmlFor="email">Email Address</label>
                        <input 
                            id="email" 
                            name="email" 
                            type="email" 
                            autoComplete="email" 
                            placeholder="you@example.com" 
                            value={form.email} 
                            onChange={handleChange} 
                            required 
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                    
                    <div className="grid-2">
                        <div className="field-group">
                            <label htmlFor="firstname">First Name</label>
                            <input 
                                id="firstname" 
                                name="firstname" 
                                placeholder="Jane" 
                                value={form.firstname} 
                                onChange={handleChange} 
                                required 
                            />
                            {errors.firstname && <span className="error-message">{errors.firstname}</span>}
                        </div>
                        <div className="field-group">
                            <label htmlFor="lastname">Last Name</label>
                            <input 
                                id="lastname" 
                                name="lastname" 
                                placeholder="Doe" 
                                value={form.lastname} 
                                onChange={handleChange} 
                                required 
                            />
                            {errors.lastname && <span className="error-message">{errors.lastname}</span>}
                        </div>
                    </div>
                    
                    <div className="field-group">
                        <label htmlFor="password">Password</label>
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
                        />
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>
                    
                    {errors.submit && (
                        <div className="error-message submit-error">
                            {errors.submit}
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        className="primary-btn" 
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <span className="loading-spinner">⏳</span>
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>
                
                <p className="auth-alt">
                    Already have an account? <Link to="/">Sign in</Link>
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
                style={{ zIndex: 9999 }} // Ensures it appears above the card
            />
        </div>
    );
};

export default Register;
