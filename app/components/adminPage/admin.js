"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  fetchAdminItems,
  deleteItemAdmin,
  resolveItemAdmin,
} from "@/app/store/slices/itemsSlice";
import {
  FaSearch,
  FaEye,
  FaCheckCircle,
  FaTrash,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBoxOpen,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaSync,
  FaShieldAlt,
  FaDatabase,
  FaBell,
  FaHistory,
  FaUsers,
  FaUserShield,
  FaEnvelope,
  FaPhone,
  FaMapPin,
  FaUserCog,
  FaImage,
} from "react-icons/fa";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const router = useRouter();
  const items = useSelector((state) => state.items.list);
  const status = useSelector((state) => state.items.status);
  const error = useSelector((state) => state.items.error);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [managementSection, setManagementSection] = useState("items");

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const [users, setUsers] = useState([]);
  const [usersStatus, setUsersStatus] = useState("idle");
  const [usersError, setUsersError] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userSortBy, setUserSortBy] = useState("newest");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActionLoading, setUserActionLoading] = useState(null);
  const [deleteUserConfirm, setDeleteUserConfirm] = useState(null);

  async function loadAdminUsers(showRefreshToast = false) {
    setUsersStatus("loading");
    setUsersError("");

    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load users");
      }

      setUsers(data);
      setUsersStatus("succeeded");

      if (showRefreshToast) {
        toast.success("User accounts refreshed");
      }
    } catch (err) {
      setUsersStatus("failed");
      setUsersError(err.message || "Failed to load users");

      if (showRefreshToast) {
        toast.error(err.message || "Failed to load users");
      }
    }
  }

  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const res = await fetch("/api/profile");

        if (!res.ok) {
          window.location.href = "/loginPage";
          return;
        }

        const userData = await res.json();
        setUser(userData);

        if (userData.role !== "admin" && !userData.isAdmin) {
          toast.error("Admin access required");
          router.push("/");
          return;
        }

        dispatch(fetchAdminItems());
        loadAdminUsers();
      } catch (err) {
        console.error("Auth check failed:", err);
        toast.error("Authentication failed");
        window.location.href = "/loginPage";
      } finally {
        setLoading(false);
      }
    }

    checkAdminAuth();
  }, [dispatch, router]);

  useEffect(() => {
    const hasOpenModal =
      selectedItem || deleteConfirm || selectedUser || deleteUserConfirm;
    document.body.style.overflow = hasOpenModal ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedItem, deleteConfirm, selectedUser, deleteUserConfirm]);

  const filteredItems = items
    .filter((item) => {
      if (
        searchQuery &&
        !item.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (activeTab !== "all" && item.type !== activeTab) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        default:
          return 0;
      }
    });

  const filteredUsers = users
    .filter((account) => {
      const search = userSearchQuery.toLowerCase();
      const matchesSearch =
        !search ||
        account.name?.toLowerCase().includes(search) ||
        account.email?.toLowerCase().includes(search) ||
        account.phone?.toLowerCase().includes(search);

      const matchesRole =
        userRoleFilter === "all" || account.role === userRoleFilter;

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      switch (userSortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "items":
          return (b.totalItems || 0) - (a.totalItems || 0);
        default:
          return 0;
      }
    });

  const itemStats = {
    total: items.length,
    lost: items.filter((item) => item.type === "lost").length,
    found: items.filter((item) => item.type === "found").length,
    resolved: items.filter((item) => item.type === "resolved").length,
    active: items.filter((item) => item.type !== "resolved").length,
    recent: items.filter((item) => {
      const itemDate = new Date(item.createdAt || item.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return itemDate > weekAgo;
    }).length,
  };

  const userStats = {
    total: users.length,
    admins: users.filter((account) => account.role === "admin").length,
    members: users.filter((account) => account.role === "user").length,
    activeReporters: users.filter((account) => (account.totalItems || 0) > 0)
      .length,
    recent: users.filter((account) => {
      const joinedAt = new Date(account.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return joinedAt > weekAgo;
    }).length,
    reports: users.reduce(
      (total, account) => total + (account.totalItems || 0),
      0
    ),
  };

  const handleResolve = async (itemId) => {
    setActionLoading(itemId);
    try {
      await dispatch(resolveItemAdmin(itemId)).unwrap();
      toast.success("Item marked as resolved!", {
        style: {
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
        },
      });
    } catch {
      toast.error("Failed to resolve item", {
        style: {
          background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
          color: "white",
        },
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (itemId) => {
    setActionLoading(itemId);
    try {
      await dispatch(deleteItemAdmin(itemId)).unwrap();
      toast.success("Item deleted successfully!", {
        style: {
          background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
          color: "white",
        },
      });
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete item", {
        style: {
          background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
          color: "white",
        },
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (account) => {
    const nextRole = account.role === "admin" ? "user" : "admin";
    setUserActionLoading(account.id);

    try {
      const res = await fetch(`/api/admin/users/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update user role");
      }

      setUsers((currentUsers) =>
        currentUsers.map((entry) => (entry.id === account.id ? data : entry))
      );
      setSelectedUser((currentSelectedUser) =>
        currentSelectedUser?.id === account.id ? data : currentSelectedUser
      );

      toast.success(
        `${account.name} is now ${nextRole === "admin" ? "an admin" : "a user"}`
      );
    } catch (err) {
      toast.error(err.message || "Failed to update user role");
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleDeleteUser = async (account) => {
    setUserActionLoading(account.id);

    try {
      const res = await fetch(`/api/admin/users/${account.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      setUsers((currentUsers) =>
        currentUsers.filter((entry) => entry.id !== account.id)
      );
      setDeleteUserConfirm(null);
      setSelectedUser(null);
      toast.success("User account deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setUserActionLoading(null);
    }
  };

  const openItemModal = (item) => {
    setSelectedItem(item);
  };

  const closeItemModal = () => {
    setSelectedItem(null);
  };

  const openDeleteModal = (item) => {
    setDeleteConfirm(item);
  };

  const closeDeleteModal = () => {
    setDeleteConfirm(null);
  };

  const openUserModal = (account) => {
    setSelectedUser(account);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
  };

  const openDeleteUserModal = (account) => {
    setDeleteUserConfirm(account);
  };

  const closeDeleteUserModal = () => {
    setDeleteUserConfirm(null);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "lost":
        return {
          bg: "#667eea",
          light: "rgba(37, 99, 235, 0.1)",
          gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        };
      case "found":
        return {
          bg: "#10b981",
          light: "rgba(16, 185, 129, 0.1)",
          gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        };
      case "resolved":
        return {
          bg: "#6b7280",
          light: "rgba(107, 114, 128, 0.1)",
          gradient: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
        };
      default:
        return {
          bg: "#667eea",
          light: "rgba(37, 99, 235, 0.1)",
          gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        };
    }
  };

  const getRoleStyle = (role) => {
    if (role === "admin") {
      return {
        bg: "rgba(245, 158, 11, 0.12)",
        color: "#d97706",
        label: "Admin",
      };
    }

    return {
      bg: "rgba(37, 99, 235, 0.1)",
      color: "#667eea",
      label: "User",
    };
  };

  if (loading) {
    return (
      <div className="container-fluid px-3 py-3">
        <div className="text-center py-5">
          <div
            className="spinner-border"
            style={{ width: "3rem", height: "3rem", color: "#667eea" }}
            role="status"
          >
            <span className="visually-hidden">
              Checking admin permissions...
            </span>
          </div>
          <p className="mt-3" style={{ color: "#764ba2" }}>
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  if (status === "loading" && usersStatus === "loading") {
    return (
      <div className="container-fluid admin-dashboard py-3 py-md-5 px-2 px-md-3">
        <div className="text-center py-5">
          <div
            className="spinner-border"
            style={{ width: "3rem", height: "3rem", color: "#667eea" }}
            role="status"
          >
            <span className="visually-hidden">Loading admin dashboard...</span>
          </div>
          <p className="mt-3" style={{ color: "#764ba2" }}>
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid admin-dashboard py-3 py-md-5 px-2 px-md-3">
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "18px",
        }}
       className="text-white rounded-4 admin-header p-3 p-md-4 mb-3 shadow-sm"
      >
        <div className="row align-items-center">
          <div className="col-md-8">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-white rounded-circle p-3 me-3 admin-header-icon">
                <FaShieldAlt size={30} style={{ color: "#667eea" }} />
              </div>
              <div>
                <h1 className="h3 fw-bold mb-1">Admin Dashboard</h1>
                <p className="lead opacity-90 mb-0 d-flex align-items-center flex-wrap gap-2">
                  <span className="d-inline-flex align-items-center">
                    <FaDatabase className="me-2" />
                    Welcome, {user?.name}
                  </span>
                  <span>&bull;</span>
                  <span>
                    Managing {items.length} items and {users.length} users
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 text-md-end">
            <div className="d-flex gap-2 justify-content-md-end flex-wrap">
              <button
                className="btn btn-light btn-sm px-3 py-2 rounded-pill fw-bold d-inline-flex align-items-center"
                onClick={() => {
                  dispatch(fetchAdminItems());
                  loadAdminUsers(true);
                }}
                style={{ color: "#667eea" }}
              >
                <FaSync className="me-2" />
                Refresh All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-3 p-3 p-md-4 mb-4 shadow-sm admin-section-card">
        <div className="d-flex flex-wrap gap-2 admin-section-switch">
          <button
            className="btn px-4 py-2 rounded-pill fw-bold admin-section-btn"
            onClick={() => setManagementSection("items")}
            style={{
              background:
                managementSection === "items"
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "transparent",
              color: managementSection === "items" ? "white" : "#667eea",
              border:
                managementSection === "items"
                  ? "2px solid transparent"
                  : "2px solid #667eea",
            }}
          >
            <FaBoxOpen className="me-2" />
            Manage Items
          </button>
          <button
            className="btn px-4 py-2 rounded-pill fw-bold admin-section-btn"
            onClick={() => setManagementSection("users")}
            style={{
              background:
                managementSection === "users"
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "transparent",
              color: managementSection === "users" ? "white" : "#667eea",
              border:
                managementSection === "users"
                  ? "2px solid transparent"
                  : "2px solid #667eea",
            }}
          >
            <FaUsers className="me-2" />
            Manage Users
          </button>
        </div>
      </div>

      {managementSection === "items" ? (
        <>
          {status === "failed" ? (
            <div className="container px-0">
              <div className="text-center py-5">
                <FaExclamationTriangle
                  size={64}
                  style={{ color: "#ef4444" }}
                  className="mb-3"
                />
                <h3 className="h4 fw-bold mb-2" style={{ color: "#667eea" }}>
                  Error Loading Items
                </h3>
                <p className="mb-4" style={{ color: "#764ba2" }}>
                  {error || "An error occurred"}
                </p>
                <button
                  className="btn px-4 py-2 rounded-pill fw-bold text-white"
                  onClick={() => dispatch(fetchAdminItems())}
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  <FaSync className="me-2" />
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="row g-4 mb-5 admin-stats-row">
                {[
                  {
                    title: "Total Items",
                    value: itemStats.total,
                    color: "#667eea",
                    icon: <FaBoxOpen />,
                    bg: "rgba(37, 99, 235, 0.1)",
                  },
                  {
                    title: "Lost Items",
                    value: itemStats.lost,
                    color: "#667eea",
                    icon: <FaExclamationTriangle />,
                    bg: "rgba(37, 99, 235, 0.1)",
                  },
                  {
                    title: "Found Items",
                    value: itemStats.found,
                    color: "#10b981",
                    icon: <FaCheckCircle />,
                    bg: "rgba(16, 185, 129, 0.1)",
                  },
                  {
                    title: "Resolved",
                    value: itemStats.resolved,
                    color: "#10b981",
                    icon: <FaCheck />,
                    bg: "rgba(16, 185, 129, 0.1)",
                  },
                  {
                    title: "Active",
                    value: itemStats.active,
                    color: "#667eea",
                    icon: <FaBell />,
                    bg: "rgba(37, 99, 235, 0.1)",
                  },
                  {
                    title: "This Week",
                    value: itemStats.recent,
                    color: "#764ba2",
                    icon: <FaHistory />,
                    bg: "rgba(20, 184, 166, 0.1)",
                  },
                ].map((stat, index) => (
                  <div key={index} className="col-6 col-md-4 col-lg-2">
                    <div className="bg-white border-0 rounded-4 p-3 stat-card shadow-sm h-100">
                      <div
                        className="rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3"
                        style={{ backgroundColor: stat.bg }}
                      >
                        <div style={{ color: stat.color }}>{stat.icon}</div>
                      </div>
                      <div
                        className="h5 fw-bold mb-1"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </div>
                      <div className="small text-muted">{stat.title}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border rounded-3 p-4 mb-4 shadow-sm admin-filter-box">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <FaSearch style={{ color: "#667eea" }} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search items by title or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ borderColor: "rgba(37, 99, 235, 0.2)" }}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      style={{ borderColor: "rgba(37, 99, 235, 0.2)" }}
                    >
                      <option value="all">All Types</option>
                      <option value="lost">Lost Items</option>
                      <option value="found">Found Items</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{ borderColor: "rgba(37, 99, 235, 0.2)" }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="title">Title A-Z</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 mt-3 admin-tab-scroll">
                  {["all", "lost", "found", "resolved"].map((tab) => (
                    <button
                      key={tab}
                      className={`btn filter-btn ${
                        activeTab === tab ? "" : "btn-outline-"
                      }primary px-3 py-2 rounded-pill`}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        background:
                          activeTab === tab
                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            : "transparent",
                        color: activeTab === tab ? "white" : "#667eea",
                        border:
                          activeTab === tab
                            ? "2px solid transparent"
                            : "2px solid #667eea",
                      }}
                    >
                      {tab === "all"
                        ? "All Items"
                        : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {filteredItems.length === 0 ? (
                <div className="text-center py-5 my-4">
                  <FaBoxOpen
                    size={80}
                    style={{ color: "#667eea", opacity: 0.5 }}
                    className="mb-3"
                  />
                  <h3 className="h4 fw-bold mb-2" style={{ color: "#667eea" }}>
                    No items found
                  </h3>
                  <p className="mb-4" style={{ color: "#764ba2" }}>
                    {searchQuery || activeTab !== "all"
                      ? "Try adjusting your filters or search"
                      : "No items have been reported yet"}
                  </p>
                </div>
              ) : (
                <div className="row g-4 admin-card-grid">
                  {filteredItems.map((item) => {
                    const typeColor = getTypeColor(item.type);

                    return (
                      <div key={item._id} className="col-12 col-xl-6">
                       <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden item-card admin-item-card">
                          <div className="position-relative item-image-container admin-report-image-frame admin-item-image-frame">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                loading="lazy"
                                className="card-img-top w-100 h-100 admin-report-image"
                                alt={item.title}
                              />
                            ) : (
                              <div className="admin-image-placeholder">
                                <FaImage />
                                <span>No image</span>
                              </div>
                            )}
                            <span
                              className="position-absolute top-0 start-0 m-3 px-3 py-1 rounded-pill text-white fw-bold"
                              style={{
                                background: typeColor.gradient,
                                fontSize: "0.75rem",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {item.type?.toUpperCase()}
                            </span>
                          </div>

                          <div className="card-body d-flex flex-column p-3 admin-item-content">
                            <h5
                              className="fw-semibold fs-6 mb-1"
                              style={{ color: "#667eea" }}
                            >
                              {item.title}
                            </h5>
                            <p
                              className="card-text text-muted small mb-3 flex-grow-1"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: "3",
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {item.description}
                            </p>

                            <div className="mb-3">
                              <div className="d-flex align-items-center mb-2">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    background:
                                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                  }}
                                >
                                  {item.user?.name?.charAt(0) || "A"}
                                </div>
                                <div>
                                  <div
                                    style={{
                                      color: "#667eea",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {item.user?.name || "Anonymous"}
                                  </div>
                                  <small className="text-muted">
                                    {item.user?.email || "No email"}
                                  </small>
                                </div>
                              </div>

                              <div className="d-flex justify-content-between small">
                                <div className="d-flex align-items-center">
                                  <FaMapMarkerAlt
                                    className="me-1"
                                    size={12}
                                    style={{ color: "#667eea" }}
                                  />
                                  <span
                                    className="text-truncate"
                                    style={{ maxWidth: "100px" }}
                                  >
                                    {item.location || "Unknown"}
                                  </span>
                                </div>
                                <div className="d-flex align-items-center">
                                  <FaCalendarAlt
                                    className="me-1"
                                    size={12}
                                    style={{ color: "#667eea" }}
                                  />
                                  <span>
                                    {new Date(
                                      item.createdAt || item.date
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                              <span
                                className="badge"
                                style={{
                                  background: "rgba(37, 99, 235, 0.1)",
                                  color: "#667eea",
                                  textTransform: "capitalize",
                                }}
                              >
                                {item.category || "Uncategorized"}
                              </span>

                              <div className="d-flex gap-2 flex-wrap action-buttons">
                                <button
                                  className="btn btn-sm d-flex align-items-center justify-content-center admin-icon-btn"
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    background:
                                      item.type === "resolved"
                                        ? "#6b7280"
                                        : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "10px",
                                  }}
                                  onClick={() => handleResolve(item._id)}
                                  disabled={
                                    actionLoading === item._id ||
                                    item.type === "resolved"
                                  }
                                  title={
                                    item.type === "resolved"
                                      ? "Already Resolved"
                                      : "Mark as Resolved"
                                  }
                                >
                                  {actionLoading === item._id ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                  ) : item.type === "resolved" ? (
                                    <FaCheck />
                                  ) : (
                                    <FaCheckCircle />
                                  )}
                                </button>

                                <button
                                  className="btn btn-sm d-flex align-items-center justify-content-center admin-icon-btn"
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    background:
                                      "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                  }}
                                  onClick={() => openDeleteModal(item)}
                                  disabled={actionLoading === item._id}
                                  title="Delete Item"
                                >
                                  <FaTrash />
                                </button>

                                <button
                                  className="btn btn-sm d-flex align-items-center justify-content-center admin-icon-btn"
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    background:
                                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                  }}
                                  onClick={() => openItemModal(item)}
                                  title="View Details"
                                >
                                  <FaEye />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {usersStatus === "failed" ? (
            <div className="container px-0">
              <div className="text-center py-5">
                <FaExclamationTriangle
                  size={64}
                  style={{ color: "#ef4444" }}
                  className="mb-3"
                />
                <h3 className="h4 fw-bold mb-2" style={{ color: "#667eea" }}>
                  Error Loading Users
                </h3>
                <p className="mb-4" style={{ color: "#764ba2" }}>
                  {usersError || "An error occurred"}
                </p>
                <button
                  className="btn px-4 py-2 rounded-pill fw-bold text-white"
                  onClick={() => loadAdminUsers(true)}
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  <FaSync className="me-2" />
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="row g-4 mb-5 admin-stats-row">
                {[
                  {
                    title: "Total Users",
                    value: userStats.total,
                    color: "#667eea",
                    icon: <FaUsers />,
                    bg: "rgba(37, 99, 235, 0.1)",
                  },
                  {
                    title: "Admins",
                    value: userStats.admins,
                    color: "#f59e0b",
                    icon: <FaUserShield />,
                    bg: "rgba(245, 158, 11, 0.12)",
                  },
                  {
                    title: "Members",
                    value: userStats.members,
                    color: "#667eea",
                    icon: <FaUsers />,
                    bg: "rgba(37, 99, 235, 0.1)",
                  },
                  {
                    title: "Reporters",
                    value: userStats.activeReporters,
                    color: "#10b981",
                    icon: <FaCheckCircle />,
                    bg: "rgba(16, 185, 129, 0.1)",
                  },
                  {
                    title: "New This Week",
                    value: userStats.recent,
                    color: "#764ba2",
                    icon: <FaHistory />,
                    bg: "rgba(20, 184, 166, 0.1)",
                  },
                  {
                    title: "Total Reports",
                    value: userStats.reports,
                    color: "#10b981",
                    icon: <FaDatabase />,
                    bg: "rgba(16, 185, 129, 0.1)",
                  },
                ].map((stat, index) => (
                  <div key={index} className="col-6 col-md-4 col-lg-2">
                    <div className="bg-white border rounded-3 p-3 shadow-sm h-100 stat-card">
                      <div
                        className="rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3"
                        style={{ backgroundColor: stat.bg }}
                      >
                        <div style={{ color: stat.color }}>{stat.icon}</div>
                      </div>
                      <div
                        className="display-6 fw-bold mb-1"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </div>
                      <div className="small text-muted">{stat.title}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border rounded-3 p-4 mb-4 shadow-sm admin-filter-box">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <FaSearch style={{ color: "#667eea" }} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search users by name, email, or phone..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        style={{ borderColor: "rgba(37, 99, 235, 0.2)" }}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      style={{ borderColor: "rgba(37, 99, 235, 0.2)" }}
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admins</option>
                      <option value="user">Users</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={userSortBy}
                      onChange={(e) => setUserSortBy(e.target.value)}
                      style={{ borderColor: "rgba(37, 99, 235, 0.2)" }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name">Name A-Z</option>
                      <option value="items">Most Reports</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-5 my-4">
                  <FaUsers
                    size={80}
                    style={{ color: "#667eea", opacity: 0.5 }}
                    className="mb-3"
                  />
                  <h3 className="h4 fw-bold mb-2" style={{ color: "#667eea" }}>
                    No users found
                  </h3>
                  <p className="mb-4" style={{ color: "#764ba2" }}>
                    Try adjusting your search or role filter.
                  </p>
                </div>
              ) : (
                <div className="row g-4 admin-card-grid">
                  {filteredUsers.map((account) => {
                    const roleStyle = getRoleStyle(account.role);
                    const isCurrentAdmin = user?.id === account.id;

                    return (
                      <div key={account.id} className="col-12 col-md-6 col-lg-4">
                        <div className="card border shadow-sm h-100 user-card">
                          <div className="card-body d-flex flex-column p-3">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div className="d-flex align-items-center">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                  style={{
                                    width: "42px",
                                    height: "42px",
                                    background:
                                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white",
                                    fontWeight: "700",
                                    fontSize: "18px",
                                  }}
                                >
                                  {account.name?.charAt(0) || "U"}
                                </div>
                                <div>
                                  <h5
                                    className="mb-1 fw-bold"
                                    style={{ color: "#667eea" }}
                                  >
                                    {account.name}
                                  </h5>
                                  <small className="text-muted">
                                    Joined{" "}
                                    {new Date(account.createdAt).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      }
                                    )}
                                  </small>
                                </div>
                              </div>
                              <span
                                className="badge px-3 py-2"
                                style={{
                                  background: roleStyle.bg,
                                  color: roleStyle.color,
                                }}
                              >
                                {roleStyle.label}
                              </span>
                            </div>

                            <div className="mb-3 small">
                              <div className="d-flex align-items-center mb-2">
                                <FaEnvelope
                                  className="me-2"
                                  style={{ color: "#667eea" }}
                                />
                                <span className="text-truncate">
                                  {account.email}
                                </span>
                              </div>
                              <div className="d-flex align-items-center mb-2">
                                <FaPhone
                                  className="me-2"
                                  style={{ color: "#667eea" }}
                                />
                                <span>{account.phone || "No phone number"}</span>
                              </div>
                              <div className="d-flex align-items-center">
                                <FaMapPin
                                  className="me-2"
                                  style={{ color: "#667eea" }}
                                />
                                <span>{account.location || "No location added"}</span>
                              </div>
                            </div>

                            <div className="row g-2 mb-3">
                              <div className="col-6">
                                <div
                                  className="rounded-3 p-3 h-100"
                                  style={{ background: "rgba(37, 99, 235, 0.08)" }}
                                >
                                  <div
                                    className="small text-muted mb-1"
                                  >
                                    Reports
                                  </div>
                                  <div
                                    className="fw-bold"
                                    style={{ color: "#667eea" }}
                                  >
                                    {account.totalItems || 0}
                                  </div>
                                </div>
                              </div>
                              <div className="col-6">
                                <div
                                  className="rounded-3 p-3 h-100"
                                  style={{ background: "rgba(16, 185, 129, 0.08)" }}
                                >
                                  <div className="small text-muted mb-1">
                                    Resolved
                                  </div>
                                  <div
                                    className="fw-bold"
                                    style={{ color: "#10b981" }}
                                  >
                                    {account.resolvedItems || 0}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {isCurrentAdmin ? (
                              <div
                                className="small rounded-3 p-3 mb-3"
                                style={{
                                  background: "rgba(245, 158, 11, 0.12)",
                                  color: "#b45309",
                                }}
                              >
                                This is your account. Self-demotion and self-delete
                                are blocked for safety.
                              </div>
                            ) : null}

                            <div className="d-flex gap-2 mt-auto user-action-row">
                              <button
                                className="btn flex-fill user-role-btn"
                                onClick={() => handleRoleChange(account)}
                                disabled={
                                  userActionLoading === account.id || isCurrentAdmin
                                }
                                style={{
                                  background:
                                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                  color: "white",
                                  border: "none",
                                }}
                              >
                                {userActionLoading === account.id ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <>
                                    <FaUserCog className="me-2" />
                                    {account.role === "admin"
                                      ? "Make User"
                                      : "Make Admin"}
                                  </>
                                )}
                              </button>
                              <button
                                className="btn btn-outline-danger admin-icon-btn"
                                onClick={() => openDeleteUserModal(account)}
                                disabled={
                                  userActionLoading === account.id || isCurrentAdmin
                                }
                              >
                                <FaTrash />
                              </button>
                              <button
                                className="btn btn-outline-primary admin-icon-btn"
                                onClick={() => openUserModal(account)}
                              >
                                <FaEye />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {selectedItem && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center admin-report-modal-overlay"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
            overflow: "auto",
            padding: "20px",
          }}
          onClick={closeItemModal}
        >
          <div
            className="bg-white rounded-3 shadow-lg admin-report-modal"
            style={{
              maxWidth: "95vw",
              width: "100%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="text-white rounded-top-3 p-4 admin-report-modal-header"
              style={{ background: getTypeColor(selectedItem.type).gradient }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="modal-title fw-bold mb-1">Report Details</h5>
                  <small className="opacity-90 text-capitalize">
                    {selectedItem.type || "item"} report
                  </small>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-light rounded-circle admin-report-modal-close"
                  onClick={closeItemModal}
                  style={{ width: "32px", height: "32px" }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="p-4 admin-report-modal-body" style={{ overflowY: "auto", flex: "1" }}>
              <div className="text-center mb-4 admin-report-modal-image-wrap">
                <img
                  src={selectedItem.imageUrl || "/placeholder.jpg"}
                  alt={selectedItem.title}
                  className="img-fluid rounded admin-report-modal-image"
                  style={{ maxHeight: "160px" }}
                />
              </div>
              <h6 style={{ color: "#667eea" }} className="fw-bold mb-2 admin-report-modal-title">
                {selectedItem.title}
              </h6>
              <p style={{ color: "#764ba2" }} className="mb-3 admin-report-modal-description">
                {selectedItem.description}
              </p>

              <div className="row g-3 admin-report-detail-grid">
                <div className="col-6 admin-report-detail-tile">
                  <small className="text-muted d-block">Type</small>
                  <span
                    className="badge"
                    style={{
                      background: getTypeColor(selectedItem.type).light,
                      color: getTypeColor(selectedItem.type).bg,
                    }}
                  >
                    {selectedItem.type?.toUpperCase()}
                  </span>
                </div>
                <div className="col-6 admin-report-detail-tile">
                  <small className="text-muted d-block">Category</small>
                  <span style={{ color: "#764ba2" }}>
                    {selectedItem.category || "Uncategorized"}
                  </span>
                </div>
                <div className="col-12 admin-report-detail-tile">
                  <small className="text-muted d-block">Location</small>
                  <span style={{ color: "#764ba2" }}>
                    {selectedItem.location || "Unknown"}
                  </span>
                </div>
                <div className="col-6 admin-report-detail-tile">
                  <small className="text-muted d-block">Reported By</small>
                  <span style={{ color: "#667eea" }}>
                    {selectedItem.user?.name || "Anonymous"}
                  </span>
                </div>
                <div className="col-6 admin-report-detail-tile">
                  <small className="text-muted d-block">Date</small>
                  <span style={{ color: "#764ba2" }}>
                    {new Date(
                      selectedItem.createdAt || selectedItem.date
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-top admin-report-modal-footer">
              <button
                type="button"
                className="btn btn-secondary w-100"
                onClick={closeItemModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
            overflow: "auto",
            padding: "20px",
          }}
          onClick={closeUserModal}
        >
          <div
            className="bg-white rounded-3 shadow-lg"
            style={{
              maxWidth: "95vw",
              width: "100%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="text-white rounded-top-3 p-4"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold mb-0">User Account Details</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-light rounded-circle"
                  onClick={closeUserModal}
                  style={{ width: "32px", height: "32px" }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="p-4" style={{ overflowY: "auto", flex: "1" }}>
              <div className="d-flex align-items-center mb-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "64px",
                    height: "64px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "22px",
                  }}
                >
                  {selectedUser.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h4 className="fw-bold mb-1" style={{ color: "#667eea" }}>
                    {selectedUser.name}
                  </h4>
                  <span
                    className="badge px-3 py-2"
                    style={{
                      background: getRoleStyle(selectedUser.role).bg,
                      color: getRoleStyle(selectedUser.role).color,
                    }}
                  >
                    {getRoleStyle(selectedUser.role).label}
                  </span>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <small className="text-muted d-block">Email</small>
                  <span style={{ color: "#764ba2" }}>{selectedUser.email}</span>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Phone</small>
                  <span style={{ color: "#764ba2" }}>
                    {selectedUser.phone || "No phone number"}
                  </span>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Location</small>
                  <span style={{ color: "#764ba2" }}>
                    {selectedUser.location || "No location added"}
                  </span>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Joined On</small>
                  <span style={{ color: "#764ba2" }}>
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="col-12">
                  <small className="text-muted d-block">Bio</small>
                  <span style={{ color: "#764ba2" }}>
                    {selectedUser.bio || "No bio added"}
                  </span>
                </div>
              </div>

              <div className="row g-3 mt-3">
                <div className="col-6">
                  <div
                    className="rounded-3 p-3 h-100"
                    style={{ background: "rgba(37, 99, 235, 0.08)" }}
                  >
                    <div className="small text-muted mb-1">Total Reports</div>
                    <div className="fw-bold" style={{ color: "#667eea" }}>
                      {selectedUser.totalItems || 0}
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div
                    className="rounded-3 p-3 h-100"
                    style={{ background: "rgba(16, 185, 129, 0.08)" }}
                  >
                    <div className="small text-muted mb-1">Resolved Reports</div>
                    <div className="fw-bold" style={{ color: "#10b981" }}>
                      {selectedUser.resolvedItems || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-top">
              <button
                type="button"
                style={{ color: "#764ba2" }}
                className="btn btn-secondary w-100"
                onClick={closeUserModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center admin-confirm-overlay"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
            overflow: "auto",
            padding: "20px",
          }}
          onClick={closeDeleteModal}
        >
          <div
            className="bg-white rounded-3 shadow-lg admin-confirm-modal"
            style={{
              maxWidth: "500px",
              width: "100%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="text-white rounded-top-3 p-4 admin-confirm-header"
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold mb-0">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-light rounded-circle admin-confirm-close"
                  onClick={closeDeleteModal}
                  style={{ width: "32px", height: "32px" }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="p-4 text-center admin-confirm-body">
              <FaExclamationTriangle
                size={48}
                style={{ color: "#ef4444" }}
                className="mb-3 admin-confirm-icon"
              />
              <p style={{ color: "#764ba2" }}>
                Are you sure you want to delete{" "}
                <strong style={{ color: "#667eea" }}>{deleteConfirm.title}</strong>
                ?
              </p>
              <p className="small text-muted mb-0">
                This action cannot be undone. All data related to this item will
                be permanently removed.
              </p>
            </div>

            <div className="p-4 border-top d-flex gap-3 admin-confirm-footer">
              <button
                type="button"
                className="btn btn-secondary flex-grow-1"
                onClick={closeDeleteModal}
                disabled={actionLoading === deleteConfirm._id}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger flex-grow-1"
                onClick={() => handleDelete(deleteConfirm._id)}
                disabled={actionLoading === deleteConfirm._id}
              >
                {actionLoading === deleteConfirm._id ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash className="me-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteUserConfirm && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center admin-confirm-overlay"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
            overflow: "auto",
            padding: "20px",
          }}
          onClick={closeDeleteUserModal}
        >
          <div
            className="bg-white rounded-3 shadow-lg admin-confirm-modal"
            style={{
              maxWidth: "520px",
              width: "100%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="text-white rounded-top-3 p-4 admin-confirm-header"
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold mb-0">Delete User Account</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-light rounded-circle admin-confirm-close"
                  onClick={closeDeleteUserModal}
                  style={{ width: "32px", height: "32px" }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="p-4 text-center admin-confirm-body">
              <FaExclamationTriangle
                size={48}
                style={{ color: "#ef4444" }}
                className="mb-3 admin-confirm-icon"
              />
              <p style={{ color: "#764ba2" }}>
                Delete{" "}
                <strong style={{ color: "#667eea" }}>
                  {deleteUserConfirm.name}
                </strong>
                &rsquo;s account?
              </p>
              <p className="small text-muted mb-0">
                This also removes the user&rsquo;s reported items so there are no
                orphan records left behind.
              </p>
            </div>

            <div className="p-4 border-top d-flex gap-3 admin-confirm-footer">
              <button
                type="button"
                className="btn btn-secondary flex-grow-1"
                onClick={closeDeleteUserModal}
                disabled={userActionLoading === deleteUserConfirm.id}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger flex-grow-1"
                onClick={() => handleDeleteUser(deleteUserConfirm)}
                disabled={userActionLoading === deleteUserConfirm.id}
              >
                {userActionLoading === deleteUserConfirm.id ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash className="me-2" />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


