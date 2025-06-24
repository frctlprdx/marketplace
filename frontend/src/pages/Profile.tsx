import { useEffect, useState } from "react";
import axios from "axios";

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
      await axios.put(
        `${import.meta.env.VITE_API_URL}/profile/${user.id}`,
        {
          name: user.name,
          address: user.address,
          phone_number: user.phone_number,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage("Profil berhasil diperbarui.");
    } catch (error) {
      console.error(error);
      setMessage("Gagal menyimpan perubahan.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-center">Profil Pengguna</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Nama Lengkap
          </label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-md bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Email
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full border border-gray-200 px-4 py-2 rounded-md bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Role
          </label>
          <input
            type="text"
            value={user.role}
            disabled
            className="w-full border border-gray-200 px-4 py-2 rounded-md bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Alamat
          </label>
          <input
            type="text"
            name="address"
            value={user.address}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-md bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Nomor Telepon
          </label>
          <input
            type="text"
            name="phone_number"
            value={user.phone_number}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-md bg-white"
          />
        </div>

        {message && (
          <div
            className={`p-2 text-sm rounded ${
              message.includes("berhasil")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex space-x-4 mt-4">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Simpan Perubahan
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 text-red-500 border border-red-500 px-4 py-2 rounded hover:bg-red-500 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
