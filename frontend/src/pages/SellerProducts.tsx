import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Trash2 } from "lucide-react"; // Icon trash
import { supabase } from "../supabase"; // pastikan sudah import

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
}

const SellerProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("user_token");

    if (!token || role !== "seller") {
      navigate("/");
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/sellerpage`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProducts(res.data);
      } catch (error) {
        console.error("Gagal memuat produk:", error);
      }
    };

    fetchProducts();
  }, [navigate]);

  const handleDelete = async (id: number, imageUrl: string) => {
    const token = localStorage.getItem("user_token");
    if (!confirm("Yakin ingin menghapus produk ini?")) return;

    try {
      // 1. Hapus gambar dari Supabase
      const imagePath = imageUrl.split("/nogosarenmarketplace/")[1];
      if (imagePath) {
        const { error: deleteError } = await supabase.storage
          .from("nogosarenmarketplace")
          .remove([imagePath]);

        if (deleteError) throw deleteError;
      }

      // 2. Hapus produk dari Laravel
      await axios.delete(`${import.meta.env.VITE_API_URL}/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(products.filter((product) => product.id !== id));
    } catch (err) {
      console.error("Gagal menghapus produk:", err);
    }
  };

  return (
    <div className="p-4 max-w-screen-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Semua Produk Anda</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="relative group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition duration-200"
          >
            {/* Tombol Trash */}
            <button
              onClick={() => handleDelete(product.id, product.image)}
              className="absolute top-2 right-2 z-10 p-1 bg-red-500 rounded-full text-white sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition"
            >
              <Trash2 size={16} />
            </button>

            {/* Konten Card */}
            <div
              onClick={() => navigate(`/editproduct/${product.id}`)}
              className="cursor-pointer"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-cover rounded-t-lg"
              />
              <div className="p-3">
                <h3 className="text-base font-medium truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-orange-600 font-semibold mt-1">
                  Rp{Number(product.price).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerProducts;
