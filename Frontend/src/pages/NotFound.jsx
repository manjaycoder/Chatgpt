import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Error.css'; // Shared CSS for pure dark theme

const NotFound = () => {
    // Set pure dark theme on mount (consistent with other pages)
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
    }, []);

    return (
        <div className="error-container">
            <div className="error-card" role="alert" aria-labelledby="error-heading">
                <div className="error-visual">
                    <span className="error-icon">🚫</span>
                    <div className="error-number">404</div>
                </div>
                
                <header className="error-header">
                    <h1 id="error-heading" className="error-title">
                        Oops! Page Not Found
                    </h1>
                    <p className="error-subtitle">
                        It seems like you've wandered into the shadows. The requested page doesn't exist or the request is wrong.
                    </p>
                </header>
                
                <div className="error-actions">
                    <Link to="/" className="error-btn">
                        Go Home
                    </Link>
                </div>
                
                <div className="error-hint">
                    <p>Try navigating from the main menu or <Link to="/register">create an account</Link> if you're new.</p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
