import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiShoppingBag } from "react-icons/fi";
import axios from "axios";

const Product = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);

    axios
      .get(`${import.meta.env.VITE_API_URL}/products`)
      .then((res) => {
        setProducts(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600 space-x-2">
            <a
              href="/"
              className="hover:text-[#507969] transition duration-200"
            >
              Home
            </a>
            <span>{"/"}</span>
            <a href="/product" className="text-primary font-medium">
              Products
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Daftar Produk</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
              >
                <div className="h-64 bg-gray-300"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 flex justify-center mb-4">
              <FiShoppingBag size={60} />
            </div>
            <h3 className="text-lg font-medium text-gray-800">
              Produk tidak ditemukan
            </h3>
            <p className="text-gray-600 mt-2">
              Belum ada produk yang tersedia saat ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col"
                onClick={() => navigate(`/productdetail/${product.id}`)}
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-64 w-full object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col justify-between flex-1">
                  {product.category_name && (
                    <span className="text-xs font-medium text-gray-500 mb-1">
                      {product.category_name}
                    </span>
                  )}
                  <h3 className="text-base font-medium text-gray-800 line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-primary font-bold mt-auto">
                    Rp {Number(product.price).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;
