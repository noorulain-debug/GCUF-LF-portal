"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
 
} from "react-icons/fa";

export default function ProfessionalLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const login = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsLoading(true);

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, rememberMe }),
     

    });

    if (res.ok) {
      router.replace("/");
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.message || "Login Failed. Please check your credentials.");
    }
  } catch (error) {
    toast.error("Network error. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      login(e);
    }
  };

  return (
    <>
      <style jsx global>{`
        .login-gradient-bg {
          background: linear-gradient(135deg, #2563eb 0%, #14b8a6 100%);
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }
        
        .login-gradient-bg::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 2px, transparent 2px);
          background-size: 60px 60px;
          opacity: 0.3;
          animation: float 20s linear infinite;
        }
        
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(-50px, -50px) rotate(360deg); }
        }
        
        .login-card {
          backdrop-filter: blur(15px);
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(37, 99, 235, 0.2);
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(37, 99, 235, 0.15);
          transition: all 0.3s ease;
        }
        
        .login-card:hover {
          box-shadow: 0 35px 70px rgba(37, 99, 235, 0.25);
        }
        
        .login-input {
          border: 2px solid rgba(37, 99, 235, 0.1);
          border-radius: 12px;
          padding: 7px 8px;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
        }
        
        .login-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
          outline: none;
        }
        
        .login-input-icon {
          border: 2px solid rgba(37, 99, 235, 0.1);
          background: rgba(255, 255, 255, 0.9);
          color: #2563eb;
        }
        
        .login-btn {
          background: linear-gradient(135deg, #2563eb 0%, #14b8a6 100%);
          border: none;
          border-radius: 12px;
          padding: 10px;
          font-weight: 600;
          color: white;
          transition: all 0.3s ease;
        }
        
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
        }
        
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .form-check-input:checked {
          background-color: #2563eb;
          border-color: #2563eb;
        }
        
        .form-check-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 0.25rem rgba(37, 99, 235, 0.25);
        }
        
        .text-primary {
          color: #2563eb !important;
        }
        
        .text-secondary {
          color: #0f766e !important;
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .brand-logo {
          filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.3));
        }
        
        .password-toggle-btn {
          background: rgba(255, 255, 255, 0.9) !important;
          border: 2px solid rgba(37, 99, 235, 0.1) !important;
          color: #2563eb !important;
        }
        
        .password-toggle-btn:hover {
          background: rgba(37, 99, 235, 0.05) !important;
          border-color: #2563eb !important;
        }
        
        /* Mobile Responsive Styles - COMPACT */
        @media (max-width: 576px) {
          .login-gradient-bg {
            padding: 12px !important;
          }
          
          .login-card {
            padding: 1.25rem !important;
            border-radius: 12px !important;
          }
          
          .login-card h5 {
            font-size: 1.1rem !important;
          }
          
          .login-card p {
            font-size: 0.8rem !important;
          }
          
          .form-label {
            font-size: 0.75rem !important;
            margin-bottom: 4px !important;
          }
          
          .login-input {
            padding: 10px 12px !important;
            font-size: 12px !important;
            border-radius: 8px !important;
          }
          
          .input-group-text {
            padding: 10px 12px !important;
          }
          
          .login-btn {
            padding: 10px !important;
            font-size: 0.9rem !important;
            border-radius: 8px !important;
          }
          
          .text-center p,
          .text-center small {
            font-size: 0.75rem !important;
          }
          
          .mb-3 {
            margin-bottom: 0.75rem !important;
          }
          
          .py-3 {
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
          }
          
          .form-check-label {
            font-size: 0.75rem !important;
          }
        }
        
        /* Safe area padding for notched devices */
        @supports (padding: env(safe-area-inset-top)) {
          .login-gradient-bg {
            padding-top: max(0.75rem, env(safe-area-inset-top)) !important;
            padding-bottom: max(0.75rem, env(safe-area-inset-bottom)) !important;
          }
        }
      `}</style>

      <div className="login-gradient-bg d-flex align-items-center justify-content-center fade-in">
        <div className="container py-3">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6 col-xl-4">
              <div className="text-center mb-3">
                
                <p className="text-white opacity-90">Sign in to continue to your account</p>
              </div>
              
              <div className="login-card p-4 p-md-5 fade-in" style={{ animationDelay: '0.1s' }}>
               
                <form onSubmit={login}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-medium d-flex align-items-center" style={{ color: '#2563eb' }}>
                      <FaEnvelope className="me-2" size={14} />
                      Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text login-input-icon border-end-0">
                        <FaEnvelope size={16} />
                      </span>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className={`form-control login-input border-start-0 ${errors.email ? "is-invalid" : ""}`}
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                        onKeyPress={handleKeyPress}
                        autoComplete="email"
                        required
                      />
                    </div>
                    {errors.email && (
                      <div className="invalid-feedback d-block mt-2" style={{ color: '#ef4444' }}>
                        {errors.email}
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-medium d-flex align-items-center" style={{ color: '#2563eb' }}>
                      <FaLock className="me-2" size={14} />
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text login-input-icon border-end-0">
                        <FaLock size={16} />
                      </span>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className="form-control login-input border-start-0 border-end-0"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="input-group-text password-toggle-btn border-start-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="rememberMe" style={{ color: '#0f766e' }}>
                        Remember me on this device
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn login-btn w-100 py-3 mb-2 fw-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <div className="text-center mt-3">
                    <p className="mb-2" style={{ color: '#0f766e' }}>
                      Don&apos;t have an account?{" "}
                      <a href="/signup" className="fw-bold text-decoration-none" style={{ color: '#2563eb' }}>
                        Sign up
                      </a>
                    </p>
                  </div>
                </form>
              </div>
              
              <div className="text-center mt-3">
                <p className="small text-white opacity-80 mb-2">
                  By continuing, you agree to our{" "}
                  <a href="/terms" className="text-white text-decoration-none">Terms of Service</a>
                  {" "}and{" "}
                  <a href="/privacy" className="text-white text-decoration-none">Privacy Policy</a>
                </p>
                <p className="small text-white opacity-60">
                  © {new Date().getFullYear()} GCUF Lost & Found Hub. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


