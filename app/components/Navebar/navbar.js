"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaSearch,
  FaPlusCircle,
  FaTh,
  FaUserCircle,
  FaSignInAlt,
  FaUserPlus,
  FaCog,
  FaSignOutAlt,
  FaHome
} from 'react-icons/fa';

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isProfileOpen) setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const closeAll = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    closeAll();
    try {
      localStorage.setItem("logout", Date.now().toString());
    } catch (e) {}
    router.replace("/loginPage");
    router.refresh();
  };

  return (
    <>
      <style jsx global>{`
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .nav-gradient {
          background: linear-gradient(135deg, #2563eb 0%, #14b8a6 100%);
          transition: all 0.3s ease;
        }
        
        .nav-scrolled {
          background: linear-gradient(135deg, #2563eb 0%, #14b8a6 100%) !important;
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
        
        .nav-link-hover {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .nav-link-hover::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: white;
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        
        .nav-link-hover:hover::after {
          width: 80%;
        }
        
        .profile-dropdown {
          animation: fadeIn 0.2s ease-out;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(135deg, #2563eb 0%, #14b8a6 100%);
        }
        
        .profile-dropdown .dropdown-item {
          transition: all 0.2s ease;
          border-radius: 8px;
          margin: 4px;
        }
        
        .profile-dropdown .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateX(4px);
        }
        
        .mobile-menu-dropdown {
          animation: slideDown 0.2s ease-out;
        }
        
        .logo-glow {
          filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.3));
        }
        
        .nav-margin {
          margin-bottom: 5rem;
        }
        
        .nav-content {
          margin-top: 3.5rem;
        }
        
        .btn-profile-hover:hover {
          background: rgba(255, 255, 255, 0.15) !important;
        }
        
        @media (max-width: 768px) {
          .profile-dropdown {
            width: 100% !important;
            right: 0 !important;
          }
        }
        
        /* Mobile optimizations */
        @media (max-width: 991px) {
          .navbar {
            padding-top: 6px !important;
            padding-bottom: 6px !important;
          }
          
          .navbar-brand img {
            width: 70px !important;
            height: 46px !important;
          }
          
          .nav-content {
            margin-top: 2.5rem;
          }
        }
        
        @media (max-width: 576px) {
          .navbar {
            padding-left: 6px !important;
            padding-right: 6px !important;
          }
          
          .navbar-brand img {
            width: 48px !important;
            height: 44px !important;
          }
          
          .mobile-menu-dropdown {
            border-radius: 0 0 12px 12px !important;
          }
          
          .mobile-menu-dropdown .nav-link {
            padding: 10px 12px !important;
            font-size: 0.85rem !important;
          }
          
          .mobile-menu-dropdown .nav-link svg {
            width: 14px !important;
            height: 14px !important;
          }
          
          .profile-dropdown {
            min-width: 210px !important;
            border-radius: 12px !important;
          }
          
          .profile-dropdown .p-4 {
            padding: 12px !important;
          }
          
          .profile-dropdown .py-2 {
            padding-top: 6px !important;
            padding-bottom: 6px !important;
          }
          
          .profile-dropdown .dropdown-item {
            padding: 7px 10px !important;
            font-size: 0.78rem !important;
          }
          
          .btn-profile-hover {
            padding: 6px !important;
          }
          
          .navbar-toggler {
            width: 34px !important;
            height: 34px !important;
            padding: 5px !important;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px !important;
          }

          .navbar-toggler .navbar-toggler-icon {
            width: 18px !important;
            height: 18px !important;
            background-size: 18px 18px;
          }

          .mobile-profile-dropdown {
            left: auto !important;
            right: 8px !important;
            width: min(86vw, 260px) !important;
            border-radius: 14px !important;
            overflow: hidden;
          }

          .mobile-profile-header {
            padding: 12px !important;
          }

          .mobile-profile-avatar {
            width: 34px !important;
            height: 34px !important;
            padding: 0 !important;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px !important;
            flex: 0 0 auto;
          }

          .mobile-profile-avatar svg {
            width: 18px !important;
            height: 18px !important;
          }

          .mobile-profile-title {
            font-size: 0.86rem !important;
            line-height: 1.2;
          }

          .mobile-profile-email,
          .mobile-profile-subtitle {
            font-size: 0.68rem !important;
            line-height: 1.2;
          }

          .mobile-profile-body {
            padding: 6px !important;
          }

          .mobile-profile-item {
            border-bottom: 0 !important;
            border-radius: 10px;
            margin-bottom: 3px;
            padding: 8px 10px !important;
          }

          .mobile-profile-item svg {
            width: 15px !important;
            height: 15px !important;
            margin-right: 10px !important;
          }

          .mobile-profile-action {
            padding: 8px !important;
          }

          .mobile-profile-action .btn {
            min-height: 34px;
            padding: 7px 12px !important;
            font-size: 0.78rem !important;
            border-radius: 10px !important;
          }
        }
      `}</style>

      <nav className={`navbar navbar-expand-lg fixed-top py-2 ${scrolled ? 'nav-scrolled' : 'nav-gradient'} shadow-lg nav-margin`} style={{ zIndex: 1030 }}>
        <div className="container position-relative">
          <Link className="navbar-brand d-flex align-items-center" href="/" onClick={closeAll}>
            <div className="position-relative">
              <img
                src="/images/L.png"
                alt="Lost & Found Logo"
                style={{ width: "90px", height: "84px" }} // smaller for mobile
                className="me-2 logo-glow"
              />
            </div>
          </Link>

          <div className="d-none d-lg-flex align-items-center ms-auto gap-3">
            <ul className="navbar-nav me-3">
              <li className="nav-item">
                <Link className="nav-link px-3 d-flex align-items-center nav-link-hover text-white" href="/" onClick={closeAll}>
                  <FaHome className="me-2" />
                  <span>Home</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3 d-flex align-items-center nav-link-hover text-white" href="/lost" onClick={closeAll}>
                  <FaSearch className="me-2" />
                  <span>Lost</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3 d-flex align-items-center nav-link-hover text-white" href="/found" onClick={closeAll}>
                  <FaPlusCircle className="me-2" />
                  <span>Found</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3 d-flex align-items-center nav-link-hover text-white" href="/browse" onClick={closeAll}>
                  <FaTh className="me-2" />
                  <span>Browse</span>
                </Link>
              </li>
            </ul>

            <div className="position-relative">
              <button
                className="btn  border-2 d-flex align-items-center gap-2 rounded-pill px-3 py-2 btn-profile-hover"
                onClick={toggleProfile}
                aria-expanded={isProfileOpen}
                style={{ 
                  background: isProfileOpen ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
                }}
              >
              <FaUserCircle size={20} style={{color:"white"}} />
               
              </button>

              {isProfileOpen && (
                <div className="profile-dropdown position-absolute end-0 mt-2 text-white" style={{ minWidth: '270px', zIndex: 1040 }}>
                  {user ? (
                    <>
                      <div className="p-4 border-bottom border-white border-opacity-10">
                        <div className="d-flex align-items-center">
                          <div className="bg-white text-primary rounded-circle p-2 me-3">
                            <FaUserCircle size={24} />
                          </div>
                          <div>
                            <strong className="d-block">{user.name || "User"}</strong>
                            <small className="opacity-90">{user.email}</small>
                          </div>
                        </div>
                      </div>
                      <div className="py-2 px-2">
                        <Link href="/userProfile" className="dropdown-item d-flex align-items-center px-3 py-2 text-white" onClick={closeAll}>
                          <FaUserCircle className="me-3" />
                          <div>
                            <div className="fw-medium">My Profile</div>
                            <small className="opacity-75">View your profile</small>
                          </div>
                        </Link>
                        <Link href="/myItems" className="dropdown-item d-flex align-items-center px-3 py-2 text-white" onClick={closeAll}>
                          <FaTh className="me-3" />
                          <div>
                            <div className="fw-medium">My Items</div>
                            <small className="opacity-75">Manage your reports</small>
                          </div>
                        </Link>
                       
                        <div className="dropdown-divider my-1 border-white border-opacity-10"></div>
                        <button
                          className="dropdown-item d-flex align-items-center text-white px-3 py-2 w-100 border-0 bg-transparent"
                          onClick={handleLogout}
                        >
                          <FaSignOutAlt className="me-3" />
                          <div>
                            <div className="fw-medium">Logout</div>
                            <small className="opacity-75">Sign out of account</small>
                          </div>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="py-3 px-4">
                      <div className="text-center mb-3">
                        <div className="bg-white text-primary rounded-circle d-inline-flex p-3 mb-2">
                          <FaUserCircle size={24} />
                        </div>
                        <h6 className="fw-bold mb-1">Welcome!</h6>
                        <p className="opacity-75 small mb-3">Sign in to access all features</p>
                      </div>
                      <div className="d-grid gap-2">
                        <Link href="/loginPage" className="btn btn-light btn-sm rounded-pill text-primary fw-medium" onClick={closeAll}>
                          <FaSignInAlt className="me-2" />
                          Login
                        </Link>
                        <Link href="/signup" className="btn btn-outline-light btn-sm rounded-pill" onClick={closeAll}>
                          <FaUserPlus className="me-2" />
                          Register
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="d-flex d-lg-none align-items-center ms-auto gap-2">
            <button
              className="btn  rounded-circle p-2 btn-profile-hover"
              onClick={toggleProfile}
              aria-expanded={isProfileOpen}
              style={{ 
                background: isProfileOpen ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
              }}
            >
              <FaUserCircle size={18} style={{color:"white"}} />
            </button>

            <button
              className="navbar-toggler navbar-dark"
              type="button"
              onClick={toggleMenu}
            >
              <span className="navbar-toggler-icon"></span>
            </button>

          </div>

         
          {isProfileOpen && (
            <div className="d-lg-none position-absolute top-100 bg-white shadow-lg mobile-menu-dropdown mobile-profile-dropdown" style={{ zIndex: 1040 }}>
              <div className="d-flex flex-column">
                <div className="p-4 border-bottom mobile-profile-header" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #14b8a6 100%)' }}>
                  <div className="d-flex align-items-center text-white">
                    <div className="bg-white text-primary rounded-circle p-2 me-3 mobile-profile-avatar">
                      <FaUserCircle size={24} />
                    </div>
                    <div>
                      <strong className="d-block mobile-profile-title">{user ? (user.name || "User") : "Account"}</strong>
                      {user && <small className="opacity-90 mobile-profile-email">{user.email}</small>}
                    </div>
                  </div>
                </div>

                <div className="flex-grow-1 overflow-auto py-3 mobile-profile-body">
                  {user ? (
                    <>
                      <Link href="/userProfile" className="dropdown-item d-flex align-items-center px-3 py-3 border-bottom mobile-profile-item" onClick={closeAll}>
                        <FaUserCircle className="me-3 text-primary" size={20} />
                        <div>
                          <div className="fw-medium mobile-profile-title">My Profile</div>
                          <small className="text-muted mobile-profile-subtitle">Personal information</small>
                        </div>
                      </Link>
                      <Link href="/myItems" className="dropdown-item d-flex align-items-center px-3 py-3 border-bottom mobile-profile-item" onClick={closeAll}>
                        <FaTh className="me-3 text-primary" size={20} />
                        <div>
                          <div className="fw-medium mobile-profile-title">My Items</div>
                          <small className="text-muted mobile-profile-subtitle">Manage your reports</small>
                        </div>
                      </Link>
                      <div className="p-3 mobile-profile-action">
                        <button
                          className="btn btn-danger w-100 rounded-pill d-flex align-items-center justify-content-center py-2"
                          onClick={handleLogout}
                        >
                          <FaSignOutAlt className="me-2" />
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3">
                      <div className="text-center mb-3">
                        <div className="bg-primary text-white rounded-circle d-inline-flex p-2 mb-2">
                          <FaUserCircle size={28} />
                        </div>
                        <h6 className="fw-bold mb-1 mobile-profile-title">Welcome!</h6>
                        <p className="text-muted small mb-0 mobile-profile-subtitle">Sign in to access all features</p>
                      </div>
                      <div className="d-grid gap-2">
                        <Link href="/loginPage" className="btn btn-primary btn-sm rounded-pill" onClick={closeAll}>
                          <FaSignInAlt className="me-2" />
                          Login
                        </Link>
                        <Link href="/signup" className="btn btn-outline-primary btn-sm rounded-pill" onClick={closeAll}>
                          <FaUserPlus className="me-2" />
                          Register
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          
          {isMenuOpen && (
            <div className="d-lg-none position-absolute top-100 start-0 w-100 bg-white shadow-lg rounded-bottom-3 border-top mobile-menu-dropdown" style={{ zIndex: 1040 }}>
              <ul className="navbar-nav flex-column m-0 p-3">
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center py-3 text-dark" href="/" onClick={closeAll}>
                    <FaHome className="me-3 text-primary" size={18} />
                    <span>Home</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center py-3 text-dark" href="/lost" onClick={closeAll}>
                    <FaSearch className="me-3 text-danger" size={18} />
                    <span>Report Lost Item</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center py-3 text-dark" href="/found" onClick={closeAll}>
                    <FaPlusCircle className="me-3 text-success" size={18} />
                    <span>Report Found Item</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center py-3 text-dark" href="/browse" onClick={closeAll}>
                    <FaTh className="me-3 text-primary" size={18} />
                    <span>Browse Items</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      <div className="nav-content"></div>
    </>
  );
}


