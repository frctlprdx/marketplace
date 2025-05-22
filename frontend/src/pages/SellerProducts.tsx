// SellerProducts.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    const fetchProducts = async () => {
      const token = localStorage.getItem("user_token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/sellerpage`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProducts(res.data);
    };
    fetchProducts();
  }, []);

  return (
    <div className="p-4 max-w-screen-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Semua Produk Anda</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition duration-200"
            onClick={() => navigate(`/editproduct/${product.id}`)}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-cover rounded-t-lg"
            />
            <div className="p-3">
              <h3 className="text-base font-medium truncate">{product.name}</h3>
              <p className="text-sm text-orange-600 font-semibold mt-1">
                Rp{Number(product.price).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerProducts;
