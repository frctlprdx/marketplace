import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { supabase } from "../supabase";

const EditProduct = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stocks: "",
    image: "",
  });
  const [message, setMessage] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [oldImageUrl, setOldImageUrl] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    axios
      .get(`${import.meta.env.VITE_API_URL}/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setFormData(res.data);
        setOldImageUrl(res.data.image); // Simpan URL lama
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("user_token");

    try {
      let imageUrl = formData.image;

      if (newImage) {
        // 1. Upload gambar baru ke Supabase
        const fileExt = newImage.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from("nogosarenmarketplace")
          .upload(fileName, newImage);

        if (error) throw error;

        imageUrl = `${
          import.meta.env.VITE_SUPABASE_URL
        }/storage/v1/object/public/nogosarenmarketplace/${fileName}`;

        // 2. Hapus gambar lama dari Supabase
        const oldPath = oldImageUrl.split("/nogosarenmarketplace/")[1];
        if (oldPath) {
          await supabase.storage.from("nogosarenmarketplace").remove([oldPath]);
        }
      }

      // 3. Kirim data update ke Laravel (dengan id di URL)
      await axios.put(
        `${import.meta.env.VITE_API_URL}/product/${id}`,
        {
          name: formData.name,
          description: formData.description,
          stocks: formData.stocks,
          price: formData.price,
          image: imageUrl,
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

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">Edit Produk</h2>

      {/* Gambar Produk */}
      {formData.image && (
        <div>
          <img
            src={formData.image}
            alt={formData.image}
            className="w-full h-48 object-cover rounded mb-4"
          />
        </div>
      )}

      {/* Input File */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setNewImage(e.target.files?.[0] || null)}
        className="mb-4"
      />

      {/* Form */}
      <input
        type="text"
        name="name"
        placeholder="Nama Produk"
        value={formData.name}
        onChange={handleChange}
        className="border p-2 mb-2 w-full"
      />
      <textarea
        name="description"
        placeholder="Deskripsi"
        value={formData.description}
        onChange={handleChange}
        className="border p-2 mb-2 w-full"
      />
      <input
        type="number"
        name="stocks"
        placeholder="Stok"
        value={formData.stocks}
        onChange={handleChange}
        className="border p-2 mb-2 w-full"
      />
      <input
        type="number"
        name="price"
        placeholder="Harga"
        value={formData.price}
        onChange={handleChange}
        className="border p-2 mb-2 w-full"
      />

      <button
        onClick={handleUpdate}
        className="bg-orange-500 text-white px-4 py-2 rounded w-full"
      >
        Simpan Perubahan
      </button>

      {message && (
        <p className="mt-2 text-sm text-center text-gray-700">{message}</p>
      )}
    </div>
  );
};

export default EditProduct;
