"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyItems } from "../../store/slices/myItemsSlice";
import { useRouter } from "next/navigation";
import {
  FaUserCircle,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaBoxOpen,
  FaSearch,
  FaCamera,
  FaTimes,
  FaCheckCircle,
  FaCheck,
  FaHistory,
  FaImage,
} from "react-icons/fa";
import toast from "react-hot-toast";

export default function MyItemsPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  
  const {
    loading,
    error,
  } = useSelector((state) => state.myItems || {});

  
  const [items, setItems] = useState([]);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    type: "",
    location: "",
    imageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [updating, setUpdating] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [resolvingItem, setResolvingItem] = useState(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    let interval;

    async function checkAuth() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          router.push("/loginPage");
          return;
        }
        const fetchedItems = await dispatch(fetchMyItems()).unwrap();
        setItems(fetchedItems || []);
      } catch (err) {
        router.push("/loginPage");
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuth();

    interval = setInterval(async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) router.push("/loginPage");
      } catch {
        router.push("/loginPage");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [dispatch, router]);

  const filteredItems = (items || []).filter((item) => {
    if (activeFilter !== "all" && item.type !== activeFilter) return false;
    if (
      searchQuery &&
      !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const stats = {
    total: items.length,
    lost: items.filter((item) => item.type === "lost").length,
    found: items.filter((item) => item.type === "found").length,
    resolved: items.filter((item) => item.type === "resolved").length,
    recent: items.filter((item) => {
      const itemDate = new Date(item.date || item.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return itemDate > weekAgo;
    }).length,
  };

  function openConfirmDelete(item) {
    setConfirmDelete(item);
  }

  async function handleDeleteConfirmed() {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/items/${confirmDelete._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Delete failed");
      }

      toast.success("Item deleted successfully!", {
        style: { background: "#667eea", color: "white" },
      });

      setItems((prevItems) =>
        prevItems.filter((item) => item._id !== confirmDelete._id)
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete item.", {
        style: { background: "#ef4444", color: "white" },
      });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }

  function openEditModal(item) {
    setEditingItem(item);
    setEditForm({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "",
      type: item.type || "",
      location: item.location || "",
      imageUrl: item.imageUrl || "",
    });
    setImagePreview(item.imageUrl || "");
    document.body.style.overflow = "hidden";
  }

  function closeEditModal() {
    setEditingItem(null);
    setImagePreview("");
    document.body.style.overflow = "auto";
  }

  function closeDeleteModal() {
    setConfirmDelete(null);
    document.body.style.overflow = "auto";
  }

  async function handleMarkAsResolved(item) {
    setResolvingItem(item);
    try {
      setResolving(true);
      const res = await fetch(`/api/items/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          type: "resolved",
          resolvedAt: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to mark as resolved");
      }

      // Update the specific item in local state to show the resolved badge
      setItems((prevItems) =>
        prevItems.map((prevItem) =>
          prevItem._id === item._id
            ? { ...prevItem, type: "resolved" }
            : prevItem
        )
      );

      toast.success("Item marked as resolved!", {
        style: { background: "#667eea", color: "white" },
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to mark as resolved.", {
        style: { background: "#ef4444", color: "white" },
      });
    } finally {
      setResolving(false);
      setResolvingItem(null);
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result;

      const uploadToastId = toast.loading("Uploading image...");

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Upload failed");
        }

        setImagePreview(data.url);
        setEditForm((prev) => ({ ...prev, imageUrl: data.url }));

        toast.dismiss(uploadToastId);
        toast.success("Image uploaded successfully!", {
          style: { background: "#667eea", color: "white" },
        });
      } catch (err) {
        console.error(err);
        toast.dismiss(uploadToastId);
        toast.error("Image upload failed", {
          style: { background: "#ef4444", color: "white" },
        });
      }
    };

    reader.readAsDataURL(file);
  }

  async function handleUpdateSubmit() {
    if (!editingItem) return;

    try {
      setUpdating(true);

      const res = await fetch(`/api/items/${editingItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Update failed");
      }

      toast.success("Item updated!", {
        style: { background: "#667eea", color: "white" },
      });

      // Update the item in local state
      setItems((prevItems) =>
        prevItems.map((prevItem) =>
          prevItem._id === editingItem._id
            ? { ...prevItem, ...editForm }
            : prevItem
        )
      );

      closeEditModal();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update item.", {
        style: { background: "#ef4444", color: "white" },
      });
    } finally {
      setUpdating(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div
            className="spinner-border"
            style={{ width: "3rem", height: "3rem", color: "#667eea" }}
            role="status"
          >
            <span className="visually-hidden">Checking authentication...</span>
          </div>
          <p className="mt-3" style={{ color: "#764ba2" }}>
            Verifying your identity...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
        }

        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(37, 99, 235, 0.1);
          border-radius: 16px;
        }

        .stat-card {
          background: linear-gradient(
            135deg,
            rgba(37, 99, 235, 0.05) 0%,
            rgba(20, 184, 166, 0.05) 100%
          );
          border-radius: 16px;
          border: 2px solid rgba(37, 99, 235, 0.1);
          transition: all 0.3s ease;
          min-height: 96px;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(37, 99, 235, 0.15);
          border-color: rgba(37, 99, 235, 0.3);
        }

        .item-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 1px solid rgba(37, 99, 235, 0.1);
          border-radius: 16px;
          overflow: hidden;
          background: white;
        }

        .item-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 50px rgba(37, 99, 235, 0.15),
            0 15px 30px rgba(0, 0, 0, 0.1);
        }

        .type-badge {
          font-weight: 600;
          letter-spacing: 0.5px;
          padding: 2px 8px;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);
          text-transform: uppercase;
          font-size: 0.7rem;
        }

        .status-badge {
          font-weight: 600;
          letter-spacing: 0.5px;
          padding: 2px 8px;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);
          text-transform: uppercase;
          font-size: 0.7rem;
        }

        .image-container {
          aspect-ratio: 4 / 3;
          height: auto;
          overflow: hidden;
          border-radius: 16px 16px 0 0;
          background: #f4f6fb;
        }

        .image-container img {
          object-fit: contain;
          background: #f4f6fb;
          transition: transform 0.2s ease;
        }

        .my-item-placeholder {
          width: 100%;
          height: 100%;
          background: #eef1f8;
          color: #667eea;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          text-align: center;
        }

        .my-item-placeholder svg {
          width: 24px;
          height: 24px;
          opacity: 0.8;
        }

        .item-card:hover .image-container img {
          transform: scale(1.02);
        }

        .modal-backdrop-custom {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .modal-content-custom {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          max-width: 500px;
          width: 100%;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
        }

        .modal-header-custom {
          padding: 20px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          position: relative;
        }

        .modal-body-custom {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .modal-footer-custom {
          padding: 20px 24px;
          border-top: 1px solid rgba(37, 99, 235, 0.1);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .close-modal-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-modal-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }

        .form-control-custom {
          border: 1px solid rgba(37, 99, 235, 0.2);
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 14px;
          transition: all 0.2s ease;
          width: 100%;
          margin-bottom: 16px;
        }

        .form-control-custom:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .image-upload-container {
          border: 2px dashed rgba(37, 99, 235, 0.3);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          background: rgba(37, 99, 235, 0.03);
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 16px;
        }

        .image-upload-container:hover {
          background: rgba(37, 99, 235, 0.08);
          border-color: #667eea;
        }

        .image-preview {
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
          max-height: 200px;
        }

        .image-preview img {
          width: 100%;
          height: auto;
          object-fit: contain;
          background: #f4f6fb;
        }

        .btn-primary-custom {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary-custom:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
        }

        .btn-primary-custom:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-outline-custom {
          background: transparent;
          color: #667eea;
          border: 2px solid #667eea;
          border-radius: 10px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-outline-custom:hover {
          background: rgba(37, 99, 235, 0.1);
        }

        .btn-danger-custom {
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-danger-custom:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(239, 68, 68, 0.3);
        }

        .btn-success-custom {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-success-custom:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .action-btn {
          transition: all 0.3s ease;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          padding: 0 !important;
          margin: 0 !important;
          border: 0;
          background: transparent;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-actions {
          display: inline-flex;
          align-items: center;
          justify-content: flex-end;
          column-gap: 2px;
          flex-shrink: 0;
        }

        .item-category-badge {
          flex-shrink: 0;
          white-space: nowrap;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        
        /* Mobile Responsive Styles - COMPACT */
        @media (max-width: 768px) {
          .gradient-bg {
            padding: 1rem !important;
            border-radius: 12px !important;
          }
          
          .gradient-bg h1 {
            font-size: 1.1rem !important;
          }
          
          .gradient-bg .lead {
            font-size: 0.75rem !important;
          }
          
          .stat-card {
            padding: 0.6rem !important;
          }
          
          .stat-card .display-5 {
            font-size: 1.1rem !important;
          }
          
          .glass-effect {
            padding: 0.75rem !important;
          }
          
          .item-card {
            border-radius: 10px !important;
          }
          
          .image-container {
            aspect-ratio: 4 / 3;
            height: auto !important;
          }
          
          .item-card .card-body {
            padding: 10px !important;
          }
          
          .modal-content-custom {
            margin: 8px;
            max-height: calc(100vh - 60px);
            border-radius: 12px !important;
          }
          
          .modal-header-custom {
            padding: 12px !important;
          }
          
          .modal-body-custom {
            padding: 12px !important;
          }
          
          .modal-footer-custom {
            padding: 10px 12px !important;
            flex-wrap: wrap;
          }
          
          .modal-footer-custom button {
            flex: 1;
            min-width: 80px;
            padding: 8px 12px !important;
            font-size: 0.75rem !important;
          }

          .edit-modal {
            max-width: 360px;
          }

          .edit-modal .modal-header-custom h5 {
            font-size: 1rem !important;
          }

          .edit-modal .close-modal-btn {
            width: 28px !important;
            height: 28px !important;
            top: 10px !important;
            right: 10px !important;
          }

          .edit-modal .form-control-custom {
            padding: 8px 10px !important;
            margin-bottom: 10px !important;
            border-radius: 8px !important;
            font-size: 0.78rem !important;
          }

          .edit-modal textarea.form-control-custom {
            min-height: 70px;
          }

          .edit-modal .image-preview {
            max-height: 140px !important;
            margin-bottom: 10px !important;
            border-radius: 10px !important;
          }

          .edit-modal .image-preview img {
            height: 140px !important;
            object-fit: contain;
          }

          .edit-modal .image-upload-container {
            padding: 12px !important;
            margin-bottom: 10px !important;
          }

          .edit-modal .btn-outline-custom,
          .edit-modal .btn-primary-custom {
            padding: 8px 12px !important;
            border-radius: 10px !important;
            font-size: 0.72rem !important;
          }
        }
        
        @media (max-width: 576px) {
          .container {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
          
          .py-5 {
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
          }
          
          .mb-5 {
            margin-bottom: 0.75rem !important;
          }
          
          .gradient-bg {
            padding: 0.75rem !important;
          }
          
          .gradient-bg h1 {
            font-size: 1rem !important;
          }
          
          .gradient-bg .lead {
            font-size: 0.68rem !important;
          }
          
          .gradient-bg .btn-lg {
            padding: 8px 12px !important;
            font-size: 0.72rem !important;
          }
          
          .gradient-bg .bg-white.rounded-circle {
            width: 36px !important;
            height: 36px !important;
            padding: 8px !important;
          }
          
          .stat-card {
            padding: 0.5rem !important;
            border-radius: 8px !important;
          }
          
          .stat-card .display-5 {
            font-size: 1rem !important;
          }
          
          .stat-card .small {
            font-size: 0.58rem !important;
          }
          
          .glass-effect {
            padding: 0.6rem !important;
            border-radius: 10px !important;
          }
          
          .glass-effect .input-group {
            margin-bottom: 0.5rem;
          }
          
          .filter-btn {
            padding: 5px 10px !important;
            font-size: 0.68rem !important;
            border-radius: 6px !important;
          }

          .my-items-filter-row {
            display: grid !important;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 5px !important;
          }

          .my-items-filter-row .filter-btn {
            width: 100%;
            min-width: 0;
            padding: 5px 3px !important;
            font-size: 0.58rem !important;
            white-space: nowrap;
          }
          
          .image-container {
            aspect-ratio: 4 / 3;
            height: auto !important;
          }

          .my-item-placeholder {
            gap: 4px;
            font-size: 0.58rem;
          }

          .my-item-placeholder svg {
            width: 18px;
            height: 18px;
          }
          
          .type-badge,
          .status-badge {
            font-size: 0.52rem !important;
            padding: 2px 6px !important;
            border-radius: 4px !important;
          }
          
          .item-card .card-body h5 {
            font-size: 0.8rem !important;
            margin-bottom: 4px !important;
          }
          
          .item-card .card-body p {
            font-size: 0.68rem !important;
          }

          .my-item-meta,
          .my-item-meta span {
            font-size: 0.58rem !important;
            line-height: 1.2;
          }

          .my-item-meta svg {
            width: 9px;
            height: 9px;
            margin-right: 4px !important;
          }
          
          .action-btn {
            width: 20px !important;
            height: 20px !important;
            border-radius: 6px !important;
          }
          
          .action-btn svg {
            width: 10px !important;
            height: 10px !important;
          }

          .card-actions {
            column-gap: 1px !important;
          }

          .item-category-badge {
            font-size: 0.55rem !important;
          }
          
          .form-control-custom {
            padding: 8px 12px !important;
            font-size: 16px !important;
            border-radius: 6px !important;
          }
          
          /* 2 column grid on mobile */
          .col-md-6.col-lg-4 {
            width: 50% !important;
            flex: 0 0 50% !important;
          }
          
          .g-4 {
            --bs-gutter-x: 0.5rem;
            --bs-gutter-y: 0.5rem;
          }
        }
        
        /* Touch-friendly */
        @media (hover: none) {
          .item-card:hover {
            transform: none;
          }
          
          .item-card:active {
            transform: scale(0.97);
          }
          
          .stat-card:hover {
            transform: none;
          }
        }
      `}</style>

      <div className="container py-5">
        <div className="gradient-bg text-white rounded-4 p-5 mb-5 shadow-lg">
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="d-flex align-items-center mb-3">
                <div
                  className="bg-white rounded-circle me-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "48px",
                    height: "48px",
                    boxShadow: "0 8px 20px rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <FaUserCircle size={30} style={{ color: "#667eea" }} />
                </div>
                <div>
                  <h1 className="display-5 fw-bold mb-1">
                    Your Reported Items
                  </h1>
                  <p className="lead opacity-90 mb-0">
                    Manage your lost and found reports
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 text-md-end">
              <button
                className="btn btn-light btn-lg px-4 py-2 rounded-pill fw-bold"
                onClick={() => router.push("/browse")}
                style={{ color: "#667eea" }}
              >
                Browse All Items
              </button>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-6 col-md-3">
            <div className="stat-card text-center p-4 d-flex flex-column align-items-center justify-content-center">
              <div
                className="display-5 fw-bold mb-1"
                style={{ color: "#667eea" }}
              >
                {stats.total}
              </div>
              <div className="small" style={{ color: "#764ba2" }}>
                Total Items
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card text-center p-4 d-flex flex-column align-items-center justify-content-center">
              <div
                className="display-5 fw-bold mb-1"
                style={{ color: "#667eea" }}
              >
                {stats.lost}
              </div>
              <div className="small" style={{ color: "#764ba2" }}>
                Lost Items
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card text-center p-4 d-flex flex-column align-items-center justify-content-center">
              <div
                className="display-5 fw-bold mb-1"
                style={{ color: "#667eea" }}
              >
                {stats.found}
              </div>
              <div className="small" style={{ color: "#764ba2" }}>
                Found Items
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card text-center p-4 d-flex flex-column align-items-center justify-content-center">
              <div
                className="display-5 fw-bold mb-1"
                style={{ color: "#667eea" }}
              >
                {stats.resolved}
              </div>
              <div className="small" style={{ color: "#764ba2" }}>
                Resolved
              </div>
            </div>
          </div>
        </div>

        <div className="glass-effect p-4 mb-5">
          <div className="row align-items-center">
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FaSearch style={{ color: "#667eea" }} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search your items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ borderColor: "rgba(37, 99, 235, 0.2)" }}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex flex-wrap gap-2 my-items-filter-row">
                <button
                  className={`filter-btn btn px-3 py-2 rounded-pill fw-medium ${activeFilter === "all" ? "active" : ""
                    }`}
                  onClick={() => setActiveFilter("all")}
                  style={{
                    background:
                      activeFilter === "all"
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "transparent",
                    color: activeFilter === "all" ? "white" : "#667eea",
                    border:
                      activeFilter === "all"
                        ? "2px solid transparent"
                        : "2px solid #667eea",
                  }}
                >
                  All Items
                </button>
                <button
                  className={`filter-btn btn px-3 py-2 rounded-pill fw-medium ${activeFilter === "lost" ? "active" : ""
                    }`}
                  onClick={() => setActiveFilter("lost")}
                  style={{
                    background:
                      activeFilter === "lost"
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "transparent",
                    color: activeFilter === "lost" ? "white" : "#667eea",
                    border:
                      activeFilter === "lost"
                        ? "2px solid transparent"
                        : "2px solid #667eea",
                  }}
                >
                  Lost Items
                </button>
                <button
                  className={`filter-btn btn px-3 py-2 rounded-pill fw-medium ${activeFilter === "found" ? "active" : ""
                    }`}
                  onClick={() => setActiveFilter("found")}
                  style={{
                    background:
                      activeFilter === "found"
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "transparent",
                    color: activeFilter === "found" ? "white" : "#667eea",
                    border:
                      activeFilter === "found"
                        ? "2px solid transparent"
                        : "2px solid #667eea",
                  }}
                >
                  Found Items
                </button>
                <button
                  className={`filter-btn btn px-3 py-2 rounded-pill fw-medium ${activeFilter === "resolved" ? "active" : ""
                    }`}
                  onClick={() => setActiveFilter("resolved")}
                  style={{
                    background:
                      activeFilter === "resolved"
                        ? "linear-gradient(135deg, #667eea 0%, #667eea 100%)"
                        : "transparent",
                    color: activeFilter === "resolved" ? "white" : "#667eea",
                    border:
                      activeFilter === "resolved"
                        ? "2px solid transparent"
                        : "2px solid #667eea",
                  }}
                >
                  Resolved
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border"
              style={{ width: "3rem", height: "3rem", color: "#667eea" }}
              role="status"
            >
              <span className="visually-hidden">Loading your items...</span>
            </div>
            <p className="mt-3" style={{ color: "#764ba2" }}>
              Loading your reported items...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <div className="display-1 mb-3">❌</div>
            <h3 className="h4 fw-bold mb-2" style={{ color: "#667eea" }}>
              Error Loading Items
            </h3>
            <p className="mb-4" style={{ color: "#764ba2" }}>
              {error}
            </p>
            <button
              className="btn px-4 py-2 rounded-pill fw-bold text-white"
              onClick={() => dispatch(fetchMyItems())}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              Try Again
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state text-center py-5 my-4">
            <div className="display-1 mb-3">
              <FaBoxOpen size={80} style={{ color: "#667eea" }} />
            </div>
            <h3 className="h4 fw-bold mb-2" style={{ color: "#667eea" }}>
              No items found
            </h3>
            <p className="mb-4" style={{ color: "#764ba2" }}>
              {searchQuery || activeFilter !== "all"
                ? "Try adjusting your filters or search"
                : "You haven't reported any items yet"}
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button
                className="btn px-4 py-2 rounded-pill fw-bold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
                onClick={() => router.push("/lost")}
              >
                Report Lost Item
              </button>
              <button
                className="btn px-4 py-2 rounded-pill fw-bold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
                onClick={() => router.push("/found")}
              >
                Report Found Item
              </button>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {filteredItems.map((item) => (
              <div key={item._id} className="col-md-6 col-lg-4">
                <div className="item-card h-100 shadow-sm">
                  <div className="image-container position-relative">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        className="card-img-top w-100 h-100 object-contain"
                        alt={item.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="my-item-placeholder">
                        <FaImage />
                        <span>No image</span>
                      </div>
                    )}
                    <div className="position-absolute top-0 start-0 m-3 d-flex flex-column gap-1">
                      <span
                        className="type-badge text-white"
                        style={{
                          background:
                            item.type === "lost"
                              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                              : item.type === "found"
                                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      >
                        {item.type?.toUpperCase()}
                      </span>

                    </div>
                  </div>

                  <div className="card-body p-4">
                    <h5
                      className="card-title fw-bold mb-2"
                      style={{ color: "#667eea" }}
                    >
                      {item.title}
                    </h5>
                    <p
                      className="card-text small mb-3"
                      style={{
                        color: "#764ba2",
                        display: "-webkit-box",
                        WebkitLineClamp: "2",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.description}
                    </p>

                    <div className="mb-3">
                      <div className="d-flex align-items-center small mb-2 my-item-meta">
                        <FaMapMarkerAlt
                          className="me-2 flex-shrink-0"
                          style={{ color: "#667eea" }}
                          size={12}
                        />
                        <span
                          className="text-truncate"
                          style={{ color: "#764ba2" }}
                        >
                          {item.location}
                        </span>
                      </div>

                      {item.date && (
                        <div className="d-flex align-items-center small my-item-meta">
                          <FaCalendarAlt
                            className="me-2 flex-shrink-0"
                            style={{ color: "#667eea" }}
                            size={12}
                          />
                          <span style={{ color: "#764ba2" }}>
                            {new Date(item.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="d-flex justify-content-between align-items-center gap-1 pt-3 border-top">
                      <span
                        className="badge item-category-badge"
                        style={{
                          background: "rgba(37, 99, 235, 0.1)",
                          color: "#667eea",
                          textTransform: "capitalize",
                        }}
                      >
                        {item.category}
                      </span>
                      <div className="card-actions">
                        {item.type !== "resolved" && (
                          <button
                            className="action-btn"
                            onClick={() => handleMarkAsResolved(item)}
                            disabled={
                              resolving && resolvingItem?._id === item._id
                            }
                          >
                            {resolving && resolvingItem?._id === item._id ? (
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                              ></span>
                            ) : (
                              <div style={{ color: "#4fe263" }}>
                                <FaCheck size={12} />
                              </div>
                            )}
                          </button>
                        )}
                        <button
                          className="action-btn"
                          onClick={() => openEditModal(item)}
                        >
                          <div style={{ color: "#667eea" }}>
                            <FaEdit size={12} />
                          </div>
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => {
                            openConfirmDelete(item);
                            document.body.style.overflow = "hidden";
                          }}
                        >
                          <div style={{ color: "#f05020" }}>
                            <FaTrash size={12} />
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="text-center mt-5 pt-4 border-top">
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <button
                className="btn px-4 py-2 rounded-pill fw-bold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
                onClick={() => router.push("/lost")}
              >
                Report New Lost Item
              </button>
              <button
                className="btn px-4 py-2 rounded-pill fw-bold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
                onClick={() => router.push("/found")}
              >
                Report New Found Item
              </button>
              <button
                className="btn px-4 py-2 rounded-pill fw-bold"
                style={{
                  border: "2px solid #667eea",
                  color: "#667eea",
                  background: "transparent",
                }}
                onClick={() => router.push("/browse")}
              >
                Browse Community Items
              </button>
            </div>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="modal-backdrop-custom" onClick={closeDeleteModal}>
          <div
            className="modal-content-custom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-custom">
              <h5 className="fw-bold mb-0">Confirm Delete</h5>
              <button className="close-modal-btn" onClick={closeDeleteModal}>
                <FaTimes size={16} />
              </button>
            </div>

            <div className="modal-body-custom">
              <p style={{ color: "#764ba2", marginBottom: 0 }}>
                Are you sure you want to permanently delete{" "}
                <strong style={{ color: "#667eea" }}>
                  {confirmDelete.title}
                </strong>
                ?
              </p>
            </div>

            <div className="modal-footer-custom">
              <button
                className="btn-outline-custom"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn-danger-custom"
                onClick={handleDeleteConfirmed}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="modal-backdrop-custom" onClick={closeEditModal}>
          <div
            className="modal-content-custom edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-custom">
              <h5 className="fw-bold mb-0">Update Item</h5>
              <button className="close-modal-btn" onClick={closeEditModal}>
                <FaTimes size={16} />
              </button>
            </div>

            <div className="modal-body-custom">
              <input
                className="form-control-custom"
                placeholder="Title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
              />

              <textarea
                className="form-control-custom"
                placeholder="Description"
                rows="3"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />

              <input
                className="form-control-custom"
                placeholder="Location"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
              />

              <select
                className="form-control-custom"
                value={editForm.category}
                onChange={(e) =>
                  setEditForm({ ...editForm, category: e.target.value })
                }
              >
                <option value="">Select Category</option>
                <option value="electronics">Electronics</option>
                <option value="documents">Documents</option>
                <option value="clothing">Clothing</option>
                <option value="jewelry">Jewelry</option>
                <option value="stationary">Stationary</option>
                <option value="keys">Keys</option>
                <option value="bags">Bags & Wallets</option>
                <option value="other">Other</option>
              </select>

              <select
                className="form-control-custom"
                value={editForm.type}
                onChange={(e) =>
                  setEditForm({ ...editForm, type: e.target.value })
                }
              >
                <option value="">Select Type</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
                <option value="resolved">Resolved</option>
              </select>

              <div>
                <label
                  className="d-block mb-2 small fw-medium"
                  style={{ color: "#667eea" }}
                >
                  Item Image
                </label>

                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="preview" />
                  </div>
                ) : (
                  <div
                    className="image-upload-container"
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                  >
                    <FaCamera
                      size={32}
                      style={{ color: "#667eea", marginBottom: 12 }}
                    />
                    <p className="mb-1" style={{ color: "#667eea" }}>
                      Click to upload image
                    </p>
                    <p className="small text-muted mb-0">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}

                <input
                  id="image-upload"
                  type="file"
                  className="d-none"
                  accept="image/*"
                  onChange={handleImageUpload}
                />

                {imagePreview && (
                  <button
                    type="button"
                    className="btn-outline-custom w-100"
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                  >
                    Change Image
                  </button>
                )}
              </div>
            </div>

            <div className="modal-footer-custom">
              <button
                className="btn-outline-custom"
                onClick={closeEditModal}
                disabled={updating}
              >
                Cancel
              </button>
              <button
                className="btn-primary-custom"
                onClick={handleUpdateSubmit}
                disabled={updating}
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


