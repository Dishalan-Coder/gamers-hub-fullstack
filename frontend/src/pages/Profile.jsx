import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getApiError, getApiErrors, phoneRegex } from '../services/validators';
import { FaCamera, FaUser, FaEnvelope, FaPhone, FaCalendar, FaShieldAlt } from 'react-icons/fa';

const Profile = () => {
  const { user, refreshMe } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [errors, setErrors] = useState({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(user?.profile_image || null);

  useEffect(() => {
    setForm({ name: user?.name || '', phone: user?.phone || '' });
    setPreviewImage(user?.profile_image || null);
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
      toast.error('Only image files are allowed (jpeg, jpg, png, gif, webp)');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    setUploading(true);
    try {
      const response = await API.post('/users/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshMe();
      setPreviewImage(response.data.user.profile_image);
      toast.success('Profile image uploaded successfully');
    } catch (error) {
      toast.error(getApiError(error) || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    const validation = {};
    if (!form.name.trim()) validation.name = 'Name is required';
    if (!phoneRegex.test(form.phone.trim())) validation.phone = 'Use phone format 0771234567';
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    try {
      await API.put('/users/profile', form);
      await refreshMe();
      toast.success('Profile updated');
    } catch (error) {
      setErrors(getApiErrors(error));
      toast.error(getApiError(error));
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Passwords do not match');
    try {
      await API.put('/auth/change-password', passwordForm);
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  return (
    <section className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-image-section">
            <div className="profile-image-wrapper">
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="profile-image" />
              ) : (
                <div className="profile-image-placeholder">
                  <FaUser />
                </div>
              )}
              <label className="profile-image-upload">
                <FaCamera />
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            {uploading && <p className="uploading-text">Uploading...</p>}
          </div>

          <div className="profile-info">
            <h1>{user?.name}</h1>
            <p className="profile-email"><FaEnvelope /> {user?.email}</p>
            <p className="profile-role"><span className={`role-badge ${user?.role}`}>{user?.role?.toUpperCase()}</span></p>
            <p className="profile-joined"><FaCalendar /> Joined: {new Date(user?.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h2><FaUser /> Edit Profile</h2>
            <form onSubmit={updateProfile} className="profile-form">
              <div className="form-group">
                <label><FaUser /> Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your name"
                />
                {errors.name && <small className="error">{errors.name}</small>}
              </div>
              <div className="form-group">
                <label><FaPhone /> Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0771234567"
                />
                {errors.phone && <small className="error">{errors.phone}</small>}
              </div>
              <button type="submit" className="btn full">Update Profile</button>
            </form>
          </div>

          <div className="profile-section">
            <h2><FaShieldAlt /> Change Password</h2>
            <button className="btn ghost full" onClick={() => setShowPasswordForm(!showPasswordForm)}>
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </button>
            {showPasswordForm && (
              <form onSubmit={changePassword} className="profile-form password-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Enter new password (min 8 characters)"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>
                <button type="submit" className="btn full">Save New Password</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
