import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { supabase } from "../supabase";
import { Eye, EyeOff, Save, Upload, CheckCircle, XCircle } from "lucide-react";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stocks: "",
    image: "",
    show: true, // ✅ gunakan show, bukan status
  });

  const [message, setMessage] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [oldImageUrl, setOldImageUrl] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("user_token");

    if (!token || role !== "seller") {
      navigate("/");
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setFormData(res.data);
        setOldImageUrl(res.data.image);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("user_token");
    try {
      let imageUrl = formData.image;

      if (newImage) {
        const fileExt = newImage.name.split(".").pop();
        const fileName = `produk/${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage
          .from("nogosarenmarketplace")
          .upload(fileName, newImage);

        if (error) throw error;

        imageUrl = `${
          import.meta.env.VITE_SUPABASE_URL
        }/storage/v1/object/public/nogosarenmarketplace/${fileName}`;

        const oldPath = oldImageUrl.split("/nogosarenmarketplace/")[1]; // Ambil path relatif dari dalam bucket
        if (oldPath) {
          await supabase.storage.from("nogosarenmarketplace").remove([oldPath]);
        }
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/product/${id}`,
        {
          name: formData.name,
          description: formData.description,
          stocks: formData.stocks,
          price: formData.price,
          image: imageUrl,
          show: formData.show, // ✅ kirim 'show' ke backend
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Produk berhasil diupdate.");
    } catch (err) {
      console.error(err);
      setMessage("Gagal update produk.");
    }
  };

  const handleVisibilityChange = async (visible) => {
    const token = localStorage.getItem("user_token");
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/product/${id}`,
        { show: visible }, // ✅ ubah status visibilitas
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFormData((prev) => ({ ...prev, show: visible }));
      setMessage(
        visible
          ? "Produk ditampilkan ke pembeli."
          : "Produk disembunyikan dari pembeli."
      );
    } catch (err) {
      console.error(err);
      setMessage("Gagal mengubah status produk.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Edit Produk</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-green-700 to-green-500 rounded-full mx-auto"></div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            {/* Product Image Preview */}
            {formData.image && (
              <div className="relative group">
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={formData.image}
                    alt="preview"
                    className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="absolute top-4 right-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      formData.show
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {formData.show ? (
                      <>
                        <Eye size={16} className="mr-1" /> Visible
                      </>
                    ) : (
                      <>
                        <EyeOff size={16} className="mr-1" /> Hidden
                      </>
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Ganti Gambar Produk
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center justify-center w-full h-12 px-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Upload size={20} className="text-green-500" />
                    <span className="text-sm font-medium">
                      {newImage ? newImage.name : "Pilih gambar baru"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Nama Produk
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Masukkan nama produk"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Deskripsi Produk
                </label>
                <textarea
                  name="description"
                  placeholder="Masukkan deskripsi produk"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none"
                />
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Stok
                </label>
                <input
                  type="number"
                  name="stocks"
                  placeholder="0"
                  value={formData.stocks}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-4">
              {/* Save Button */}
              <button
                onClick={handleUpdate}
                className="w-full bg-gradient-to-r from-green-500 to-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-600 focus:ring-4 focus:ring-green-200 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
              >
                <Save size={20} />
                <span>Simpan Perubahan</span>
              </button>

              {/* Visibility Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleVisibilityChange(true)}
                  className={`py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2 ${
                    formData.show
                      ? "bg-orange-500 text-white hover:bg-orange-600 focus:ring-4 focus:ring-orange-200"
                      : "bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300"
                  }`}
                >
                  <Eye size={18} />
                  <span>Tampilkan ke Pembeli</span>
                </button>
                <button
                  onClick={() => handleVisibilityChange(false)}
                  className={`py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2 ${
                    !formData.show
                      ? "bg-gray-500 text-white hover:bg-gray-600 focus:ring-4 focus:ring-gray-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  }`}
                >
                  <EyeOff size={18} />
                  <span>Sembunyikan dari Pembeli</span>
                </button>
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div className="mt-6">
                <div
                  className={`p-4 rounded-xl border ${
                    message.includes("berhasil") ||
                    message.includes("ditampilkan") ||
                    message.includes("disembunyikan")
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {message.includes("berhasil") ||
                    message.includes("ditampilkan") ||
                    message.includes("disembunyikan") ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <XCircle size={20} className="text-red-600" />
                    )}
                    <span className="font-medium">{message}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;