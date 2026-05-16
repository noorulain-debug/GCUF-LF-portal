"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchItems } from "../../store/slices/itemsSlice";
import { FaSearch, FaWhatsapp, FaFilter, FaMapMarkerAlt, FaCalendarAlt, FaTag, FaUser, FaPhone, FaEnvelope, FaTimes, FaEye } from 'react-icons/fa';
import { useSearchParams, useRouter } from "next/navigation";

export default function Browse() {
  const dispatch = useDispatch();
  const router = useRouter();
  const items = useSelector((state) => state.items.list);
  const status = useSelector((state) => state.items.status);

  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("cat") || "all";

  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState(categoryFromUrl);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/profile")
      .then(async (res) => {
        if (!isMounted) return;

        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json();
        if (isMounted) setUser(data);
      })
      .catch(() => {
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setCheckingAuth(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    dispatch(fetchItems({ type: typeFilter, category: categoryFilter }));
  }, [dispatch, typeFilter, categoryFilter]);

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const filteredItems = items.filter(item => {
    if (item.type === "resolved") return false;
    if (searchQuery === "") return true;
    const query = searchQuery.toLowerCase();
    return item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.location?.toLowerCase().includes(query);
  });


  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0);
      case "oldest":
        return new Date(a.date || a.createdAt || 0) - new Date(b.date || b.createdAt || 0);
      default:
        return 0;
    }
  });

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const formatWhatsAppPhone = (phone) => {
    if (!phone) return "";

    const digits = phone.replace(/\D/g, "");

    if (digits.startsWith("00")) return digits.slice(2);
    if (digits.startsWith("0")) return `92${digits.slice(1)}`;
    return digits;
  };

  const handleWhatsAppClick = (phone) => {
  if (!user) {
    router.push("/loginPage");
    return;
  }

  const formattedPhone = formatWhatsAppPhone(phone);
  if (!formattedPhone || !selectedItem) return;

  // Type ke mutabiq alag-alag messages
  let messageText = "";

  if (selectedItem.type === "found") {
    messageText = `Hello, I think the item "${selectedItem.title}" you found belongs to me. You posted it on the GCUF Lost and Found portal.`;
  } else if (selectedItem.type === "lost") {
    messageText = `Hello, I found an item that matches your post "${selectedItem.title}" on the GCUF Lost and Found portal.`;
  } else {
    // Default message
    messageText = `Hello, I'm contacting you regarding your post "${selectedItem.title}" on the GCUF Lost and Found portal.`;
  }

  const message = encodeURIComponent(messageText);
  window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank", "noopener,noreferrer");
};
  return (
    <>
      <style jsx global>{`
        :root {
          --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          --primary-color: #667eea;
          --secondary-color: #764ba2;
          --light-primary: rgba(102, 126, 234, 0.1);
          --light-secondary: rgba(118, 75, 162, 0.1);
        }
        
        .glass-effect {
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(102, 126, 234, 0.1);
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.08);
        }
        
        .gradient-bg {
          background: var(--primary-gradient);
          position: relative;
          overflow: hidden;
        }
        
        .gradient-bg::before {
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
        
        .card-hover-3d {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: none;
          overflow: hidden;
          background: white;
          border-radius: 20px !important;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }
        
        .card-hover-3d:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 25px 50px rgba(102, 126, 234, 0.15), 0 15px 30px rgba(118, 75, 162, 0.1) !important;
          border-color: rgba(102, 126, 234, 0.3);
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          border: 1px solid rgba(102, 126, 234, 0.2);
          transition: all 0.4s ease;
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.05);
        }
        
        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15) !important;
        }
        
        .type-badge {
          font-weight: 700;
          letter-spacing: 1px;
          padding: 8px 20px;
          border-radius: 25px;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2);
          font-size: 0.8rem;
          text-transform: uppercase;
          backdrop-filter: blur(10px);
        }
        
        .image-container {
          position: relative;
          overflow: hidden;
          height: 240px;
          border-radius: 20px 20px 0 0;
        }
        
        .image-container img {
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover-3d:hover .image-container img {
          transform: scale(1.15);
        }
        
        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.3) 50%, transparent 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        
        .card-hover-3d:hover .image-overlay {
          opacity: 1;
        }
        
        .view-details-btn {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          opacity: 0;
          transition: all 0.4s ease;
          padding: 5px 10px;
          background: var(--primary-gradient);
          color: white;
          border: none;
          border-radius: 15px;
          font-weight: 600;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .card-hover-3d:hover .view-details-btn {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        
        .search-input:focus-within {
          border-color: #667eea;
          box-shadow: 0 0 0 0.3rem rgba(102, 126, 234, 0.15) !important;
          transform: translateY(-2px);
        }
        
        .form-select, .form-control {
          border-radius: 12px !important;
          border: 2px solid rgba(102, 126, 234, 0.1);
          padding: 12px 16px;
          transition: all 0.3s ease;
        }
        
        .form-select:focus, .form-control:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.3rem rgba(102, 126, 234, 0.15) !important;
        }
        
        .filter-label {
          color: var(--secondary-color);
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(102, 126, 234, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 20px;
        }
        
        .modal-content {
          background: white;
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(102, 126, 234, 0.3);
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          animation: modalSlideIn 0.3s ease-out;
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .modal-header {
          background: var(--primary-gradient);
          color: white;
          padding: 25px 30px;
          position: relative;
        }
        
        .modal-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }
        
        .modal-title {
          font-weight: 700;
          font-size: 1.5rem;
          margin: 0;
        }
        
        .modal-body {
          padding: 30px;
        }
        
        .detail-label {
          color: var(--primary-color);
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        
        .detail-value {
          color: #2d3748;
          font-weight: 500;
          font-size: 1.1rem;
          margin-bottom: 20px;
        }
        
        .item-image-modal {
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.1);
          margin-bottom: 25px;
        }
        
        .contact-info {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-radius: 15px;
          padding: 20px;
          margin-top: 20px;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }
        
        .fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.98); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .loading-shimmer {
          background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 25%, rgba(118, 75, 162, 0.1) 50%, rgba(102, 126, 234, 0.1) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .modal-footer {
          padding: 20px 30px;
          border-top: 1px solid rgba(102, 126, 234, 0.1);
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        
        .btn {
          padding: 10px 20px;
          border-radius: 25px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        
        .btn-secondary:hover {
          background: #5a6268;
        }
        
        .btn-primary {
          background: var(--primary-gradient);
          color: white;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .text-primary {
          color: var(--primary-color) !important;
        }
        
        .text-gradient {
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .category-icon {
          color: var(--primary-color);
        }
        
        .icon-container {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(102, 126, 234, 0.1);
          color: var(--primary-color);
          margin-right: 12px;
        }
        
        .card-title {
          color: var(--secondary-color) !important;
        }
        
        .card-text {
          color: #5a6c7d !important;
        }
        
        /* Mobile Responsive Styles - COMPACT */
        @media (max-width: 768px) {
          .gradient-bg {
            padding: 1rem !important;
            border-radius: 12px !important;
          }
          
          .gradient-bg h1 {
            font-size: 1.25rem !important;
          }
          
          .gradient-bg .lead {
            font-size: 0.8rem !important;
            margin-bottom: 0.75rem !important;
          }
          
          .stat-card {
            padding: 0.6rem !important;
            min-width: auto !important;
            border-radius: 8px !important;
          }
          
          .stat-card .display-5 {
            font-size: 1.1rem !important;
          }
          
          .glass-effect {
            padding: 0.75rem !important;
            border-radius: 10px !important;
          }
          
          .filter-label {
            font-size: 0.7rem !important;
            margin-bottom: 3px !important;
          }
          
          .form-control,
          .form-select {
            padding: 8px 10px !important;
            font-size: 14px !important;
          }

          .input-group-text {
            padding: 8px 10px !important;
          }
          
          .card-hover-3d {
            border-radius: 10px !important;
          }
          
          .image-container {
            height: 120px !important;
            border-radius: 10px 10px 0 0 !important;
          }
          
          .card-body {
            padding: 10px !important;
          }
          
          .card-title {
            font-size: 0.85rem !important;
            margin-bottom: 4px !important;
          }
          
          .card-text {
            font-size: 0.72rem !important;
            margin-bottom: 8px !important;
          }
          
          .icon-container {
            width: 22px !important;
            height: 22px !important;
            margin-right: 6px !important;
            border-radius: 5px !important;
          }
          
          .icon-container svg {
            width: 10px !important;
            height: 10px !important;
          }
          
          .modal-content {
            margin: 8px !important;
            max-height: calc(100vh - 16px) !important;
            border-radius: 12px !important;
          }
          
          .modal-header {
            padding: 12px !important;
          }
          
          .modal-title {
            font-size: 1rem !important;
          }
          
          .modal-body {
            padding: 12px !important;
          }
          
          .modal-body .row {
            flex-direction: column;
          }
          
          .modal-body .col-md-6 {
            width: 100%;
          }
          
          .detail-label {
            font-size: 0.68rem !important;
          }
          
          .detail-value {
            font-size: 0.85rem !important;
            margin-bottom: 10px !important;
          }
          
          .item-image-modal {
            border-radius: 10px !important;
            margin-bottom: 12px !important;
          }
          
          .item-image-modal img {
            height: 180px !important;
            object-fit: cover !important;
            width: 100% !important;
          }
          
          .contact-info {
            padding: 10px !important;
            border-radius: 10px !important;
          }
          
          .modal-footer {
            padding: 10px 12px !important;
          }
          
          .modal-footer .btn {
            padding: 8px 14px !important;
            font-size: 0.8rem !important;
          }
        }
        
        @media (max-width: 576px) {
          .container {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
          
          .gradient-bg {
            padding: 0.75rem !important;
          }
          
          .gradient-bg h1 {
            font-size: 1.1rem !important;
          }
          
          .gradient-bg .lead {
            font-size: 0.72rem !important;
          }
          
          .d-flex.gap-3.flex-wrap {
            gap: 0.4rem !important;
          }
          
          .stat-card {
            flex: 1 1 calc(33.333% - 6px) !important;
            min-width: 0 !important;
            padding: 0.5rem !important;
          }
          
          .stat-card .display-5 {
            font-size: 1rem !important;
          }
          
          .stat-card .small {
            font-size: 0.58rem !important;
          }
          
          .glass-effect .row {
            gap: 0.5rem !important;
          }
          
          .image-container {
            height: 100px !important;
          }
          
          .type-badge {
            font-size: 0.52rem !important;
            padding: 2px 6px !important;
            border-radius: 4px !important;
          }
          
          .view-details-btn {
            padding: 6px 12px !important;
            font-size: 0.68rem !important;
            border-radius: 10px !important;
          }
          
          /* 2 column grid on mobile */
          .col-md-6.col-lg-4.col-xl-3 {
            width: 50% !important;
            flex: 0 0 50% !important;
          }
          
          .card-body .d-flex.align-items-center.mb-2 {
            margin-bottom: 4px !important;
          }
          
          .card-body .d-flex.align-items-center.mb-2 span {
            font-size: 0.68rem !important;
          }
        }
        
        /* Touch-friendly interactions */
        @media (hover: none) {
          .card-hover-3d:hover {
            transform: none;
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.08) !important;
          }
          
          .card-hover-3d:active {
            transform: scale(0.97);
          }
          
          .view-details-btn {
            opacity: 1 !important;
            transform: translateX(-50%) translateY(0) !important;
            background: rgba(255, 255, 255, 0.95) !important;
            color: var(--primary-color) !important;
            font-size: 0.65rem !important;
            padding: 4px 10px !important;
          }
          
          .image-overlay {
            opacity: 0.3 !important;
          }
        }
        
        /* Image click to expand  */
        .clickable-image {
          cursor: pointer;
        }
      `}</style>

      <div className="container py-3 fade-in">
        <div className="gradient-bg text-white rounded-3 p-3 mb-3 shadow-lg position-relative overflow-hidden">
          <div className="position-relative z-2">
            <h1 className="h4 fw-bold mb-2">GCUF Lost & Found Hub</h1>
            <p className="small mb-3 opacity-90">
              Report lost items and return found belongings on campus.
            </p>

            <div className="d-flex gap-2 flex-wrap">
              <div className="stat-card text-dark rounded-2 p-2 flex-grow-1" style={{ minWidth: '80px' }}>
                <div className="h5 fw-bold text-gradient mb-0">{items.length}</div>
                <div className="small text-muted" style={{ fontSize: '0.65rem' }}>Total</div>
              </div>
              <div className="stat-card text-dark rounded-2 p-2 flex-grow-1" style={{ minWidth: '80px' }}>
                <div className="h5 fw-bold text-gradient mb-0">
                  {items.filter(i => i.type === 'found').length}
                </div>
                <div className="small text-muted" style={{ fontSize: '0.65rem' }}>Found</div>
              </div>
              <div className="stat-card text-dark rounded-2 p-2 flex-grow-1" style={{ minWidth: '80px' }}>
                <div className="h5 fw-bold text-gradient mb-0">
                  {items.filter(i => i.type === 'lost').length}
                </div>
                <div className="small text-muted" style={{ fontSize: '0.65rem' }}>Lost</div>
              </div>
            </div>
          </div>
        </div>


        <div className="glass-effect rounded-3 p-3 mb-3">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-4">
              <label className="filter-label small"><FaSearch size={10} /> Search</label>
              <div className="input-group input-group-sm search-input">
                <span className="input-group-text bg-white border-end-0 py-1">
                  <FaSearch className="text-primary" size={12} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 py-1"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <div className="col-4 col-md-3">
              <label className="filter-label small"><FaFilter size={10} /> Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="form-select form-select-sm py-1"
                style={{ fontSize: '0.75rem' }}
              >
                <option value="all">All</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>

            <div className="col-5 col-md-3">
              <label className="filter-label small">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-select form-select-sm py-1"
                style={{ fontSize: '0.75rem', minWidth: '124px', paddingRight: '1.9rem' }}
              >
                <option value="all">All</option>
                <option value="electronics">Electronics</option>
                <option value="stationary">Stationary</option>
                <option value="documents">Documents</option>
                <option value="jewelry">Jewelry</option>
                <option value="clothing">Clothing</option>
                <option value="keys">Keys</option>
                <option value="bags">Bags</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="col-5 col-sm-4 col-md-2">
              <label className="filter-label small">Sort</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select form-select-sm py-1"
                style={{ fontSize: '0.75rem', minWidth: '112px', paddingRight: '2rem' }}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>


        <div className="fade-in">
          {status === "loading" && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted fw-medium">Loading items from database...</p>
            </div>
          )}

          {status === "succeeded" && sortedItems.length === 0 && (
            <div className="text-center py-5">
              <div className="display-1 mb-3 text-muted" style={{ color: 'var(--primary-color)' }}>🔍</div>
              <h4 className="mb-3 fw-bold" style={{ color: 'var(--secondary-color)' }}>No items found</h4>
              <p className="text-muted mb-4">Try adjusting your search criteria or clear the filters</p>
              <button
                className="btn btn-primary px-4 py-3 fw-bold rounded-pill"
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                  setCategoryFilter("all");
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}

          {status === "succeeded" && sortedItems.length > 0 && (
            <div className="row g-2">
              {sortedItems.map((item) => (
                <div
                  key={item._id}
                  className="col-6 col-md-4 col-lg-3"
                  onMouseEnter={() => setHoveredItem(item._id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div
                    className="card card-hover-3d h-100 border-0 shadow-sm position-relative"
                    onClick={() => handleItemClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="image-container" style={{ height: '100px' }}>
                      {item.imageUrl ? (
                        <>
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-100 h-100"
                            style={{ objectFit: 'cover' }}
                          />
                          <div className="image-overlay"></div>
                        </>
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center"
                          style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' }}>
                          <div className="text-center" style={{ color: 'var(--primary-color)' }}>
                            <FaSearch size={20} className="opacity-50" />
                          </div>
                        </div>
                      )}

                      <span className="type-badge position-absolute top-0 start-0 m-1 text-white"
                        style={{
                          fontSize: '0.55rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '600',
                          letterSpacing: '0.3px',
                          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                          textTransform: 'uppercase',
                          background: item.type === "lost"
                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                            : item.type === "found"
                              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}>
                        {item.type === "lost" ? "LOST" : item.type === "found" ? "FOUND" : "OK"}
                      </span>

                      <button className="view-details-btn" style={{ padding: '4px 8px', fontSize: '0.6rem', borderRadius: '6px' }}>
                        <FaEye size={10} /> View
                      </button>
                    </div>

                    <div className="card-body d-flex flex-column p-2">
                      <h6 className="card-title fw-bold mb-1 line-clamp-1" style={{ fontSize: '0.8rem' }}>{item.title}</h6>
                      <p className="card-text flex-grow-1 mb-2 line-clamp-2" style={{ fontSize: '0.68rem', color: '#6c757d' }}>
                        {item.description}
                      </p>

                      <div className="mt-auto">
                        <div className="d-flex align-items-center mb-1" style={{ color: 'var(--secondary-color)' }}>
                          <FaMapMarkerAlt size={10} className="me-1" style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                          <span className="text-truncate" style={{ fontSize: '0.65rem' }}>{item.location}</span>
                        </div>

                        {item.date && (
                          <div className="d-flex align-items-center" style={{ color: 'var(--secondary-color)' }}>
                            <FaCalendarAlt size={10} className="me-1" style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.65rem' }}>
                              {new Date(item.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        {showModal && selectedItem && (
          <div className="modal-backdrop" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
              <div className="modal-header py-2 px-3">
                <div style={{ position: 'absolute', top: '8px', left: '12px' }}>
                  <span className="badge px-2 py-1" style={{
                    background: selectedItem.type === 'lost' 
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    fontSize: '0.65rem'
                  }}>
                    {selectedItem.type.toUpperCase()}
                  </span>
                </div>
                <h6 className="modal-title w-100 text-center mb-0" style={{ fontSize: '0.9rem' }}>{selectedItem.title}</h6>
                <button className="modal-close-btn" onClick={handleCloseModal} style={{ width: '28px', height: '28px', top: '8px', right: '8px' }}>
                  <FaTimes size={14} />
                </button>
              </div>

              <div className="modal-body p-3">
                {selectedItem.imageUrl && (
                  <div className="item-image-modal mb-3" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.title}
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                  </div>
                )}

                <div className="mb-3">
                  <div className="detail-label" style={{ fontSize: '0.65rem' }}>Description</div>
                  <div className="detail-value" style={{ fontSize: '0.8rem', marginBottom: '0' }}>{selectedItem.description}</div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="detail-label" style={{ fontSize: '0.65rem' }}>Location</div>
                    <div className="d-flex align-items-center" style={{ fontSize: '0.78rem' }}>
                      <FaMapMarkerAlt size={10} className="me-1" style={{ color: 'var(--primary-color)' }} />
                      {selectedItem.location}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="detail-label" style={{ fontSize: '0.65rem' }}>Date</div>
                    <div className="d-flex align-items-center" style={{ fontSize: '0.78rem' }}>
                      <FaCalendarAlt size={10} className="me-1" style={{ color: 'var(--primary-color)' }} />
                      {new Date(selectedItem.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                <div className="contact-info p-2" style={{ borderRadius: '8px' }}>
                  <h6 className="mb-2 fw-bold d-flex align-items-center" style={{ color: 'var(--primary-color)', fontSize: '0.75rem' }}>
                    <FaUser size={10} className="me-1" />
                    Contact Info
                  </h6>
                  <div className="row g-2">
                    <div className="col-12">
                      <div className="detail-label" style={{ fontSize: '0.6rem' }}>Reported By</div>
                      <div className="fw-bold" style={{ color: 'var(--secondary-color)', fontSize: '0.78rem' }}>
                        {selectedItem.user?.name || "Anonymous"}
                      </div>
                    </div>
                    {selectedItem.user?.email && (
                      <div className="col-12">
                        <div className="detail-label" style={{ fontSize: '0.6rem' }}>Email</div>
                        <div className="d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                          <FaEnvelope size={10} className="me-1" style={{ color: 'var(--primary-color)' }} />
                          {selectedItem.user.email}
                        </div>
                      </div>
                    )}
                    {selectedItem.user?.phone && user && String(user.id) !== String(selectedItem.user._id) && (
                      <div className="col-12">
                        <div className="detail-label" style={{ fontSize: '0.6rem' }}>Phone</div>
                        <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                          <div className="d-flex align-items-center flex-grow-1" style={{ fontSize: '0.75rem', minWidth: 0 }}>
                            <FaPhone size={10} className="me-1" style={{ color: 'var(--primary-color)' }} />
                            {selectedItem.user.phone}
                          </div>
                          <button
                            className="btn btn-success btn-sm d-flex align-items-center justify-content-center gap-1"
                            onClick={() => handleWhatsAppClick(selectedItem.user.phone)}
                            style={{
                              fontSize: '0.72rem',
                              minWidth: '78px',
                              padding: '6px 12px',
                              borderRadius: '16px',
                              flexShrink: 0
                            }}
                          >
                            <FaWhatsapp size={13} /> Chat
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer py-2 px-3">
                <button
                  className="btn btn-primary btn-sm py-1 px-3"
                  onClick={handleCloseModal}
                  style={{ fontSize: '0.75rem' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
