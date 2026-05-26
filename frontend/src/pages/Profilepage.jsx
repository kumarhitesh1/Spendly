import { useState, useRef } from "react";
import {
  Camera,
  Save,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import API from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, login } = useAuth();

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    profilePicUrl: user?.profilePicUrl || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  // Show success message
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setErrorMsg("");

    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Show error message
  const showError = (msg) => {
    setErrorMsg(msg);
    setSuccessMsg("");

    setTimeout(() => setErrorMsg(""), 3000);
  };

  // Upload profile picture
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("image", file);

      const res = await API.post("/user/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setForm((f) => ({
        ...f,
        profilePicUrl: res.data.imageUrl,
      }));
      
    } catch {
      showError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Save profile details
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return showError("Name cannot be empty");
    }

    setSaving(true);

    try {
      await API.put("/user/profile", {
        name: form.name,
        profilePicUrl: form.profilePicUrl,
      });

      showSuccess("Profile updated successfully!");
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Failed to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPassError("");
    setPassSuccess("");

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      return setPassError("New passwords don't match");
    }

    if (passwordForm.newPassword.length < 8) {
      return setPassError(
        "Password must be at least 8 characters",
      );
    }

    setSavingPass(true);

    try {
      await API.put("/user/change-password", {
        currentPassword:
          passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPassSuccess("Password changed successfully!");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => setPassSuccess(""), 3000);
    } catch (err) {
      setPassError(
        err.response?.data?.message ||
          "Failed to change password",
      );
    } finally {
      setSavingPass(false);
    }
  };

  // User initials
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#E2E8F0]">
          Profile
        </h1>

        <p className="text-[#64748B] text-sm mt-0.5">
          Manage your account details
        </p>
      </div>

      {/* Status messages */}
      {successMsg && (
        <div className="bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 text-sm px-4 py-3 rounded-xl">
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Profile section */}
      <div className="card p-6">
        <h2 className="font-display text-base font-semibold text-[#E2E8F0] mb-5">
          Personal Information
        </h2>

        {/* Profile form */}
        <form
          onSubmit={handleSaveProfile}
          className="space-y-5"
        >
          {/* Profile picture */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#16181D] border border-[#2A2D35] flex items-center justify-center">
                {form.profilePicUrl ? (
                  <img
                    src={form.profilePicUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-semibold text-[#4F8EF7]">
                    {initials}
                  </span>
                )}
              </div>

              {/* Upload button */}
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={uploading}
                className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#4F8EF7] rounded-lg flex items-center justify-center hover:bg-[#3a7be0] transition-all"
              >
                {uploading ? (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera
                    size={13}
                    className="text-white"
                  />
                )}
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div>
              <p className="text-sm text-[#E2E8F0] font-medium">
                {user?.name}
              </p>

              <p className="text-xs text-[#64748B] mt-0.5">
                {user?.email}
              </p>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="text-xs text-[#4F8EF7] hover:text-white mt-1.5 transition-colors"
              >
                Change photo
              </button>
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="text-xs text-[#64748B] uppercase tracking-wider mb-1.5 block">
              Full Name
            </label>

            <div className="relative">
              <User
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
              />

              <input
                className="input-field pl-9"
                placeholder="Your full name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          {/* Email field */}
          <div>
            <label className="text-xs text-[#64748B] uppercase tracking-wider mb-1.5 block">
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
              />

              <input
                className="input-field pl-9 opacity-60 cursor-not-allowed"
                value={user?.email || ""}
                readOnly
              />
            </div>

            <p className="text-xs text-[#64748B] mt-1">
              Email cannot be changed
            </p>
          </div>

          {/* Save button */}
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={15} />
            )}

            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Password section */}
      <div className="card p-6">
        <h2 className="font-display text-base font-semibold text-[#E2E8F0] mb-5">
          Change Password
        </h2>

        {/* Password status messages */}
        {passSuccess && (
          <div className="bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 text-sm px-4 py-3 rounded-xl mb-4">
            ✓ {passSuccess}
          </div>
        )}

        {passError && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">
            {passError}
          </div>
        )}

        {/* Password form */}
        <form
          onSubmit={handleChangePassword}
          className="space-y-4"
        >
          {[
            {
              key: "currentPassword",
              label: "Current Password",
              passKey: "current",
            },
            {
              key: "newPassword",
              label: "New Password",
              passKey: "new",
            },
            {
              key: "confirmPassword",
              label: "Confirm Password",
              passKey: "confirm",
            },
          ].map(({ key, label, passKey }) => (
            <div key={key}>
              <label className="text-xs text-[#64748B] uppercase tracking-wider mb-1.5 block">
                {label}
              </label>

              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                />

                <input
                  className="input-field pl-9 pr-10"
                  type={
                    showPass[passKey]
                      ? "text"
                      : "password"
                  }
                  placeholder="••••••••"
                  value={passwordForm[key]}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      [key]: e.target.value,
                    })
                  }
                  required
                />

                {/* Toggle password visibility */}
                <button
                  type="button"
                  onClick={() =>
                    setShowPass({
                      ...showPass,
                      [passKey]:
                        !showPass[passKey],
                    })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#E2E8F0]"
                >
                  {showPass[passKey] ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </button>
              </div>
            </div>
          ))}

          {/* Change password button */}
          <button
            type="submit"
            disabled={savingPass}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {savingPass ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Lock size={15} />
            )}

            {savingPass
              ? "Changing..."
              : "Change Password"}
          </button>
        </form>
      </div>

      {/* Account information */}
      <div className="card p-6">
        <h2 className="font-display text-base font-semibold text-[#E2E8F0] mb-4">
          Account Info
        </h2>

        <div className="space-y-3">
          {[
            {
              label: "User ID",
              value: user?._id,
            },
            {
              label: "Member since",
              value: user?.createdAt
                ? new Date(
                    user.createdAt,
                  ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—",
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between py-2 border-b border-[#2A2D35] last:border-0"
            >
              <span className="text-xs text-[#64748B] uppercase tracking-wider">
                {label}
              </span>

              <span className="text-xs lg:text-sm text-[#E2E8F0] font-mono truncate max-w-[180px] lg:max-w-none text-right">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}