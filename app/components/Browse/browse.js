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
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [user, setUser] = useState(null);
  const [hasCheckedUser, setHasCheckedUser] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    dispatch(fetchItems({ type: typeFilter, category: categoryFilter }));
  }, [dispatch, typeFilter, categoryFilter]);

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

  const visibleItems = sortedItems.slice(0, visibleCount);
  const hasMoreItems = visibleCount < sortedItems.length;

  const ensureUser = async () => {
    if (hasCheckedUser) return user;

    try {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        setUser(null);
        setHasCheckedUser(true);
        return null;
      }

      const data = await res.json();
      setUser(data);
      setHasCheckedUser(true);
      return data;
    } catch {
      setUser(null);
      setHasCheckedUser(true);
      return null;
    }
  };

  const handleItemClick = async (item) => {
    setSelectedItem(item);
    setShowModal(true);
    ensureUser();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  useEffect(() => {
    const isModalOpen = showModal && selectedItem;
    document.documentElement.classList.toggle("browse-modal-open", Boolean(isModalOpen));
    document.body.classList.toggle("browse-modal-open", Boolean(isModalOpen));

    if (!isModalOpen) {
      document.documentElement.style.removeProperty("overflow");
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("position");
      document.body.style.removeProperty("top");
      document.body.style.removeProperty("width");
      return;
    }

    return () => {
      document.documentElement.classList.remove("browse-modal-open");
      document.body.classList.remove("browse-modal-open");
      document.documentElement.style.removeProperty("overflow");
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("position");
      document.body.style.removeProperty("top");
      document.body.style.removeProperty("width");
    };
  }, [showModal, selectedItem]);

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
          --primary-gradient: linear-gradient(135deg, #2563eb 0%, #14b8a6 100%);
          --primary-color: #2563eb;
          --secondary-color: #0f766e;
          --browse-ink: #0f172a;
          --browse-muted: #64748b;
          --browse-border: rgba(15, 23, 42, 0.1);
          --light-primary: rgba(37, 99, 235, 0.1);
          --light-secondary: rgba(20, 184, 166, 0.12);
        }

        html.browse-modal-open,
        body.browse-modal-open {
          overflow: hidden !important;
        }

        html:not(.browse-modal-open),
        body:not(.browse-modal-open) {
          position: static !important;
          top: auto !important;
          width: auto !important;
          height: auto !important;
          overflow-y: auto !important;
        }

        .browse-page-shell {
          max-width: 1180px;
          overflow-x: clip;
          overflow-y: visible;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }

        .browse-hero {
          background:
            linear-gradient(135deg, rgba(37, 99, 235, 0.96), rgba(20, 184, 166, 0.92)),
            radial-gradient(circle at 85% 20%, rgba(255, 255, 255, 0.28), transparent 32%);
          border: 1px solid rgba(255, 255, 255, 0.35);
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.14);
        }

        .browse-hero h1 {
          letter-spacing: 0;
        }

        .browse-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .browse-stat {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(255, 255, 255, 0.52);
          border-radius: 8px;
          padding: 10px 12px;
          min-width: 0;
        }

        .browse-stat-value {
          color: #0f172a;
          font-size: 1.2rem;
          font-weight: 800;
          line-height: 1;
        }

        .browse-stat-label {
          color: #64748b;
          font-size: 0.7rem;
          font-weight: 700;
          margin-top: 4px;
        }

        .browse-filter-panel {
          background: #ffffff;
          border: 1px solid var(--browse-border);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
        }
        
        .glass-effect {
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(37, 99, 235, 0.1);
          box-shadow: 0 8px 32px rgba(37, 99, 235, 0.08);
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
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
          border: none;
          overflow: hidden;
          background: white;
          border-radius: 12px !important;
          border: 1px solid rgba(37, 99, 235, 0.1);
        }
        
        .card-hover-3d:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px rgba(37, 99, 235, 0.12) !important;
          border-color: rgba(37, 99, 235, 0.3);
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          border: 1px solid rgba(37, 99, 235, 0.2);
          transition: all 0.4s ease;
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.05);
        }
        
        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(37, 99, 235, 0.15) !important;
        }
        
        .type-badge {
          font-weight: 700;
          letter-spacing: 1px;
          padding: 8px 20px;
          border-radius: 25px;
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.2);
          font-size: 0.8rem;
          text-transform: uppercase;
          backdrop-filter: blur(10px);
        }
        
        .image-container {
          position: relative;
          overflow: hidden;
          aspect-ratio: 4 / 3;
          height: auto;
          border-radius: 12px 12px 0 0;
          background: #f4f6fb;
        }
        
        .image-container img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.2s ease;
          background: #f4f6fb;
        }
        
        .card-hover-3d:hover .image-container img {
          transform: scale(1.02);
        }
        
        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(17, 24, 39, 0.42) 0%, rgba(17, 24, 39, 0.08) 55%, transparent 100%);
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
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .browse-page-shell {
          max-width: 1180px;
          overflow-x: clip;
          overflow-y: visible;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }

        .browse-grid {
          --bs-gutter-x: 0.85rem;
          --bs-gutter-y: 0.85rem;
        }

        .browse-page-shell .row {
          margin-left: 0 !important;
          margin-right: 0 !important;
        }

        .browse-page-shell > .fade-in,
        .browse-page-shell > .browse-filter-panel,
        .browse-page-shell > .browse-hero {
          margin-left: 0;
          margin-right: 0;
        }

        .browse-card-body {
          gap: 0.35rem;
          min-height: 132px;
        }

        .browse-card-meta {
          min-width: 0;
        }

        .browse-filter-row > * {
          min-width: 0;
        }

        .browse-filter-row .form-select,
        .browse-filter-row .form-control {
          width: 100%;
          min-width: 0;
        }

        .modal-contact-line {
          min-width: 0;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        
        .card-hover-3d:hover .view-details-btn {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        
        .search-input:focus-within {
          border-color: #2563eb;
          box-shadow: 0 0 0 0.3rem rgba(37, 99, 235, 0.15) !important;
          transform: translateY(-2px);
        }
        
        .form-select, .form-control {
          border-radius: 12px !important;
          border: 2px solid rgba(37, 99, 235, 0.1);
          padding: 12px 16px;
          transition: all 0.3s ease;
        }
        
        .form-select:focus, .form-control:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 0.3rem rgba(37, 99, 235, 0.15) !important;
        }
        
        .filter-label {
          color: var(--secondary-color);
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .browse-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100dvh;
          background-color: rgba(37, 99, 235, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 20px;
          overflow: hidden;
          overscroll-behavior: contain;
        }
        
        .browse-modal-content {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(37, 99, 235, 0.3);
          max-width: 420px;
          width: 100%;
          max-height: min(90vh, calc(100dvh - 40px));
          display: flex;
          flex-direction: column;
          animation: modalSlideIn 0.3s ease-out;
          touch-action: auto;
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
        
        .browse-modal-header {
          background: var(--primary-gradient);
          color: white;
          padding: 14px 44px 14px 14px;
          position: sticky;
          top: 0;
          z-index: 3;
          min-height: 54px;
          flex-shrink: 0;
        }

        .browse-modal-status-badge {
          flex-shrink: 0;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0;
          border-radius: 6px;
          padding: 4px 8px;
        }

        .browse-modal-title {
          min-width: 0;
          line-height: 1.25;
        }

        .browse-modal-title-text {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-align: left;
        }
        
        .browse-modal-close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .browse-modal-body {
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          touch-action: pan-y;
          flex: 1 1 auto;
          min-height: 0;
        }

        .browse-modal-footer {
          flex-shrink: 0;
          background: #fff;
          position: sticky;
          bottom: 0;
          z-index: 2;
        }

        .modal-detail-card {
          border: 1px solid rgba(37, 99, 235, 0.1);
          border-radius: 10px;
          background: #fff;
          padding: 10px;
        }

        .modal-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        
        .browse-modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }
        
        .browse-modal-title {
          font-weight: 700;
          margin: 0;
        }
        
        .browse-modal-body {
          padding: 14px;
        }
        
        .detail-label {
          color: var(--primary-color);
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0;
          margin-bottom: 3px;
        }
        
        .detail-value {
          color: #2d3748;
          font-weight: 500;
          font-size: 1.1rem;
          margin-bottom: 20px;
        }
        
        .item-image-modal {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.08);
          margin-bottom: 10px;
          background: #f4f6fb;
        }

        .item-image-modal img {
          display: block;
          width: 100%;
          max-height: 320px;
          object-fit: contain;
          background: #f4f6fb;
        }
        
        .contact-info {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%);
          border-radius: 15px;
          padding: 20px;
          margin-top: 20px;
          border: 1px solid rgba(37, 99, 235, 0.1);
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
          background: linear-gradient(90deg, rgba(37, 99, 235, 0.1) 25%, rgba(20, 184, 166, 0.1) 50%, rgba(37, 99, 235, 0.1) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .browse-modal-footer {
          padding: 10px 12px;
          border-top: 1px solid rgba(37, 99, 235, 0.1);
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
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
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
          background: rgba(37, 99, 235, 0.1);
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
            aspect-ratio: 4 / 3;
            height: auto !important;
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
          
          .browse-modal-content {
            width: min(100%, 390px) !important;
            max-height: calc(100dvh - 18px) !important;
            margin: 0 !important;
            border-radius: 14px !important;
          }
          
          .browse-modal-header {
            padding: 12px 44px 12px 12px !important;
            min-height: 52px;
          }
          
          .browse-modal-title {
            font-size: 0.88rem !important;
          }
          
          .browse-modal-body {
            padding: 12px !important;
          }
          
          .modal-detail-grid {
            grid-template-columns: 1fr;
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
            object-fit: contain !important;
            width: 100% !important;
          }
          
          .contact-info {
            padding: 10px !important;
            border-radius: 10px !important;
          }
          
          .browse-modal-footer {
            padding: 10px 12px !important;
          }
          
          .browse-modal-footer .btn {
            padding: 8px 14px !important;
            font-size: 0.8rem !important;
          }
        }
        
        @media (max-width: 576px) {
          .browse-page-shell {
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

          .browse-filter-row {
            --bs-gutter-x: 0.5rem;
            --bs-gutter-y: 0.55rem;
            gap: 0 !important;
          }
          
          .image-container {
            aspect-ratio: 4 / 3;
            height: auto !important;
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

          .browse-modal-backdrop {
            align-items: flex-end;
            padding: 8px !important;
          }

          .browse-modal-content {
            width: 100% !important;
            max-width: none !important;
            max-height: calc(100dvh - 16px) !important;
            border-radius: 16px 16px 10px 10px !important;
          }

          .browse-modal-close-btn {
            width: 32px !important;
            height: 32px !important;
            top: 10px !important;
            right: 10px !important;
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
            box-shadow: 0 4px 16px rgba(37, 99, 235, 0.08) !important;
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

        .browse-page-shell {
          color: var(--browse-ink);
        }

        .browse-grid {
          --bs-gutter-x: 0.9rem;
          --bs-gutter-y: 0.9rem;
        }

        .browse-page-shell .item-card {
          border: 1px solid var(--browse-border) !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06) !important;
          background: #fff;
        }

        .browse-page-shell .item-card:hover {
          box-shadow: 0 16px 34px rgba(15, 23, 42, 0.11) !important;
        }

        .browse-page-shell .card-title {
          color: var(--browse-ink) !important;
          font-size: 0.88rem !important;
          line-height: 1.25;
        }

        .browse-page-shell .card-text {
          color: var(--browse-muted) !important;
          line-height: 1.4 !important;
        }

        .browse-page-shell .image-container {
          background: #f8fafc;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          border-radius: 8px 8px 0 0 !important;
        }

        .browse-page-shell .image-container img {
          background: #f8fafc;
          padding: 6px;
        }

        .browse-page-shell .type-badge {
          box-shadow: none !important;
          border-radius: 999px !important;
          letter-spacing: 0 !important;
        }

        .browse-filter-panel .form-control,
        .browse-filter-panel .form-select,
        .browse-filter-panel .input-group-text {
          border-color: #dbe4f0 !important;
          background-color: #fff;
        }

        .browse-filter-panel .form-control,
        .browse-filter-panel .form-select {
          min-height: 38px;
        }

        .filter-label {
          color: #334155;
          letter-spacing: 0;
        }

        .browse-modal-backdrop {
          background: rgba(15, 23, 42, 0.55);
        }

        .browse-modal-content {
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28);
        }

        .browse-modal-header {
          background: linear-gradient(135deg, #0f172a 0%, #0f766e 100%);
        }

        .browse-modal-body {
          background: #f8fafc;
        }

        .browse-modal-body .modal-detail-card,
        .browse-modal-body .contact-info {
          border-color: rgba(15, 23, 42, 0.08);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
        }

        .browse-modal-footer {
          background: #fff;
        }

        @media (max-width: 576px) {
          .browse-page-shell {
            padding-left: 8px;
            padding-right: 8px;
          }

          .browse-stats {
            gap: 6px;
          }

          .browse-stat {
            padding: 8px;
          }

          .browse-stat-value {
            font-size: 1rem;
          }

          .browse-grid {
            --bs-gutter-x: 0.55rem;
            --bs-gutter-y: 0.65rem;
          }

          .browse-card-body {
            min-height: 118px;
          }
        }
        
        /* Image click to expand */
        .clickable-image {
          cursor: pointer;
        }
      `}</style>

      <div className="container browse-page-shell py-4 fade-in">
        <div className="browse-hero text-white rounded-3 p-3 p-md-4 mb-3 position-relative overflow-hidden">
          <div className="position-relative z-2">
            <h1 className="h4 fw-bold mb-2">GCUF Lost & Found Hub</h1>
            <p className="small mb-3 opacity-90">
              Report lost items and return found belongings on campus.
            </p>

            <div className="browse-stats">
              <div className="browse-stat">
                <div className="browse-stat-value">{items.length}</div>
                <div className="browse-stat-label">Total</div>
              </div>
              <div className="browse-stat">
                <div className="browse-stat-value">
                  {items.filter(i => i.type === 'found').length}
                </div>
                <div className="browse-stat-label">Found</div>
              </div>
              <div className="browse-stat">
                <div className="browse-stat-value">
                  {items.filter(i => i.type === 'lost').length}
                </div>
                <div className="browse-stat-label">Lost</div>
              </div>
            </div>
          </div>
        </div>


        <div className="browse-filter-panel rounded-3 p-3 mb-3">
          <div className="row g-2 align-items-end browse-filter-row">
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(24);
                  }}
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <div className="col-4 col-md-3">
              <label className="filter-label small"><FaFilter size={10} /> Type</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setVisibleCount(24);
                }}
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
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setVisibleCount(24);
                }}
                className="form-select form-select-sm py-1"
                style={{ fontSize: '0.75rem', paddingRight: '1.9rem' }}
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
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setVisibleCount(24);
                }}
                className="form-select form-select-sm py-1"
                style={{ fontSize: '0.75rem', paddingRight: '2rem' }}
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
                  setVisibleCount(24);
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}

          {status === "succeeded" && sortedItems.length > 0 && (
            <div className="row browse-grid">
              {visibleItems.map((item) => (
                <div
                  key={item._id}
                  className="col-6 col-md-4 col-lg-3"
                >
                  <div
                    className="card card-hover-3d h-100 border-0 shadow-sm position-relative item-card"
                    onClick={() => handleItemClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="image-container">
                      {item.imageUrl ? (
                        <>
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            loading="lazy"
                          />
                          <div className="image-overlay"></div>
                        </>
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center"
                          style={{ background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)' }}>
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
                          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                          textTransform: 'uppercase',
                          background: item.type === "lost"
                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                            : item.type === "found"
                              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                              : 'linear-gradient(135deg, #2563eb 0%, #14b8a6 100%)'
                        }}>
                        {item.type === "lost" ? "LOST" : item.type === "found" ? "FOUND" : "OK"}
                      </span>

                      <button className="view-details-btn" style={{ padding: '4px 8px', fontSize: '0.6rem', borderRadius: '6px' }}>
                        <FaEye size={10} /> View
                      </button>
                    </div>

                    <div className="card-body browse-card-body d-flex flex-column p-2 p-md-3">
                      <h6 className="card-title fw-bold mb-1 line-clamp-1" style={{ fontSize: '0.8rem' }}>{item.title}</h6>
                      <p className="card-text flex-grow-1 mb-2 line-clamp-2" style={{ fontSize: '0.68rem', color: '#6c757d' }}>
                        {item.description}
                      </p>

                      <div className="mt-auto">
                        <div className="browse-card-meta d-flex align-items-center mb-1" style={{ color: 'var(--secondary-color)' }}>
                          <FaMapMarkerAlt size={10} className="me-1" style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                          <span className="text-truncate" style={{ fontSize: '0.65rem' }}>{item.location}</span>
                        </div>

                        {item.date && (
                          <div className="browse-card-meta d-flex align-items-center" style={{ color: 'var(--secondary-color)' }}>
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

          {status === "succeeded" && hasMoreItems && (
            <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm rounded-pill px-4"
                onClick={() => setVisibleCount((count) => count + 24)}
              >
                Load More
              </button>
            </div>
          )}
        </div>


        {showModal && selectedItem && (
          <div className="browse-modal-backdrop" onClick={handleCloseModal}>
            <div className="browse-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="browse-modal-header d-flex align-items-center gap-2">
                <span className="browse-modal-status-badge text-white" style={{
                    background: selectedItem.type === 'lost' 
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  }}>
                    {selectedItem.type.toUpperCase()}
                </span>
                <h6 className="browse-modal-title flex-grow-1 mb-0" style={{ fontSize: '0.9rem' }}>
                  <span className="browse-modal-title-text">{selectedItem.title}</span>
                </h6>
                <button className="browse-modal-close-btn" onClick={handleCloseModal}>
                  <FaTimes size={14} />
                </button>
              </div>

              <div className="browse-modal-body p-3">
                {selectedItem.imageUrl && (
                  <div className="item-image-modal mb-3" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.title}
                    />
                  </div>
                )}

                <div className="modal-detail-card mb-2">
                  <div className="detail-label" style={{ fontSize: '0.65rem' }}>Description</div>
                  <div className="detail-value" style={{ fontSize: '0.8rem', marginBottom: '0' }}>{selectedItem.description}</div>
                </div>

                <div className="modal-detail-grid mb-2">
                  <div className="modal-detail-card">
                    <div className="detail-label" style={{ fontSize: '0.65rem' }}>Location</div>
                    <div className="d-flex align-items-start" style={{ fontSize: '0.78rem' }}>
                      <FaMapMarkerAlt size={10} className="me-1" style={{ color: 'var(--primary-color)' }} />
                      <span>{selectedItem.location}</span>
                    </div>
                  </div>
                  <div className="modal-detail-card">
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

                <div className="contact-info modal-detail-card">
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
                        <div className="modal-contact-line d-flex align-items-start" style={{ fontSize: '0.75rem' }}>
                          <FaEnvelope size={10} className="me-1" style={{ color: 'var(--primary-color)' }} />
                          <span>{selectedItem.user.email}</span>
                        </div>
                      </div>
                    )}
                    {selectedItem.user?.phone && user && String(user.id) !== String(selectedItem.user._id) && (
                      <div className="col-12">
                        <div className="detail-label" style={{ fontSize: '0.6rem' }}>Phone</div>
                        <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                          <div className="modal-contact-line d-flex align-items-center flex-grow-1" style={{ fontSize: '0.75rem', minWidth: 0 }}>
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

              <div className="browse-modal-footer py-2 px-3">
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



