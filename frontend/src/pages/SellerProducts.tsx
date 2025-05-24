import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

  return (
    <div className="p-4 max-w-screen-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Daftar Produk Anda</h2>
      {products.length === 0 ? (
        <p>Belum ada produk.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Gambar</th>
                <th className="px-4 py-2 border">Nama Produk</th>
                <th className="px-4 py-2 border">Harga</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/editproduct/${product.id}`)}
                >
                  <td className="px-4 py-2 border text-center">{product.id}</td>
                  <td className="px-4 py-2 border text-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover mx-auto rounded"
                    />
                  </td>
                  <td className="px-4 py-2 border">{product.name}</td>
                  <td className="px-4 py-2 border text-orange-600 font-semibold">
                    Rp{Number(product.price).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
