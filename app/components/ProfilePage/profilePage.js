"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaEdit,
  FaSave,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBoxOpen,
  FaCheckCircle,
  FaHistory,
  FaSignOutAlt,
  FaCamera,
  FaShieldAlt,
  FaBell,
  FaGlobe,
  FaUser,
  FaArrowLeft,
  FaTrash,
  FaCheck
} from "react-icons/fa";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    joinDate: "",
    avatar: "/default-avatar.png",
    role: ""
  });
  
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ ...userData });
  const [recentActivity, setRecentActivity] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  async function fetchUserProfile() {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");

      let data = null;
      try {
        data = await res.json();
      } catch (e) {}

      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/loginPage");
          return;
        }

        throw new Error(data?.error || "Failed to fetch profile");
      }
      
      setUserData({
        name: data.name || "User",
        email: data.email || "",
        phone: data.phone || "Not provided",
        location: data.location || "Not specified",
        bio: data.bio || "No bio added yet",
        joinDate: data.joinDate || new Date().toISOString(),
        avatar: data.avatar || "/default-avatar.png",
        role: data.role || ""
      });
      
      setEditForm({
        name: data.name || "User",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
        bio: data.bio || "",
        joinDate: data.joinDate || new Date().toISOString(),
        avatar: data.avatar || "/default-avatar.png",
        role: data.role || ""
      });

      
      const activityRes = await fetch("/api/profile/activity");
      if (activityRes.ok) {
        const activityData = await activityRes.json();
       
        setRecentActivity(activityData);
      } else {
       
        setRecentActivity([
          {
            id: 1,
            title: "Welcome to Lost & Found",
            description: "You joined the platform",
            type: "joined",
            date: new Date().toISOString(),
            location: "Online"
          }
        ]);
      }

    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    try {
      setLoading(true);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await res.json();
      setUserData(data);
      setEditMode(false);
      
      toast.success("Profile updated successfully!", {
        style: { 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
          color: "white" 
        },
        duration: 3000
      });

    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result;

      try {
        const uploadToastId = toast.loading("Uploading profile picture...");

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Upload failed");
        }

        setEditForm(prev => ({ ...prev, avatar: data.url }));
        
        toast.dismiss(uploadToastId);
        toast.success("Profile picture updated!", {
          style: { 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
            color: "white" 
          },
          duration: 3000
        });

      } catch (err) {
        console.error(err);
        toast.error("Failed to upload image");
      } finally {
        setUploadingImage(false);
      }
    };

    reader.readAsDataURL(file);
  }

  async function handleLogout() {
    setShowLogoutConfirm(false);
    
    try {
      const logoutToastId = toast.loading("Logging out...");
      
     
      
      
     
      const res = await fetch("/api/logout", { method: "POST" });
      
    
      toast.dismiss(logoutToastId);

      if (!res.ok) {
        toast.error("Logout failed on server");
        return;
      }

      try {
        localStorage.setItem("logout", Date.now().toString());
      } catch (e) {}

      toast.success("Logged out successfully!", {
        style: { 
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
          color: "white" 
        },
        duration: 1500
      });
      
      router.replace("/loginPage");
      router.refresh();
      
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout failed");
    }
  }

  function formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return "Recently";
    }
  }

  if (loading && !userData.name) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div
            className="spinner-border"
            style={{ width: "3rem", height: "3rem", color: "#667eea" }}
            role="status"
          >
            <span className="visually-hidden">Loading profile...</span>
          </div>
          <p className="mt-3" style={{ color: "#764ba2" }}>
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .profile-gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
        }

        .avatar-container {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid white;
          overflow: hidden;
          position: relative;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        @media (min-width: 768px) {
          .avatar-container {
            width: 150px;
            height: 150px;
          }
        }

        .avatar-overlay {
          position: absolute;
          inset: 0;
          background: rgba(37, 99, 235, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          cursor: pointer;
        }

        .avatar-container:hover .avatar-overlay {
          opacity: 1;
        }

        .activity-card {
          background: white;
          border-radius: 12px;
          border: 1px solid rgba(37, 99, 235, 0.1);
          transition: all 0.3s ease;
        }

        .activity-card:hover {
          transform: translateX(5px);
          border-color: rgba(37, 99, 235, 0.3);
          box-shadow: 0 5px 20px rgba(37, 99, 235, 0.1);
        }

        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(37, 99, 235, 0.1);
          border-radius: 16px;
        }

        .profile-input {
          border: 1px solid rgba(37, 99, 235, 0.2);
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 14px;
          transition: all 0.2s ease;
          width: 100%;
        }

        .profile-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .btn-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-gradient:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
        }

        .btn-outline-gradient {
          background: transparent;
          color: #667eea;
          border: 2px solid transparent;
          border-radius: 50px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background-image: 
            linear-gradient(white, white),
            linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          background-origin: border-box;
          background-clip: padding-box, border-box;
        }

        .btn-outline-gradient:hover {
          background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-outline-red {
          background: transparent;
          color: #ef4444;
          border: 2px solid transparent;
          border-radius: 50px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background-image: 
            linear-gradient(white, white),
            linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          background-origin: border-box;
          background-clip: padding-box, border-box;
        }

        .btn-outline-red:hover {
          background-image: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          color: white;
        }
        
        /* Mobile Responsive Styles - COMPACT */
        @media (max-width: 768px) {
          .profile-gradient-bg {
            padding: 1rem !important;
            border-radius: 12px !important;
          }
          
          .avatar-container {
            width: 80px !important;
            height: 80px !important;
            border-width: 3px !important;
          }
          
          .display-6 {
            font-size: 1.1rem !important;
          }
          
          .lead {
            font-size: 0.8rem !important;
          }
          
          .glass-effect {
            padding: 0.75rem !important;
            border-radius: 10px !important;
          }
          
          .glass-effect h4 {
            font-size: 0.95rem !important;
            margin-bottom: 0.75rem !important;
          }
          
          .glass-effect .mb-4 {
            margin-bottom: 0.75rem !important;
          }
          
          .glass-effect .mb-3 {
            margin-bottom: 0.5rem !important;
          }
          
          .glass-effect small {
            font-size: 0.68rem !important;
          }
          
          .glass-effect span {
            font-size: 0.8rem !important;
          }
          
          .profile-input {
            padding: 8px 12px !important;
            font-size: 14px !important;
            border-radius: 6px !important;
          }
          
          .btn-gradient,
          .btn-outline-gradient,
          .btn-outline-red {
            padding: 8px 16px !important;
            font-size: 0.8rem !important;
            border-radius: 8px !important;
          }
          
          .activity-card {
            padding: 0.75rem !important;
            border-radius: 8px !important;
          }
          
          .activity-card h6 {
            font-size: 0.85rem !important;
          }
          
          .activity-card p,
          .activity-card small {
            font-size: 0.72rem !important;
          }
        }
        
        @media (max-width: 576px) {
          .container {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
          
          .py-3 {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }
          
          .mb-4 {
            margin-bottom: 0.75rem !important;
          }
          
          .profile-gradient-bg {
            padding: 0.75rem !important;
          }
          
          .avatar-container {
            width: 60px !important;
            height: 60px !important;
          }
          
          .display-6 {
            font-size: 1rem !important;
          }
          
          .lead {
            font-size: 0.72rem !important;
          }
          
          .glass-effect {
            padding: 0.6rem !important;
          }
          
          .glass-effect h4 {
            font-size: 0.88rem !important;
          }
          
          .btn-gradient,
          .btn-outline-gradient,
          .btn-outline-red {
            padding: 6px 12px !important;
            font-size: 0.72rem !important;
          }
          
          .g-3 {
            --bs-gutter-x: 0.5rem;
            --bs-gutter-y: 0.5rem;
          }
        }
        
        /* Touch-friendly */
        @media (hover: none) {
          .activity-card:hover {
            transform: none;
          }
          
          .activity-card:active {
            transform: scale(0.98);
          }
        }
      `}</style>

      <div className="container py-3 py-md-5">
        
        <div className="d-block d-md-none mb-3">
          <button
            className="btn btn-outline-secondary d-flex align-items-center"
            onClick={() => router.back()}
          >
            <FaArrowLeft className="me-2" />
            Back
          </button>
        </div>

      
        <div className="profile-gradient-bg text-white rounded-4 p-4 p-md-5 mb-4 mb-md-5 shadow-lg">
          <div className="row align-items-center">
            <div className="col-12 col-md-8 mb-3 mb-md-0">
              <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start text-center text-md-start">
                <div className="avatar-container me-0 me-md-4 mb-3 mb-md-0">

                  {(editMode ? editForm.avatar : userData.avatar) &&
                   (editMode ? editForm.avatar : userData.avatar) !== "/default-avatar.png" ? (

    <img
      src={editMode ? editForm.avatar : userData.avatar}
      className="w-100 h-100 object-cover"
      alt="Profile"
    />

  ) : (

    <div
      className="w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)",
        color: "#667eea",
        fontSize: "3rem",
        fontWeight: "bold"
      }}
    >
      {(editMode ? editForm.name : userData.name)
        ?.charAt(0)
        ?.toUpperCase()}
    </div>

  )}
                  {editMode && (
                    <div 
                      className="avatar-overlay"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      <FaCamera size={24} color="white" />
                    </div>
                  )}
                  {editMode && (
                    <input
                      id="avatar-upload"
                      type="file"
                      className="d-none"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  )}
                </div>
                <div className="flex-grow-1 ps-3">
                  <h1 className="display-6 display-md-5 fw-bold mb-1 d-flex align-items-center gap-2">
                    {editMode ? (
                      <input
                        type="text"
                        className="profile-input"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        style={{ 
                          fontSize: "1.5rem", 
                          background: "transparent", 
                          color: "white", 
                          border: "2px solid rgba(255, 255, 255, 0.3)",
                          textAlign: "center"
                        }}
                      />
                    ) : (
                      <>
                        {userData.name}

                         <FaCheckCircle
                          style={{
                           color: "#4ade80",
                           fontSize: "1.2rem"
                           }}
                          />
                       </>                    )}
                  </h1>
                  <p className="lead opacity-90 mb-0 d-flex align-items-center justify-content-center justify-content-md-start">
                    <FaEnvelope className="me-2" size={14} />
                    {editMode ? (
                      <input
                        type="email"
                        className="profile-input"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        style={{ 
                          background: "transparent", 
                          color: "white", 
                          border: "2px solid rgba(255, 255, 255, 0.3)",
                          fontSize: "0.9rem",
                          textAlign: "center"
                        }}
                      />
                    ) : (
                      <span className="small">{userData.email}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              {editMode ? (
                <div className="d-flex flex-column flex-md-row gap-2 justify-content-center justify-content-md-end">
                  <button
                    className="btn btn-light btn-sm btn-md-lg px-3 px-md-4 py-2 rounded-pill fw-bold mb-2 mb-md-0"
                    onClick={() => {
                      setEditMode(false);
                      setEditForm({ ...userData });
                    }}
                  >
                    <FaTimes className="me-2" />
                    Cancel
                  </button>
                  <button
                    className="btn-gradient btn-sm btn-md-lg px-3 px-md-4 py-2 rounded-pill"
                    onClick={handleSaveProfile}
                    disabled={loading || uploadingImage}
                  >
                    {uploadingImage ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column flex-md-row gap-2 justify-content-center justify-content-md-end">
                  <button
                    className="btn btn-light btn-sm btn-md-lg px-3 px-md-4 py-2 rounded-pill fw-bold mb-2 mb-md-0"
                    onClick={() => setEditMode(true)}
                  >
                    <FaEdit className="me-2" />
                    Edit Profile
                  </button>
                  <button
                    className="btn-outline-red btn-sm btn-md-lg px-3 px-md-4 py-2 rounded-pill"
                    onClick={() => setShowLogoutConfirm(true)}
                  >
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="row g-3 g-md-4">
         
          <div className="col-lg-4">
            <div className="glass-effect p-3 p-md-4 mb-3 mb-md-4">
              <h4 className="fw-bold mb-3 gradient-text">Profile Information</h4>
              
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <FaPhone className="me-3 flex-shrink-0" style={{ color: "#667eea" }} />
                  <div className="w-100">
                    <small className="text-muted d-block">Phone</small>
                    {editMode ? (
                      <input
                        type="text"
                        className="profile-input mt-1"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <span className="d-block mt-1" style={{ color: "#764ba2", wordBreak: "break-word" }}>
                        {userData.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="d-flex align-items-center mb-3">
                  <FaMapMarkerAlt className="me-3 flex-shrink-0" style={{ color: "#667eea" }} />
                  <div className="w-100">
                    <small className="text-muted d-block">Location</small>
                    {editMode ? (
                      <input
                        type="text"
                        className="profile-input mt-1"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        placeholder="Enter your location"
                      />
                    ) : (
                      <span className="d-block mt-1" style={{ color: "#764ba2", wordBreak: "break-word" }}>
                        {userData.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="d-flex align-items-center mb-3">
                  <FaCalendarAlt className="me-3 flex-shrink-0" style={{ color: "#667eea" }} />
                  <div>
                    <small className="text-muted d-block">Member Since</small>
                    <span className="d-block mt-1" style={{ color: "#764ba2" }}>
                      {formatDate(userData.joinDate)}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <FaShieldAlt className="me-3 flex-shrink-0" style={{ color: "#667eea" }} />
                  <div>
                    <small className="text-muted d-block">Account Status</small>
                    <span className="badge mt-1" style={{ 
                      background: "rgba(37, 99, 235, 0.1)", 
                      color: "#667eea",
                      fontSize: "0.85em"
                    }}>
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-effect p-3 p-md-4">
              <h4 className="fw-bold mb-3 gradient-text">Quick Actions</h4>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-primary d-flex align-items-center justify-content-center py-2"
                  onClick={() => router.push("/myItems")}
                >
                  <FaBoxOpen className="me-2 flex-shrink-0" />
                  <span>View My Items</span>
                </button>
                <button
                  className="btn btn-outline-primary d-flex align-items-center justify-content-center py-2"
                  onClick={() => router.push("/lost")}
                >
                  <FaEdit className="me-2 flex-shrink-0" />
                  <span>Report Lost Item</span>
                </button>
                <button
                  className="btn btn-outline-primary d-flex align-items-center justify-content-center py-2"
                  onClick={() => router.push("/found")}
                >
                  <FaEdit className="me-2 flex-shrink-0" />
                  <span>Report Found Item</span>
                </button>
                <button
                  className="btn btn-outline-primary d-flex align-items-center justify-content-center py-2"
                  onClick={() => router.push("/browse")}
                >
                  <FaGlobe className="me-2 flex-shrink-0" />
                  <span>Browse Community</span>
                </button>
                {userData.role === "admin" && (
                  <button
                    className="btn btn-outline-primary d-flex align-items-center justify-content-center py-2"
                    onClick={() => router.push("/admin")}
                  >
                    <FaShieldAlt className="me-2 flex-shrink-0" />
                    <span>Admin Dashboard</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="col-lg-8">
            <div className="glass-effect p-3 p-md-4 mb-3 mb-md-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mb-md-4">
                <h4 className="fw-bold mb-2 mb-md-0 gradient-text">Recent Activity</h4>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm"
                    style={{ 
                      background: "rgba(37, 99, 235, 0.1)", 
                      color: "#667eea",
                      fontSize: "0.85em"
                    }}
                    onClick={fetchUserProfile}
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {recentActivity.length > 0 ? (
                <div className="space-y-2 space-y-md-3">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id || index} className="activity-card p-2 p-md-3">
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: "36px",
                              height: "36px",
                              background: activity.type === "lost" 
                                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                : activity.type === "found"
                                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                : activity.type === "joined"
                                ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                                : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
                            }}
                          >
                            {activity.type === "joined" ? (
                              <FaUser size={16} color="white" />
                            ) : (
                              <FaBoxOpen size={16} color="white" />
                            )}
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-2 ms-md-3">
                          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-1">
                            <h6 className="fw-bold mb-0" style={{ color: "#667eea", fontSize: "0.95rem" }}>
                              {activity.title}
                            </h6>
                            <span className="badge mt-1 mt-md-0" style={{
                              background: activity.type === "lost" 
                                ? "rgba(37, 99, 235, 0.1)"
                                : activity.type === "found"
                                ? "rgba(16, 185, 129, 0.1)"
                                : activity.type === "joined"
                                ? "rgba(245, 158, 11, 0.1)"
                                : "rgba(107, 114, 128, 0.1)",
                              color: activity.type === "lost" 
                                ? "#667eea"
                                : activity.type === "found"
                                ? "#10b981"
                                : activity.type === "joined"
                                ? "#f59e0b"
                                : "#6b7280",
                              fontSize: "0.75em"
                            }}>
                              {activity.type?.toUpperCase() || "ACTIVITY"}
                            </span>
                          </div>
                          <p className="small mb-1 mb-md-2" style={{ color: "#764ba2", fontSize: "0.85rem" }}>
                            {activity.description}
                          </p>
                          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                            <small className="text-muted mb-1 mb-md-0">
                              <FaCalendarAlt className="me-1" size={10} />
                              {formatDate(activity.date)}
                            </small>
                            {activity.location && (
                              <small className="text-muted">
                                <FaMapMarkerAlt className="me-1" size={10} />
                                {activity.location}
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 py-md-5">
                  <FaHistory size={40} style={{ color: "#667eea", opacity: 0.5 }} className="mb-3" />
                  <h6 className="fw-bold mb-2" style={{ color: "#667eea", fontSize: "1rem" }}>No recent activity</h6>
                  <p className="small mb-0" style={{ color: "#764ba2" }}>
                    Your activity will appear here when you report items
                  </p>
                  <button
                    className="btn btn-outline-primary mt-3"
                    onClick={() => router.push("/lost")}
                  >
                    Report Your First Item
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center logout-confirm-overlay"
          style={{ 
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
            padding: "20px"
          }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div 
            className="bg-white rounded-3 shadow-lg logout-confirm-modal"
            style={{ 
              maxWidth: "400px",
              width: "100%"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="text-white rounded-top-3 p-4 logout-confirm-header"
              style={{ background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)" }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold mb-0">Confirm Logout</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-light rounded-circle logout-confirm-close"
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{ width: "32px", height: "32px" }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <div className="p-4 text-center logout-confirm-body">
              <FaSignOutAlt size={48} style={{ color: "#ef4444", opacity: 0.7 }} className="mb-3 logout-confirm-icon" />
              <p className="mb-0" style={{ color: "#764ba2" }}>
                Are you sure you want to logout?
              </p>
            </div>
            
            <div className="p-4 border-top d-flex gap-3 logout-confirm-footer">
              <button
                type="button"
                className="btn btn-secondary flex-grow-1"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger flex-grow-1"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="me-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


