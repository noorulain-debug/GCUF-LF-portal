"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaHome,
  FaSearch,
  FaPlusCircle,
  FaTh,
  FaUser,
} from "react-icons/fa";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showAddMenu, setShowAddMenu] = useState(false);

  const navItems = [
    { href: "/", icon: FaHome, label: "Home" },
    { href: "/browse", icon: FaTh, label: "Browse" },
    { href: "#add", icon: FaPlusCircle, label: "Report", isAction: true },
    { href: "/myItems", icon: FaSearch, label: "My Items" },
    { href: "/userProfile", icon: FaUser, label: "Profile" },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    setShowAddMenu(!showAddMenu);
  };

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setShowAddMenu(false);
    router.push(href);
  };

  return (
    <>
      <style jsx global>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid rgba(37, 99, 235, 0.1);
          box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
          z-index: 1040;
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        .bottom-nav-container {
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 52px;
          max-width: 400px;
          margin: 0 auto;
          padding: 0 4px;
        }

        .nav-item-bottom {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: #9ca3af;
          padding: 4px 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
          min-width: 48px;
          position: relative;
        }

        .nav-item-bottom.active {
          color: #2563eb;
        }

        .nav-item-bottom.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          background: linear-gradient(135deg, #2563eb 0%, #14b8a6 100%);
          border-radius: 2px 2px 0 0;
        }

        .nav-item-bottom:active {
          transform: scale(0.92);
          background: rgba(37, 99, 235, 0.08);
        }

        .nav-item-bottom .icon {
          font-size: 18px;
          margin-bottom: 1px;
        }

        .nav-item-bottom .label {
          font-size: 9px;
          font-weight: 500;
          white-space: nowrap;
        }

        .add-button {
          position: relative;
          background: linear-gradient(135deg, #2563eb 0%, #14b8a6 100%);
          color: white !important;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: -16px;
          box-shadow: 0 3px 12px rgba(37, 99, 235, 0.4);
          border: 3px solid white;
        }

        .add-button .icon {
          font-size: 20px;
          margin-bottom: 0;
        }

        .add-button:active {
          transform: scale(0.9);
        }

        .add-menu {
          position: fixed;
          bottom: 70px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
          padding: 6px;
          z-index: 1050;
          animation: slideUp 0.2s ease-out;
          min-width: 180px;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .add-menu-item {
          display: flex;
          align-items: center;
          padding: 10px 14px;
          color: #333;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
          gap: 10px;
        }

        .add-menu-item:hover,
        .add-menu-item:active {
          background: rgba(37, 99, 235, 0.08);
          color: #2563eb;
        }

        .add-menu-item .menu-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .add-menu-item .menu-icon.lost {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .add-menu-item .menu-icon.found {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .add-menu-item .menu-text {
          flex: 1;
        }

        .add-menu-item .menu-title {
          font-weight: 600;
          font-size: 12px;
          margin-bottom: 1px;
        }

        .add-menu-item .menu-subtitle {
          font-size: 10px;
          color: #9ca3af;
        }

        .add-menu-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 1045;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Hide on desktop */
        @media (min-width: 992px) {
          .bottom-nav {
            display: none;
          }
        }
      `}</style>

      {/* Add Menu Backdrop */}
      {showAddMenu && (
        <div 
          className="add-menu-backdrop"
          onClick={() => setShowAddMenu(false)}
        />
      )}

      {/* Add Menu */}
      {showAddMenu && (
        <div className="add-menu">
          <Link 
            href="/lost" 
            className="add-menu-item"
            onClick={() => setShowAddMenu(false)}
          >
            <div className="menu-icon lost">
              <FaSearch />
            </div>
            <div className="menu-text">
              <div className="menu-title">Report Lost Item</div>
              <div className="menu-subtitle">Something you lost</div>
            </div>
          </Link>
          <Link 
            href="/found" 
            className="add-menu-item"
            onClick={() => setShowAddMenu(false)}
          >
            <div className="menu-icon found">
              <FaPlusCircle />
            </div>
            <div className="menu-text">
              <div className="menu-title">Report Found Item</div>
              <div className="menu-subtitle">Something you found</div>
            </div>
          </Link>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="bottom-nav-container">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            
            if (item.isAction) {
              return (
                <a
                  key={index}
                  href="#"
                  className="nav-item-bottom add-button"
                  onClick={handleAddClick}
                  aria-label={item.label}
                >
                  <Icon className="icon" />
                </a>
              );
            }

            return (
              <Link
                key={index}
                href={item.href}
                className={`nav-item-bottom ${isActive(item.href) ? "active" : ""}`}
                onClick={(e) => handleNavClick(e, item.href)}
              >
                <Icon className="icon" />
                <span className="label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}


