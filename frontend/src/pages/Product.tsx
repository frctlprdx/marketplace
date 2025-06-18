import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import { FiFilter, FiX, FiShoppingBag } from "react-icons/fi";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Product = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [selectedCategory, setSelectedCategory] = useState<string | "">("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("user_token");

  const toggleFilter = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  // Get categories from API
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/categories`)
      .then((res) => {
        setCategories(res.data);
      })
      .catch(console.error);
  }, []);

  // Get products based on filters
  useEffect(() => {
    setIsLoading(true);
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get("search") || "";
    const categoryFilter = queryParams.get("category") || "";
    const minPriceFilter = queryParams.get("minPrice") || "";
    const maxPriceFilter = queryParams.get("maxPrice") || "";

    setSelectedCategory(categoryFilter);
    setMinPrice(minPriceFilter ? parseInt(minPriceFilter) : "");
    setMaxPrice(maxPriceFilter ? parseInt(maxPriceFilter) : "");

    axios
      .get(`${import.meta.env.VITE_API_URL}/products`, {
        params: {
          search: searchQuery,
          category: categoryFilter,
          minPrice: minPriceFilter,
          maxPrice: maxPriceFilter,
        },
      })
      .then((res) => {
        setProducts(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });

    if (userId && token) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/wishlist?user_id=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const ids = res.data.map((item: any) => item.product_id);
          setWishlistIds(ids);
        })
        .catch(console.error);
    }
  }, [location.search, userId, token]);

  const handleWishlist = (productId: number) => {
    if (!userId || !token) {
      toast.error("Login terlebih dahulu!");
      return;
    }

    const isInWishlist = wishlistIds.includes(productId);

    if (isInWishlist) {
      axios
        .delete(`${import.meta.env.VITE_API_URL}/wishlist`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            user_id: userId,
            product_id: productId,
          },
        })
        .then(() => {
          setWishlistIds((prev) => prev.filter((id) => id !== productId));
          toast.success("Dihapus dari wishlist");
        })
        .catch(console.error);
    } else {
      axios
        .post(
          `${import.meta.env.VITE_API_URL}/wishlist`,
          {
            user_id: userId,
            product_id: productId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then(() => {
          setWishlistIds((prev) => [...prev, productId]);
          toast.success("Ditambahkan ke wishlist");
        })
        .catch(console.error);
    }
  };

  // Update URL with filter parameters
  const updateUrlWithFilters = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (minPrice)
      params.set("minPrice", Math.floor(Number(minPrice)).toString());
    if (maxPrice)
      params.set("maxPrice", Math.floor(Number(maxPrice)).toString());

    navigate(`/product?${params.toString()}`);
    if (window.innerWidth < 1024) {
      setIsFilterVisible(false);
    }
  };

  const resetFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    navigate("/product");
  };

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Daftar Produk</h1>

          {/* Mobile Filter Button */}
          <button
            onClick={toggleFilter}
            className="lg:hidden flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
          >
            <FiFilter />
            <span>Filter</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Panel */}
          <div
            className={`lg:block ${
              isFilterVisible
                ? "block fixed inset-0 z-50 bg-black/60 bg-opacity-50"
                : "hidden"
            }`}
          >
            <div
              className={`bg-white rounded-lg shadow-lg p-5 lg:sticky lg:top-4 ${
                isFilterVisible
                  ? "m-4 max-h-[calc(100vh-2rem)] overflow-y-auto"
                  : ""
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Filter</h2>
                {isFilterVisible && (
                  <button
                    onClick={toggleFilter}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    <FiX size={20} />
                  </button>
                )}
              </div>

              <div className="space-y-5">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#507969] focus:border-[#507969]"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Semua Kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rentang Harga
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Min (Rp)</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#507969] focus:border-[#507969]"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) =>
                          setMinPrice(
                            e.target.value ? parseInt(e.target.value) : ""
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Max (Rp)</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#507969] focus:border-[#507969]"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) =>
                          setMaxPrice(
                            e.target.value ? parseInt(e.target.value) : ""
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-col space-y-2 pt-3">
                  <button
                    onClick={updateUrlWithFilters}
                    className="w-full bg-button text-white py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
                  >
                    <FiFilter size={16} />
                    <span>Terapkan Filter</span>
                  </button>

                  <button
                    onClick={resetFilters}
                    className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg transition duration-300"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-gray-300"></div>
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
                  Coba ubah filter atau cari produk lainnya
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 text-primary"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-48 w-full object-cover cursor-pointer"
                        onClick={() => navigate(`/productdetail/${product.id}`)}
                      />
                      <button
                        className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md transition-transform hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWishlist(product.id);
                        }}
                      >
                        {wishlistIds.includes(product.id) ? (
                          <IoIosHeart size={22} className="text-primary" />
                        ) : (
                          <IoIosHeartEmpty
                            size={22}
                            className="text-gray-600"
                          />
                        )}
                      </button>
                    </div>

                    <div
                      className="p-4"
                      onClick={() => navigate(`/productdetail/${product.id}`)}
                    >
                      <div className="mb-2">
                        {product.category_name && (
                          <span className="text-xs font-medium text-gray-500">
                            {product.category_name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 line-clamp-2 mb-2 cursor-pointer">
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center">
                        <p className="text-primary font-bold">
                          Rp {Number(product.price).toLocaleString("id-ID")}
                        </p>
                        <p
                          className={`text-sm ${
                            product.stocks > 10
                              ? "text-green-600"
                              : "text-primary"
                          }`}
                        >
                          Stok: {product.stocks}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default Product;
