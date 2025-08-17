import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiTag,
  FiCheck,
  FiLoader,
  FiPlus,
  FiList,
  FiEdit3,
} from "react-icons/fi";

export default function AddCategory() {
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("user_token");

    if (!token || role !== "seller") {
      navigate("/");
      return;
    }

    fetchCategories();
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/categories`
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Gagal mengambil kategori:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      setMessage("Nama kategori harus diisi");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("user_token");

      await axios.post(
        `${import.meta.env.VITE_API_URL}/addcategory`,
        {
          name: categoryName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Kategori berhasil ditambahkan!");
      setCategoryName("");
      fetchCategories(); // Refresh list kategori
    } catch (error) {
      console.error(error);
      if (error.response?.status === 422) {
        setMessage("Nama kategori sudah ada atau tidak valid");
      } else {
        setMessage("Gagal menambahkan kategori");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCategoryName(e.target.value);
    setMessage(""); // Clear message when typing
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full mb-4 shadow-lg">
            <FiTag className="text-2xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Kelola Kategori
          </h1>
          <p className="text-gray-600">Tambahkan dan kelola kategori produk</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Add Category */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <FiPlus className="mr-2" />
                Tambah Kategori Baru
              </h2>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Name Input */}
                <div className="group">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <FiEdit3 className="mr-2 text-green-500" />
                    Nama Kategori *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Contoh: Snacks, Dairy, dll"
                      onChange={handleChange}
                      value={categoryName}
                      required
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {loading ? (
                      <FiLoader className="animate-spin mr-2" />
                    ) : (
                      <FiPlus className="mr-2" />
                    )}
                    {loading ? "Menambahkan..." : "Tambah Kategori"}
                  </button>
                </div>
              </form>

              {/* Success/Error Message */}
              {message && (
                <div
                  className={`mt-6 p-4 rounded-xl ${
                    message.includes("berhasil")
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-center">
                    <FiCheck
                      className={`mr-3 ${
                        message.includes("berhasil")
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    />
                    <p
                      className={`font-medium ${
                        message.includes("berhasil")
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {message}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category List */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <FiList className="mr-2" />
                Daftar Kategori ({categories.length})
              </h2>
            </div>

            <div className="p-6">
              {categories.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {categories.map((category, index) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-green-600 font-semibold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-gray-700 font-medium">
                          {category.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                          ID: {category.id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Belum ada kategori</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
