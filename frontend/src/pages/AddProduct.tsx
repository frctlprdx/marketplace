import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stocks: "",
    price: "",
  });
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
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
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpload = async (show: boolean) => {
    if (!file) return alert("Pilih gambar terlebih dahulu");
    if (!selectedCategory) return alert("Pilih kategori terlebih dahulu");
    setLoading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `produk/${fileName}`; // ✅ simpan di folder 'produk'

    const { error } = await supabase.storage
      .from("nogosarenmarketplace")
      .upload(filePath, file);

    if (error) {
      setLoading(false);
      return alert("Upload gagal: " + error.message);
    }

    const { data: publicUrl } = supabase.storage
      .from("nogosarenmarketplace")
      .getPublicUrl(filePath); // ✅ ambil dari folder 'produk'

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
          stocks: formData.stocks,
          price: formData.price,
          image: publicUrl.publicUrl, // ✅ image URL yang benar
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
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Tambah Produk</h2>

      <input
        type="text"
        name="name"
        placeholder="Nama Produk"
        onChange={handleChange}
        value={formData.name}
        className="border p-2 mb-2 w-full"
      />

      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kategori
        </label>
        <select
          className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Pilih Kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <textarea
        name="description"
        placeholder="Deskripsi"
        onChange={handleChange}
        value={formData.description}
        className="border p-2 mb-2 w-full"
      />
      <input
        type="number"
        name="stocks"
        placeholder="Stok"
        onChange={handleChange}
        value={formData.stocks}
        className="border p-2 mb-2 w-full"
      />
      <input
        type="number"
        name="price"
        placeholder="Harga"
        onChange={handleChange}
        value={formData.price}
        className="border p-2 mb-2 w-full"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <div className="flex flex-col gap-2">
        <button
          onClick={() => handleUpload(true)}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          {loading ? "Menyimpan..." : "Tampilkan ke Pembeli"}
        </button>
        <button
          onClick={() => handleUpload(false)}
          disabled={loading}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
        >
          {loading ? "Menyimpan..." : "Sembunyikan dari Pembeli"}
        </button>
      </div>

      {message && (
        <p className="mt-4 text-center text-sm text-blue-600">{message}</p>
      )}
    </div>
  );
}

export default AddProduct;
