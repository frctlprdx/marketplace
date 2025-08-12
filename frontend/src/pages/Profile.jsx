import { useEffect, useState } from "react";
import axios from "axios";
import { supabase } from "../supabase";

const Profile = () => {
  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
    phone_number: "",
    profileimage: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [oldImageUrl, setOldImageUrl] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const userToken = localStorage.getItem("user_token");

    if (!userId || !userToken) {
      window.location.href = "/";
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/profile?user_id=${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${userToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Gagal mengambil data profil");

        const data = await response.json();
        setUser({ ...data, id: userId });
        setOldImageUrl(data.profileimage || "");
      } catch (err) {
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const userToken = localStorage.getItem("user_token");
    try {
      let imageUrl = user.profileimage;

      if (newProfileImage) {
        const fileExt = newProfileImage.name.split(".").pop();
        const fileName = `profile/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("nogosarenmarketplace")
          .upload(fileName, newProfileImage);

        if (uploadError) throw uploadError;

        imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/nogosarenmarketplace/${fileName}`;

        if (oldImageUrl && oldImageUrl.includes("/nogosarenmarketplace/")) {
          const oldPath = oldImageUrl.split("/nogosarenmarketplace/")[1];
          if (oldPath) {
            try {
              await supabase.storage.from("nogosarenmarketplace").remove([oldPath]);
            } catch (deleteError) {
              console.warn("Failed to delete old image:", deleteError);
            }
          }
        }
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/profile/${user.id}`,
        {
          name: user.name,
          phone_number: user.phone_number,
          profileimage: imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setUser((prev) => ({ ...prev, profileimage: imageUrl }));
      setOldImageUrl(imageUrl);
      setNewProfileImage(null);

      setMessage("Profil berhasil diperbarui.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Update error:", error);
      setMessage(
        error.response?.data?.message || "Gagal menyimpan perubahan."
      );
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#507969] mx-auto mb-4"></div>
          <p style={{ color: "#507969" }} className="text-lg font-medium">
            Memuat profil...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Terjadi Kesalahan
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#507969] text-white rounded-lg hover:bg-[#2d5847] transition-colors duration-200"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1
                style={{ color: "#507969" }}
                className="text-2xl md:text-3xl font-bold"
              >
                Profil Pengguna
              </h1>
              <p style={{ color: "#507969" }} className="opacity-70 mt-1">
                Kelola informasi personal Anda
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-12 h-12 bg-[#507969] rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-8">
              <div className="relative group">
                {user.profileimage ? (
                  <img
                    src={user.profileimage}
                    alt="Profile"
                    className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-[#507969] to-[#2d5847] rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-12 h-12 md:w-16 md:h-16 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="text-center md:text-left flex-1">
                <h2
                  style={{ color: "#507969" }}
                  className="text-xl md:text-2xl font-bold"
                >
                  {user.name || "Nama Pengguna"}
                </h2>
                <p
                  style={{ color: "#507969" }}
                  className="opacity-70 text-sm md:text-base mt-1"
                >
                  {user.email}
                </p>
                <div className="mt-3">
                  <span className="text-white inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#507969] bg-opacity-10 text-[#507969]">
                    {user.role || "User"}
                  </span>
                </div>

                {/* Upload Profile Image Button */}
                <div className="mt-4">
                  <label
                    style={{ color: "#507969" }}
                    className="block text-sm font-semibold mb-2"
                  >
                    Ganti Foto Profil
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setNewProfileImage(e.target.files ? e.target.files[0] : null)
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-center w-full h-12 px-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#507969] hover:bg-green-50 transition-all duration-200 cursor-pointer">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <svg
                          className="w-5 h-5 text-[#507969]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <span className="text-sm font-medium">
                          {newProfileImage ? newProfileImage.name : "Pilih foto baru"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {newProfileImage && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>File terpilih: {newProfileImage.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label
                    style={{ color: "#507969" }}
                    className="block text-sm font-semibold mb-2"
                  >
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl bg-white focus:border-[#507969] focus:outline-none transition-colors duration-200"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label
                    style={{ color: "#507969" }}
                    className="block text-sm font-semibold mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full border-2 border-gray-100 px-4 py-3 rounded-xl bg-gray-50 cursor-not-allowed opacity-60"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email tidak dapat diubah
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    style={{ color: "#507969" }}
                    className="block text-sm font-semibold mb-2"
                  >
                    Nomor Telepon
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    value={user.phone_number}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl bg-white focus:border-[#507969] focus:outline-none transition-colors duration-200"
                    placeholder="Masukkan nomor telepon"
                  />
                </div>

                <div>
                  <label
                    style={{ color: "#507969" }}
                    className="block text-sm font-semibold mb-2"
                  >
                    Role
                  </label>
                  <input
                    type="text"
                    value={user.role}
                    disabled
                    className="w-full border-2 border-gray-100 px-4 py-3 rounded-xl bg-gray-50 cursor-not-allowed opacity-60"
                  />
                </div>

                {message && (
                  <div
                    className={`p-4 rounded-xl border-2 ${
                      message.includes("berhasil")
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-red-50 border-red-200 text-red-800"
                    }`}
                  >
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {message.includes("berhasil") ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        )}
                      </svg>
                      <span className="font-medium">{message}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-[#507969] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2d5847] transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Simpan Perubahan
                </div>
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 md:flex-initial text-red-600 border-2 border-red-200 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 hover:border-red-300 transition-all duration-200 transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3v1"
                    />
                  </svg>
                  Logout
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
