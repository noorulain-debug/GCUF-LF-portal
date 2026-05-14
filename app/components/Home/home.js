"use client";

import React, { useState, useEffect } from "react";
import { FaSearch, FaUsers, FaBullhorn, FaBookOpen, FaShieldAlt, FaTag, FaMobileAlt, FaBook, FaFileAlt, FaGem, FaTshirt, FaBox } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, lost: 0, found: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      try {
        const statsRes = await fetch("/api/items/stats");
        if (!statsRes.ok) return;

        const data = await statsRes.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, []);

  const categories = [
    { id: "all", name: "All Items", icon: <FaBox size={24} />, count: stats.total },
    { id: "electronics", name: "Electronics", icon: <FaMobileAlt size={24} /> },
    { id: "stationary", name: "Stationary", icon: <FaBook size={24} /> },
    { id: "documents", name: "Documents", icon: <FaFileAlt size={24} /> },
    { id: "jewelry", name: "Jewelry", icon: <FaGem size={24} /> },
    { id: "clothing", name: "Clothing", icon: <FaTshirt size={24} /> },
  ];

  const handleCategoryClick = (categoryId) => {
    if (categoryId === "all") {
      router.push("/browse");
    } else {

      router.push(`/browse?cat=${categoryId}`);
    }
  };

  return (
    <>
      <style jsx global>{`
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
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .hero-gradient {
          background: linear-gradient(135deg, #2563eb 0%, #14b8a6 100%);
          position: relative;
          overflow: hidden;
        }
        
        .hero-gradient::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%);
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .stat-card-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          width: 100%;
          min-width: 0;
          text-align: center;
        }

        .stat-summary {
          text-align: center;
          min-width: 0;
          width: 100%;
        }

        .stat-total {
          color: #2563eb;
          font-size: clamp(1.75rem, 9vw, 4rem);
          line-height: 1;
          font-weight: 700;
          margin-bottom: 0.35rem;
          text-align: center;
        }

        .stat-title {
          color: #2563eb;
          font-size: clamp(0.85rem, 3.8vw, 1.25rem);
          line-height: 1.2;
          font-weight: 700;
          margin: 0;
          overflow-wrap: anywhere;
          text-align: center;
        }

        .stat-breakdown {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          align-items: center;
          justify-items: center;
          column-gap: clamp(1.25rem, 7vw, 2.5rem);
          width: min(100%, 250px);
          margin: 0 auto;
        }

        .stat-item {
          width: 92px;
          min-width: 0;
          text-align: center;
          padding: 0.35rem 0.25rem;
        }

        .stat-number {
          color: #2563eb;
          font-size: clamp(1.1rem, 5.8vw, 2rem);
          line-height: 1;
          font-weight: 700;
          margin-bottom: 0.3rem;
        }

        .stat-label {
          color: #6c757d;
          font-size: clamp(0.62rem, 3vw, 0.875rem);
          line-height: 1.15;
          overflow-wrap: anywhere;
          white-space: nowrap;
        }

       .stat-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1px solid #dee2e6;
        padding-top: 1rem;
        width: 100%;
        margin-top: 0.3rem;
        gap: 1rem;
         }

        .stat-footer-text,
        .stat-footer-status {
          min-width: 0;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }

         .stat-footer-text {
           color: #6c757d;
           font-size: clamp(0.68rem, 3vw, 0.9rem);
           letter-spacing: 0.01em;
           white-space: nowrap;
           text-align: right;
           margin-left: auto;
          }

          .stat-footer-status {
          color: #2563eb;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.45rem 0.7rem;
          border-radius: 999px;
          background: rgba(37, 99, 235, 0.1);
          box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.12);
          font-size: clamp(0.74rem, 3.5vw, 1rem);
          font-weight: 700;
          white-space: nowrap;
          flex-shrink: 0;
         }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }
        
       .category-btn {
        transition: all 0.3s ease;
        border: 2px solid #e5e7eb;
        background: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        min-height: 110px;
        padding: 12px 8px;
        border-radius: 14px;
        text-align: center;
        }

        .category-btn:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(37, 99, 235, 0.15);
        border-color: #2563eb;
        }
        
        .floating {
          animation: float 6s ease-in-out infinite;
          
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .btn-hover-grow {
          transition: all 0.3s ease;
        }
        
        .btn-hover-grow:hover {
          transform: scale(1.05);
        }
        
        .hero-title {
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
        }

        .hero-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: clamp(0.9rem, 4vw, 1.35rem);
          width: min(100%, 300px);
          max-width: 100%;
        }

        .hero-actions .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 2 2 auto;
          white-space: nowrap;
        }
        
        .btn-website-gradient {
          background: linear-gradient(135deg, #2563eb 0%, #14b8a6 100%);
          border: none;
          color: white;
          transition: all 0.3s ease;
        }
        
        .btn-website-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
        }
        
        .btn-outline-website {
          border: 2px solid white;
          color: white;
          background: transparent;
          transition: all 0.3s ease;
        }
        
        .btn-outline-website:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .service-card {
          background: linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%);
          border-radius: 16px;
          border: 2px solid rgba(37, 99, 235, 0.1);
          transition: all 0.3s ease;
        }
        
        .service-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(37, 99, 235, 0.15);
          border-color: rgba(37, 99, 235, 0.3);
        }
        
        .category-icon {
          color: #2563eb;
          margin-bottom: 12px;
        }
        
        /* Mobile Responsive Styles - COMPACT */
        @media (max-width: 768px) {
          .hero-gradient {
            padding-top: 1.25rem !important;
            padding-bottom: 1.25rem !important;
          }
          
          .hero-title {
            font-size: 1.35rem !important;
            line-height: 1.25;
          }
          
          .hero-gradient .lead {
            font-size: 0.8rem !important;
          }
          
          .stat-card {
            padding: 0.75rem !important;
          }
        }
        
        @media (max-width: 576px) {
          .hero-gradient {
            padding: 1rem !important;
          }
          
          .hero-title {
            font-size: 1.15rem !important;
          }
          
          .hero-gradient .lead {
            font-size: 0.72rem !important;
            margin-bottom: 1rem !important;
          }
          
          .hero-gradient .btn-lg {
            padding: 8px 14px !important;
            font-size: 12px !important;
          }
          
          .hero-actions {
            gap: 1rem;
            width: min(100%, 310px);
            justify-content: space-between;
          }

          .hero-actions .btn {
            padding-left: 0.9rem !important;
            padding-right: 0.9rem !important;
          }
          
          .stat-card {
            padding: 0.85rem !important;
            max-width: 100% !important;
            border-radius: 12px !important;
          }

          .stat-card-content {
            gap: 1rem;
          }

          .stat-breakdown {
            column-gap: 1.4rem;
            width: min(100%, 220px);
          }

          .stat-item {
            width: 86px;
            padding: 0.25rem 0.15rem;
          }

          .stat-footer {
           width: 100%;
           padding-top: 0.8rem;
           gap: 0.6rem;
          }

          .stat-footer-status {
           padding: 0.34rem 0.55rem;
           font-size: 0.7rem;
           gap: 0.22rem;
          }

            .stat-footer-text {
            font-size: 0.66rem;
          }
          
          .category-btn {
            padding: 0.6rem !important;
            border-radius: 8px !important;
          }
          
          .category-btn .category-icon {
            margin-bottom: 4px;
          }
          
          .category-btn .category-icon svg {
            width: 16px;
            height: 16px;
          }
          
          .category-btn .fw-bold {
             font-size: 0.68rem;
             line-height: 1.1;
             min-height: 20px;
               display: flex;
               align-items: center;
              justify-content: center;
          }
          
          .service-card {
            padding: 0.75rem !important;
            border-radius: 10px !important;
          }
          
          .service-card h3 {
            font-size: 0.8rem !important;
          }
          
          .service-card p {
            font-size: 0.68rem !important;
          }
          
          .service-card .rounded-circle {
            width: 32px !important;
            height: 32px !important;
            padding: 8px !important;
          }
          
          .service-card .rounded-circle svg {
            width: 14px;
            height: 14px;
          }
          
          .service-card .fw-bold {
            font-size: 0.7rem !important;
          }
          
          section h2.display-5 {
            font-size: 1.1rem !important;
          }
          
          section p.lead {
            font-size: 0.75rem !important;
          }
          
          section .btn-lg {
            padding: 8px 16px !important;
            font-size: 12px !important;
          }
          
          .home-page .container {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          
          .py-5 {
            padding-top: 1.25rem !important;
            padding-bottom: 1.25rem !important;
          }
          
          .mb-5 {
            margin-bottom: 1rem !important;
          }
          
          .mb-4 {
            margin-bottom: 0.75rem !important;
          }
          
          .g-4 {
            --bs-gutter-x: 0.5rem;
            --bs-gutter-y: 0.5rem;
          }
          
          /* 3 columns for categories on mobile */
                 .row.g-3.justify-content-center > div {
                 display: flex;
                 flex: 0 0 calc(33.333% - 0.5rem);}

                 .row.g-3.justify-content-center .category-btn {
                 width: 85%;
                 height: 85%;
                 min-height: 50px;
               }
          
          .text-center.mb-3.fade-in .h5 {
            font-size: 0.9rem !important;
          }
          
          .text-center.mb-3.fade-in .small {
            font-size: 0.7rem !important;
          }
        }
        
        /* Touch-friendly buttons */
        @media (hover: none) {
          .category-btn:hover,
          .service-card:hover,
          .stat-card:hover {
            transform: none;
            box-shadow: inherit;
          }
          
          .category-btn:active,
          .service-card:active {
            transform: scale(0.97);
          }
        }
      `}</style>

      <div className="home-page min-vh-100 bg-gray-50">
        <section className="hero-gradient text-white py-3 position-relative overflow-hidden">
          <div className="container position-relative z-10 py-3">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-3 mb-lg-0 fade-in">
                <div className="mb-3">
                  <h1 className="h3 fw-bold mb-2 hero-title">
                    GCUF Lost & Found Portal
                  </h1>

                  <p className="small mb-3 opacity-90">
                    Report lost items or found belongings within our campus community.
                  </p>

                  <div className="hero-actions d-flex flex-wrap gap-2">
                    <Link
                      href="/lost"
                      className="btn btn-light btn-sm px-3 py-2 fw-bold rounded-pill btn-hover-grow shadow"
                      style={{ color: "#2563eb", fontSize: '0.75rem' }}
                    >
                      <FaBullhorn className="me-1" size={12} />
                      Report Lost
                    </Link>
                    <Link
                      href="/found"
                      className="btn btn-outline-website btn-sm px-3 py-2 fw-bold rounded-pill"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Report Found
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right: stats card */}
              <div className="col-12 col-lg-6 fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="floating" style={{ animationDelay: '1s' }}>
                  <div className="stat-card p-4 p-md-5 mx-auto" style={{ maxWidth: '480px' }}>
                    <div className="stat-card-content">
                      <div className="stat-summary">
                        <div className="stat-total">{stats.total}</div>
                        <h3 className="stat-title">Active Reports</h3>
                      </div>

                      <div className="stat-breakdown">
                        <div className="stat-item">
                          <div className="stat-number">{stats.lost}</div>
                          <div className="stat-label">Lost Items</div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-number">{stats.found}</div>
                          <div className="stat-label">Found Items</div>
                        </div>
                      </div>

                      <div className="stat-footer ps-3 pe-2 d-flex align-items-center justify-content-between">
                        <span className="stat-footer-text">
                         Campus Community
                        </span>
                        <span className="stat-footer-status">
                         <FaUsers size={14} />
                        Active Portal
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---- CATEGORIES ---- */}
        <section className="py-5 bg-white">
          <div className="container">
            <div className="text-center mb-3 fade-in">
              <h2 className="h5 fw-bold mb-1 text-gray-800">Browse By Category</h2>
              <p className="small text-muted mb-2">Find items based on their type</p>
            </div>
            <div className="row g-3 justify-content-center fade-in">
              {categories.map((cat, i) => (
                <div key={cat.id} className="col-4 col-sm-4 col-md-3 col-lg-2 d-flex">
                  <button
                    className="category-btn p-3 p-md-4 rounded-3"
                    onClick={() => handleCategoryClick(cat.id)}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="category-icon">{cat.icon}</div>
                    <div className="fw-bold small text-center">{cat.name}</div>
                  </button>
                </div>
              ))}
            </div>
            <div className="text-center mt-3 fade-in" style={{ animationDelay: '0.3s' }}>
              <Link href="/browse" className="btn btn-website-gradient btn-lg px-5 py-3 rounded-pill fw-bold">
                <FaSearch className="me-2" />Browse All Categories
              </Link>
            </div>
          </div>
        </section>
      

        <section className="py-3 bg-white">
          <div className="container">
            <div className="text-center mb-3 fade-in">
              <h2 className="h5 fw-bold mb-1 text-gray-800">GCUF Support Services</h2>
              <p className="small text-muted mb-2">Additional resources on campus</p>
            </div>

            <div className="row g-2">
              <div className="col-4 fade-in">
                <div className="service-card p-2 h-100 text-center">
                  <div className="rounded-circle p-2 mx-auto mb-2" style={{ background: '#2563eb', color: 'white', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaShieldAlt size={14} />
                  </div>
                  <h3 className="fw-bold mb-0 text-gray-800" style={{ fontSize: '0.7rem' }}>Security</h3>
                  <div className="fw-bold" style={{ color: '#2563eb', fontSize: '0.6rem' }}>Ext. 911</div>
                </div>
              </div>

              <div className="col-4 fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="service-card p-2 h-100 text-center">
                  <div className="rounded-circle p-2 mx-auto mb-2" style={{ background: '#2563eb', color: 'white', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaBookOpen size={14} />
                  </div>
                  <h3 className="fw-bold mb-0 text-gray-800" style={{ fontSize: '0.7rem' }}>Common spot</h3>
                  <div className="fw-bold" style={{ color: '#2563eb', fontSize: '0.6rem' }}>Library</div>
                </div>
              </div>

              <div className="col-4 fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="service-card p-2 h-100 text-center">
                  <div className="rounded-circle p-2 mx-auto mb-2" style={{ background: '#2563eb', color: 'white', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaUsers size={14} />
                  </div>
                  <h3 className="fw-bold mb-0 text-gray-800" style={{ fontSize: '0.7rem' }}>Student Affairs</h3>
                  <div className="fw-bold" style={{ color: '#2563eb', fontSize: '0.6rem' }}>GCUF</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-3" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #14b8a6 100%)', fontSize: '0.75rem' }}>
          <div className="container">
            <div className="text-center py-3 fade-in">
              <h2 className="h5 fw-bold mb-2 text-white">Need to Report Something?</h2>
              <p className="small mb-3 opacity-90 text-white">
                Our portal is the fastest way to report items on campus.
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                <Link
                  href="/lost"
                  className="btn btn-light btn-sm px-3 py-2 fw-bold rounded-pill btn-hover-grow shadow"
                  style={{ color: "#2563eb", fontSize: '0.75rem' }}
                >
                  <FaBullhorn className="me-1" size={12} />
                  Report Lost
                </Link>
                <Link
                  href="/browse"
                  className="btn btn-outline-website btn-sm px-3 py-2 fw-bold rounded-pill"
                  style={{ fontSize: '0.75rem' }}
                >
                  <FaSearch className="me-1" size={12} />
                  Browse Items
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}


