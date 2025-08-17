import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiPackage,
  FiTag,
  FiFileText,
  FiDollarSign,
  FiHash,
  FiImage,
  FiEye,
  FiEyeOff,
  FiUpload,
  FiCheck,
  FiLoader,
  FiLink,
} from "react-icons/fi";

function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stocks: "",
    price: "",
    product_url: "",
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("user_token");

    if (!token || role !== "seller") {
      navigate("/");
      return;
    }

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

    fetchCategories();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpload = async (show) => {
    if (!file) return alert("Pilih gambar terlebih dahulu");
    if (!selectedCategory) return alert("Pilih kategori terlebih dahulu");
    if (!formData.name) return alert("Nama produk harus diisi");
    if (!formData.stocks) return alert("Stok harus diisi");
    if (!formData.price) return alert("Harga harus diisi");

    setLoading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `produk/${fileName}`;

    const { error } = await supabase.storage
      .from("nogosarenmarketplace")
      .upload(filePath, file);

    if (error) {
      setLoading(false);
      return alert("Upload gagal: " + error.message);
    }

    const { data: publicUrl } = supabase.storage
      .from("nogosarenmarketplace")
      .getPublicUrl(filePath);

    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("user_token");

    if (!userId || !token) {
      setLoading(false);
      return alert("User belum login");
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/product`,
        {
          user_id: userId,
          name: formData.name,
          category_id: selectedCategory,
          description: formData.description,
          stocks: parseInt(formData.stocks),
          price: parseFloat(formData.price),
          image: publicUrl.publicUrl,
          product_url: formData.product_url || null,
          show: show,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("Produk berhasil ditambahkan!");
      setFormData({
        name: "",
        description: "",
        stocks: "",
        price: "",
        product_url: "",
      });
      setFile(null);
      setSelectedCategory("");
    } catch (error) {
      console.error(error);
      setMessage("Gagal menyimpan produk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-300 to-green-500 rounded-full mb-4 shadow-lg">
            <FiPackage className="text-2xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Tambah Produk Baru
          </h1>
          <p className="text-gray-600">
            Tambahkan produk Anda untuk mulai berjualan
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <form className="space-y-6">
              {/* Product Name */}
              <div className="group">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <FiPackage className="mr-2 text-green-500" />
                  Nama Produk *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    placeholder="Masukkan nama produk yang menarik"
                    onChange={handleChange}
                    value={formData.name}
                    required
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="group">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <FiTag className="mr-2 text-green-500" />
                  Kategori Produk *
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 outline-none text-gray-700 bg-white appearance-none cursor-pointer"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    required
                  >
                    <option value="" className="text-gray-400">
                      Pilih kategori yang sesuai
                    </option>
                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                        className="text-gray-700"
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Product URL */}
              <div className="group">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <FiLink className="mr-2 text-green-500" />
                  URL Produk
                </label>
                <div className="relative">
                  <input
                    type="url"
                    name="product_url"
                    placeholder="https://contoh.com/produk-anda"
                    onChange={handleChange}
                    value={formData.product_url}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Link ke halaman produk eksternal atau toko online lainnya
                </p>
              </div>

              {/* Description */}
              <div className="group">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <FiFileText className="mr-2 text-green-500" />
                  Deskripsi Produk
                </label>
                <textarea
                  name="description"
                  placeholder="Deskripsikan produk Anda secara detail..."
                  onChange={handleChange}
                  value={formData.description}
                  rows={4}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none text-gray-700 placeholder-gray-400 resize-none"
                />
              </div>

              {/* Stock and Price Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <FiHash className="mr-2 text-green-500" />
                    Jumlah Stok *
                  </label>
                  <input
                    type="number"
                    name="stocks"
                    placeholder="0"
                    onChange={handleChange}
                    value={formData.stocks}
                    min="0"
                    required
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>

                <div className="group">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <FiDollarSign className="mr-2 text-green-500" />
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    placeholder="0"
                    onChange={handleChange}
                    value={formData.price}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="group">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <FiImage className="mr-2 text-green-500" />
                  Gambar Produk *
                </label>
                <div className="relative">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200 group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiUpload className="w-8 h-8 mb-2 text-gray-400 group-hover:text-green-500" />
                        <p className="mb-2 text-sm text-gray-500 group-hover:text-green-500">
                          <span className="font-semibold">
                            Klik untuk upload
                          </span>{" "}
                          atau drag & drop
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG, atau JPEG (MAX. 10MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                  {file && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 flex items-center">
                        <FiCheck className="mr-2" />
                        File terpilih: {file.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleUpload(true)}
                disabled={loading}
                className="flex-1 flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {loading ? (
                  <FiLoader className="animate-spin mr-2" />
                ) : (
                  <FiEye className="mr-2" />
                )}
                {loading ? "Menyimpan..." : "Tampilkan ke Pembeli"}
              </button>

              <button
                onClick={() => handleUpload(false)}
                disabled={loading}
                className="flex-1 flex items-center justify-center px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 focus:ring-4 focus:ring-gray-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {loading ? (
                  <FiLoader className="animate-spin mr-2" />
                ) : (
                  <FiEyeOff className="mr-2" />
                )}
                {loading ? "Menyimpan..." : "Sembunyikan dari Pembeli"}
              </button>
            </div>
          </div>
        </div>

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
  );
}

export default AddProduct;
