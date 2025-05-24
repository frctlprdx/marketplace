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
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Daftar Produk Anda
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-300 to-amber-300 rounded-full"></div>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
            Belum ada produk
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            Mulai tambahkan produk pertama Anda untuk memulai berjualan
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                      <th className="px-6 py-4 text-left font-semibold">ID</th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Gambar
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Nama Produk
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Harga
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product, index) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 cursor-pointer transition-all duration-200 group"
                        onClick={() => navigate(`/editproduct/${product.id}`)}
                      >
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 rounded-full text-sm font-medium group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                            {product.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-200"
                            />
                            <div className="absolute inset-0 "></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-800 group-hover:text-gray-900">
                            {product.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 font-semibold rounded-full text-sm">
                            Rp{Number(product.price).toLocaleString("id-ID")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden group"
                onClick={() => navigate(`/editproduct/${product.id}`)}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-200"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 group-hover:text-gray-900 text-sm sm:text-base truncate pr-2">
                          {product.name}
                        </h3>
                        <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 text-gray-600 rounded-full text-xs sm:text-sm font-medium group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors flex-shrink-0">
                          {product.id}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 font-semibold rounded-full text-sm">
                          Rp{Number(product.price).toLocaleString("id-ID")}
                        </span>
                        <div className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors">
                          Tekan Untuk Edit Produk
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover indicator */}
                <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            ))}
          </div>

          {/* Product count */}
          <div className="mt-6 sm:mt-8 text-center">
            <span className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-md text-sm text-gray-600 border border-gray-100">
              Total: {products.length} produk
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default SellerProducts;
