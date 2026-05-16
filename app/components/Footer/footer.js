"use client";

import {
  FaGithub, FaLinkedin,
  FaHome, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaBoxOpen, FaExclamationTriangle, FaHandHolding, FaShieldAlt
} from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="text-white py-5"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderTop: '3px solid',
        borderImage: 'linear-gradient(90deg, #667eea, #764ba2, #667eea) 1'
      }}
    >
      <style jsx>{`
        .social-icon:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          border-color: transparent !important;
        }
        .footer-link:hover {
          color: #667eea !important;
          opacity: 1 !important;
          padding-left: 5px;
        }
        /* Fix logo image in footer */
        .footer-logo {
          width: auto;
          height: clamp(45px, 8vw, 70px);
          object-fit: contain;
          max-width: 100%;
        }
        /* Ensure email doesn't overflow on narrow screens */
        .contact-email {
          word-break: break-all;
        }
      `}</style>

      <div className="container">
        <div className="row g-4">

          {/* Brand + socials */}
          <div className="col-12 col-lg-4">
            <div className="d-flex align-items-center mb-3">
              <div
                className="me-3 rounded-3 p-1 flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(37, 99, 235,0.1) 0%, rgba(20, 184, 166,0.1) 100%)',
                  border: '1px solid rgba(37, 99, 235,0.2)'
                }}
              >
                <img
                  src="/images/L.png"
                  alt="Lost & Found Logo"
                  className="footer-logo"
                />
              </div>
              <div>
                <h3
                  className="fw-bold mb-0"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: 'clamp(1.1rem, 3vw, 1.5rem)'
                  }}
                >
                  Lost &amp; Found
                </h3>
                <small className="text-light opacity-75">Campus Portal</small>
              </div>
            </div>
            <p className="text-light opacity-75 mb-4" style={{ fontSize: '0.72rem' }}>
              Reuniting lost items with their owners, one post at a time.
              Creating a community of trust and responsibility.
            </p>
            <div className="d-flex gap-2">
              {[
                { icon: <FaGithub size={13} />, href: "https://github.com/noorulain-debug", label: "GitHub" },
                { icon: <FaLinkedin size={13} />, href: "https://www.linkedin.com/in/asia-saeed-1451522b5", label: "LinkedIn" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-decoration-none"
                  aria-label={social.label}
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle social-icon"
                    style={{
                      width: '28px', height: '28px',
                      background: 'linear-gradient(135deg, rgba(37, 99, 235,0.2) 0%, rgba(20, 184, 166,0.2) 100%)',
                      color: '#667eea',
                      border: '1px solid rgba(37, 99, 235,0.3)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {social.icon}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-4 col-lg-2 ps-3">
            <h5 className="fw-bold mb-3" style={{ color: '#667eea', fontSize: '0.9rem' }}>Quick Links</h5>
            <ul className="list-unstyled mb-0">
              {[
                { href: "/",       icon: <FaHome size={13} />,             text: "Home"          },
                { href: "/browse", icon: <FaBoxOpen size={13} />,          text: "Browse Items"  },
                { href: "/lost",   icon: <FaExclamationTriangle size={13}/>,text: "Report Lost"  },
                { href: "/found",  icon: <FaHandHolding size={13} />,      text: "Report Found"  },
              ].map((link, i) => (
                <li key={i} className="mb-2">
                  <a
                    href={link.href}
                    className="text-light text-decoration-none opacity-75 d-flex align-items-center gap-2 footer-link"
                    style={{ transition: 'all 0.2s ease', fontSize: '0.7rem' }}
                  >
                    <span style={{ color: '#667eea', flexShrink: 0 }}>{link.icon}</span>
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-6 col-md-4 col-lg-3 ps-0 ">
            <h5 className="fw-bold mb-3" style={{ color: '#667eea', fontSize: '0.9rem' }}>Contact Us</h5>
            <ul className="list-unstyled mb-0">
              <li className="mb-3 d-flex align-items-start gap-2">
                <FaMapMarkerAlt size={13} style={{ color: '#667eea', marginTop: '3px', flexShrink: 0 }} />
                <span className="text-light opacity-75 small" style={{ fontSize: '0.65rem' }}>GCUF Campus, Faisalabad</span>
              </li>
              <li className="mb-3 d-flex align-items-start gap-2">
                <FaPhone size={13} style={{ color: '#667eea', marginTop: '3px', flexShrink: 0 }} />
                <span className="text-light opacity-75 small" style={{ fontSize: '0.65rem' }}>+92 3208711060</span>
              </li>
              <li className="d-flex align-items-start gap-2">
                <FaEnvelope size={13} style={{ color: '#667eea', marginTop: '3px', flexShrink: 0 }} />
                <span className="text-light opacity-75 small contact-email" style={{ fontSize: '0.65rem' }}>lostfoundgcuf@gmail.com </span>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div className="col-12 col-md-4 col-lg-3">
            <div
              className="p-2 h-100 rounded-4"
              style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235,0.05) 0%, rgba(20, 184, 166,0.05) 100%)',
                border: '1px solid rgba(37, 99, 235,0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="text-center">
                <h5
                  className="fw-bold mb-3"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '0.82rem',
                    marginBottom: '0.6rem'
                  }}
                >
                  Trust &amp; Safety
                </h5>
                <div
                  className="mx-auto mb-2 d-flex align-items-center justify-content-center"
                  style={{
                    width: '46px', height: '46px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '50%',
                    fontSize: '1.12rem'
                  }}
                >
                  <FaShieldAlt />
                </div>
                <h6 className="fw-bold mb-1" style={{ color: '#667eea', fontSize: '0.78rem' }}>
                  Verified Platform
                </h6>
                <p className="small text-light opacity-75 mb-0" style={{ fontSize: '0.65rem' }}>GCUF-approved secure system</p>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-4" style={{ borderColor: 'rgba(37, 99, 235,0.3)', opacity: 0.5 }} />

        {/* Copyright row */}
        <div className="row align-items-center gy-2">
          <div className="col-12 col-md-6 text-center text-md-start">
            <small className="text-light opacity-75" style={{ fontSize: '0.72rem' }}>
              <span style={{ color: '#667eea' }}>©</span>
              {' '}{currentYear}   Lost & Found Hub. All rights reserved.
            </small>
          </div>
          <div className="col-12 col-md-6 text-center text-md-end">
            <small className="text-light opacity-75" style={{ fontSize: '0.72rem' }}>Made by GCUF Team</small>
          </div>
        </div>

        {/* Stats row */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="d-flex flex-wrap justify-content-center gap-3 gap-md-4 ">
              {[
                { value: "1,000+", label: "Items Reunited" },
                { value: "500+",   label: "Happy Users"   },
                { value: "24/7",   label: "Active Support"},
                { value: "99%",    label: "Satisfaction"  },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div
                    className="fw-bold mb-1"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontSize: 'clamp(1rem, 3vw, 1.0rem)'
                    }}
                  >
                    {stat.value}
                  </div>
                  <small className="text-light opacity-75" style={{ fontSize: '0.6rem' }}>
                    {stat.label}
                  </small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


