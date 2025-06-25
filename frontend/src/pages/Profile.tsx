import { useEffect, useState } from "react";

const Profile = () => {
  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
    address: "",
    phone_number: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

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
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const userToken = localStorage.getItem("user_token");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/profile/${user.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: user.name,
            address: user.address,
            phone_number: user.phone_number,
          }),
        }
      );

      if (!response.ok) throw new Error("Gagal menyimpan perubahan");

      setMessage("Profil berhasil diperbarui.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setMessage("Gagal menyimpan perubahan.");
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
          <p style={{ color: '#507969' }} className="text-lg font-medium">Memuat profil...</p>
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
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h3>
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
              <h1 style={{ color: '#507969' }} className="text-2xl md:text-3xl font-bold">
                Profil Pengguna
              </h1>
              <p style={{ color: '#507969' }} className="opacity-70 mt-1">
                Kelola informasi personal Anda
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-12 h-12 bg-[#507969] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-[#507969] to-[#2d5847] rounded-2xl flex items-center justify-center">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 style={{ color: '#507969' }} className="text-xl md:text-2xl font-bold">
                  {user.name || 'Nama Pengguna'}
                </h2>
                <p style={{ color: '#507969' }} className="opacity-70 text-sm md:text-base mt-1">
                  {user.email}
                </p>
                <div className="mt-3">
                  <span className="text-white inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#507969] bg-opacity-10 text-[#507969]">
                    {user.role || 'User'}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label style={{ color: '#507969' }} className="block text-sm font-semibold mb-2">
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
                  <label style={{ color: '#507969' }} className="block text-sm font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full border-2 border-gray-100 px-4 py-3 rounded-xl bg-gray-50 cursor-not-allowed opacity-60"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                </div>

                <div>
                  <label style={{ color: '#507969' }} className="block text-sm font-semibold mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user.role}
                    disabled
                    className="w-full border-2 border-gray-100 px-4 py-3 rounded-xl bg-gray-50 cursor-not-allowed opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label style={{ color: '#507969' }} className="block text-sm font-semibold mb-2">
                    Alamat
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={user.address}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl bg-white focus:border-[#507969] focus:outline-none transition-colors duration-200"
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>

                <div>
                  <label style={{ color: '#507969' }} className="block text-sm font-semibold mb-2">
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

                {/* Message Display */}
                {message && (
                  <div
                    className={`p-4 rounded-xl border-2 ${
                      message.includes("berhasil")
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-red-50 border-red-200 text-red-800"
                    }`}
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {message.includes("berhasil") ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan Perubahan
                </div>
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 md:flex-initial text-red-600 border-2 border-red-200 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 hover:border-red-300 transition-all duration-200 transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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