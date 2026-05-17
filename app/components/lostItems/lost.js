"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { addItem } from "../../store/slices/itemsSlice";
import { FaCamera, FaUpload, FaTrash, FaMapMarkerAlt, FaTag, FaInfoCircle, FaUser, FaExclamationTriangle, FaCheckCircle, FaSearch } from "react-icons/fa";

export default function LostItemForm() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    imageUrl: "",
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [user, setUser] = useState("");

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        window.location.href = "/loginPage"; 
      }
    }
    fetchUser();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.category) newErrors.category = "Category is required";
    if (!form.location.trim()) newErrors.location = "Location is required";
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: "error", text: "Please upload an image file" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image size should be less than 5MB" });
        return;
      }
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setMessage({ type: "", text: "" });
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64 = reader.result;
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64 }),
          });
          const data = await res.json();
          resolve(data.url);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      await dispatch(addItem({ ...form, type: "lost", imageUrl })).unwrap();

      setMessage({ 
        type: "success", 
        text: "Lost item reported successfully! Our community will help look for it." 
      });
      
      setForm({ 
        title: "", 
        description: "", 
        category: "", 
        location: "", 
        imageUrl: "" 
      });
      setImageFile(null);
      setImagePreview(null);
      setErrors({});
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: "Failed to submit report. Please try again." 
      });
    }

    setLoading(false);
  };

  const handleClearForm = () => {
    setForm({ 
      title: "", 
      description: "", 
      category: "", 
      location: "", 
      imageUrl: "" 
    });
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
    setMessage({ type: "", text: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
        
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        .input-focus-effect:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.15);
        }
        
        .submit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          transition: all 0.3s ease;
          color: white;
          font-weight: 600;
        }
        
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .image-upload-area {
          border: 2px dashed rgba(102, 126, 234, 0.3);
          border-radius: 12px;
          transition: all 0.3s ease;
          background: rgba(102, 126, 234, 0.03);
          cursor: pointer;
        }
        
        .image-upload-area:hover {
          background: rgba(102, 126, 234, 0.08);
          border-color: #667eea;
        }
        
        .card-hover-3d {
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .card-hover-3d:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.1) !important;
        }
        
        .form-gradient {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 255, 0.95) 100%);
          border-radius: 16px;
        }
        
        .stat-card {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-radius: 12px;
          border: 1px solid rgba(102, 126, 234, 0.1);
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          border-color: rgba(102, 126, 234, 0.3);
        }
        
        .lost-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .icon-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .btn-outline-gradient {
          border:2px solid;
          border-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-image-slice: 1;
          color: #667eea;
         
          
          
        }
        
        .btn-outline-gradient:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .form-label {
          color: #4a5568;
          font-size: 0.84rem;
          font-weight: 600;
          line-height: 1.2;
          margin-bottom: 0.4rem;
        }

        .form-label svg {
          width: 13px !important;
          height: 13px !important;
          flex-shrink: 0;
        }
        
        .form-control, .form-select {
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          min-height: 42px;
          padding: 0.65rem 0.85rem;
          font-size: 0.88rem;
          line-height: 1.35;
        }

        .form-control::placeholder {
          color: #64748b;
          font-size: 0.86rem;
        }

        .form-select,
        .form-select option {
          font-size: 0.86rem;
        }

        .image-preview {
          overflow: hidden;
          border-radius: 12px;
          background: #f8fafc;
          border: 2px solid rgba(102, 126, 234, 0.2);
        }

        .image-preview img {
          display: block;
          width: 100%;
          height: 180px;
          object-fit: contain;
        }

        .image-remove-btn {
          width: 32px !important;
          height: 32px !important;
          min-width: 32px;
          padding: 0 !important;
          border-radius: 50% !important;
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          aspect-ratio: 1 / 1;
          line-height: 1;
        }

        .image-remove-btn svg {
          width: 12px;
          height: 12px;
        }

        .image-upload-title {
          color: #4a5568;
          font-size: 0.82rem;
        }

        .image-upload-hint {
          font-size: 0.7rem;
        }
        
        .form-control:focus, .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.15);
        }
        
        .alert-success {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #065f46;
        }
        
        .alert-danger {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #7f1d1d;
        }
        
        .lost-icon-bg {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        }
        
        /* Mobile Responsive Styles - COMPACT */
        @media (max-width: 768px) {
          .card-header {
            padding: 0.75rem !important;
          }
          
          .card-header h1 {
            font-size: 1rem !important;
          }
          
          .card-header p {
            font-size: 0.72rem !important;
          }
          
          .card-body {
            padding: 0.75rem !important;
          }
          
          .form-label {
            font-size: 0.8rem !important;
          }
          
          .stat-card .card-body {
            padding: 0.75rem !important;
          }
        }
        
        @media (max-width: 576px) {
          .container {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
          
          .py-4 {
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
          }
          
          .card-header {
            padding: 0.6rem !important;
          }
          
          .card-header .rounded-circle {
            padding: 6px !important;
          }
          
          .card-header h1 {
            font-size: 0.9rem !important;
          }
          
          .card-header p {
            font-size: 0.68rem !important;
          }
          
          .card-body {
            padding: 0.6rem !important;
          }
          
          .form-label {
            font-size: 0.78rem !important;
            margin-bottom: 4px !important;
          }

          .form-label svg {
            width: 12px !important;
            height: 12px !important;
          }
          
          .form-control,
          .form-select {
            min-height: 38px !important;
            padding: 7px 10px !important;
            font-size: 0.75rem !important;
            border-radius: 6px !important;
          }

          .form-select,
          .form-select option {
            font-size: 0.75rem !important;
          }

          .form-control::placeholder {
            font-size: 0.65rem;
          }
          
          textarea.form-control {
            min-height: 80px;
            line-height: 1.35;
          }

          input.form-control {
            line-height: 1.25;
          }

          .image-preview img {
            height: 150px;
          }
          
          .image-upload-area {
            padding: 1rem !important;
          }
          
          .image-upload-title {
            font-size: 0.78rem;
          }

          .image-upload-hint {
            font-size: 0.68rem;
          }
          
          .image-upload-area svg {
            width: 20px;
            height: 20px;
          }

          .image-remove-btn {
            width: 30px !important;
            height: 30px !important;
            min-width: 30px;
          }
          
          .mb-4 {
            margin-bottom: 0.75rem !important;
          }
          
          .row.g-3 {
            --bs-gutter-x: 0.5rem;
            --bs-gutter-y: 0.5rem;
          }
          
          .d-flex.gap-3.justify-content-end {
            flex-direction: column-reverse;
            gap: 0.5rem !important;
            margin-top: 0.75rem !important;
            padding-top: 0.75rem !important;
          }
          
          .d-flex.gap-3.justify-content-end .btn {
            width: 100%;
            justify-content: center;
            padding: 8px 16px !important;
            font-size: 0.8rem !important;
          }
          
          .stat-card {
            display: none;
          }
          
          .alert {
            padding: 8px 10px !important;
            font-size: 0.75rem !important;
            border-radius: 6px !important;
          }

          .compact-status-alert {
            padding: 7px 34px 7px 10px !important;
            margin-bottom: 0.75rem !important;
            min-height: auto;
          }
          
          .alert svg {
            flex-shrink: 0;
            width: 14px;
            height: 14px;
          }
        }
        
        /* Touch-friendly interactions */
        @media (hover: none) {
          .card-hover-3d:hover {
            transform: none;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
          }
          
          .btn:active {
            transform: scale(0.97);
          }
        }
      `}</style>

      <div className="container py-4 fade-in">
        <div className="row justify-content-center">
          <div className="col-lg-8">
          
            {user && (
              <div className="card shadow-sm border-0 mb-4 stat-card">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle p-2 me-3" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <FaUser size={20} className="text-white" />
                    </div>
                    <div>
                      <h6 className="mb-1 fw-bold text-gradient">Reporting as: {user.name || "Student"}</h6>
                      <small className="text-muted">GCUF Campus Member</small>
                    </div>
                  </div>
                </div>
              </div>
            )}

          
            <div className="card shadow-lg border-0 card-hover-3d overflow-hidden mb-4">
             
              <div className="card-header lost-header text-white py-4 px-4">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle p-2 me-3">
                    <FaExclamationTriangle size={24} className="icon-gradient" />
                  </div>
                  <div>
                    <h1 className="h3 fw-bold mb-1">Report Lost Item</h1>
                    <p className="mb-0 opacity-90">Help our community assist you in finding lost belongings</p>
                  </div>
                </div>
              </div>
              
              <div className="card-body p-4 form-gradient">
                {message.text && (
                  <div className={`alert alert-${message.type === "success" ? "success" : "danger"} alert-dismissible fade show d-flex align-items-center compact-status-alert rounded-lg`} role="alert">
                    {message.type === "success" ? (
                      <FaCheckCircle className="me-2" size={14} />
                    ) : (
                      <FaExclamationTriangle className="me-2" size={14} />
                    )}
                    <div className="flex-grow-1 fw-medium small">{message.text}</div>
                    <button 
                      type="button" 
                      className="btn-close btn-close-sm" 
                      onClick={() => setMessage({ type: "", text: "" })}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                
                  <div className="mb-4">
                    <label htmlFor="title" className="form-label d-flex align-items-center mb-2">
                      <FaTag className="me-2" style={{ color: '#667eea' }} />
                      Item Title <span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g., 'Black Leather Wallet', 'iPhone 14 Pro'"
                      className={`form-control ${errors.title ? "is-invalid" : ""} input-focus-effect`}
                      required
                    />
                    {errors.title && (
                      <div className="invalid-feedback d-flex align-items-center">
                        <FaExclamationTriangle className="me-1" size={12} />
                        {errors.title}
                      </div>
                    )}
                  </div>

                
                  <div className="mb-4">
                    <label htmlFor="description" className="form-label d-flex align-items-center mb-2">
                      <FaInfoCircle className="me-2" style={{ color: '#667eea' }} />
                      Description <span className="text-danger ms-1">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe distinctive features, color, brand, contents..."
                      rows="3"
                      className={`form-control ${errors.description ? "is-invalid" : ""} input-focus-effect`}
                      required
                    />
                    {errors.description && (
                      <div className="invalid-feedback d-flex align-items-center">
                        <FaExclamationTriangle className="me-1" size={12} />
                        {errors.description}
                      </div>
                    )}
                  </div>

                  <div className="row g-3 mb-4">
                
                    <div className="col-md-6">
                      <label htmlFor="category" className="form-label d-flex align-items-center mb-2">
                        <FaTag className="me-2" style={{ color: '#667eea' }} />
                        Category <span className="text-danger ms-1">*</span>
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className={`form-select ${errors.category ? "is-invalid" : ""} input-focus-effect`}
                        required
                      >
                        <option value="">Select category</option>
                        <option value="electronics">Electronics</option>
                        <option value="stationary">Stationary</option>
                        <option value="documents">Documents</option>
                        <option value="jewelry">Jewelry</option>
                        <option value="clothing">Clothing</option>
                        <option value="keys">Keys</option>
                        <option value="bags">Bags & Wallets</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.category && (
                        <div className="invalid-feedback d-flex align-items-center">
                          <FaExclamationTriangle className="me-1" size={12} />
                          {errors.category}
                        </div>
                      )}
                    </div>

                   
                    <div className="col-md-6">
                      <label htmlFor="location" className="form-label d-flex align-items-center mb-2">
                        <FaMapMarkerAlt className="me-2" style={{ color: '#667eea' }} />
                        Location <span className="text-danger ms-1">*</span>
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="e.g., 'Main Library - 2nd Floor'"
                        className={`form-control ${errors.location ? "is-invalid" : ""} input-focus-effect`}
                        required
                      />
                      {errors.location && (
                        <div className="invalid-feedback d-flex align-items-center">
                          <FaExclamationTriangle className="me-1" size={12} />
                          {errors.location}
                        </div>
                      )}
                    </div>
                  </div>

                
                  <div className="mb-4">
                    <label className="form-label d-flex align-items-center mb-2">
                      <FaCamera className="me-2" style={{ color: '#667eea' }} />
                      Item Photo (Optional)
                    </label>
                    
                    {imagePreview ? (
                      <div className="image-preview-container mb-2">
                        <div className="image-preview position-relative mx-auto" style={{ maxWidth: '100%' }}>
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="shadow-sm"
                          />
                          <button
                            type="button"
                            className="btn btn-danger image-remove-btn position-absolute top-0 end-0 m-1 shadow-sm"
                            onClick={removeImage}
                            aria-label="Remove image"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="image-upload-area text-center p-3 mb-2 rounded-3"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FaUpload size={20} className="mb-2" style={{ color: '#667eea' }} />
                        <p className="image-upload-title mb-1 fw-semibold">Tap to upload photo</p>
                        <p className="image-upload-hint text-muted mb-0">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="d-none"
                    />
                  </div>

                 
                  <div className="d-flex gap-3 justify-content-end mt-4 pt-4 border-top">
                    <button
                      type="button"
                      className="btn  btn-outline-gradient px-4 py-2 rounded-pill fw-medium"
                      onClick={handleClearForm}
                      disabled={loading}
                      
                     
                    >
                      <FaTrash className="me-2" size={14} />
                      Clear Form
                    </button>
                    <button
                      type="submit"
                      className="btn submit-btn px-5 py-2 rounded-pill fw-bold"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="me-2" />
                          Submit Report
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          
            <div className="card shadow-sm border-0 stat-card">
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-4">
                    <div className="text-center p-2">
                      <div className="h4 fw-bold mb-2">
                        <FaSearch className="icon-gradient" />
                      </div>
                      <div className="small fw-semibold" style={{ color: '#4a5568' }}>Browse Items</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="text-center p-2">
                      <div className="h4 fw-bold mb-2">
                        <FaCheckCircle className="icon-gradient" />
                      </div>
                      <div className="small fw-semibold" style={{ color: '#4a5568' }}>Successful Reports</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="text-center p-2">
                      <div className="h4 fw-bold mb-2">
                        <FaExclamationTriangle className="icon-gradient" />
                      </div>
                      <div className="small fw-semibold" style={{ color: '#4a5568' }}>Active Search</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
