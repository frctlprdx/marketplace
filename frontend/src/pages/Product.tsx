import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Product = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // State for categories
  const [minPrice, setMinPrice] = useState<number | "">(""); // State for minimum price
  const [maxPrice, setMaxPrice] = useState<number | "">(""); // State for maximum price
  const [selectedCategory, setSelectedCategory] = useState<string | "">(""); // State for selected category
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("user_token");
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const toggleFilter = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  // Mengambil kategori dari API
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/categories`)
      .then((res) => {
        setCategories(res.data);
      })
      .catch(console.error);
  }, []);

  // Mengambil produk berdasarkan filter
  useEffect(() => {
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
      })
      .catch(console.error);

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
        })
        .catch(console.error);
    }
  };

  // Function to update URL with filter parameters
  const updateUrlWithFilters = () => {
    console.log("lagi cari");
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (minPrice)
      params.set("minPrice", Math.floor(Number(minPrice)).toString());
    if (maxPrice)
      params.set("maxPrice", Math.floor(Number(maxPrice)).toString());

    navigate(`/product?${params.toString()}`);
  };

  return (
    <div>
      <div className="max-w-7xl h-16 mx-auto px-4">
        <div className="max-w-7xl h-16 mx-auto flex items-center text-sm text-gray-600 space-x-2">
          <a href="/" className="hover:underline cursor-pointer">
            Home
          </a>
          <span>{">"}</span>
          <a href="/product" className="hover:underline cursor-pointer">
            Products
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
          <aside
            className={`lg:col-span-2 bg-white rounded-xl shadow p-4 h-fit top-24 transition-all duration-300 ${
              isFilterVisible ? "block" : "hidden lg:block"
            } ${isFilterVisible ? " z-10 w-full lg:w-auto" : ""}`}
          >
            <h2 className="text-lg font-semibold mb-4">Filter Produk</h2>
            <div className="space-y-2">
              <div>
                <label className="block text-sm text-gray-600">Kategori</label>
                <select
                  className="w-full mt-1 border rounded p-2"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Semua</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600">
                  Harga Minimal
                </label>
                <input
                  type="number"
                  className="w-full mt-1 border rounded p-2"
                  value={minPrice}
                  onChange={(e) =>
                    setMinPrice(e.target.value ? parseInt(e.target.value) : "")
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">
                  Harga Maksimal
                </label>
                <input
                  type="number"
                  className="w-full mt-1 border rounded p-2"
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(e.target.value ? parseInt(e.target.value) : "")
                  }
                />
              </div>
            </div>
            <button
              onClick={updateUrlWithFilters}
              className="w-full mt-4 bg-orange-500 text-white py-2 rounded-xl cursor-pointer"
            >
              Terapkan Filter
            </button>
          </aside>

          {/* Button to toggle filter visibility on mobile */}
          <div className="lg:hidden mb-4">
            <button
              onClick={toggleFilter}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 hover:shadow-xl transition duration-300"
            >
              {isFilterVisible ? "Sembunyikan Filter" : "Tampilkan Filter"}
            </button>
          </div>

          {/* Products Section */}
          <section className="lg:col-span-5">
            <h2 className="text-xl font-bold mb-6">Daftar Produk</h2>
            {products.length === 0 ? (
              <p className="text-gray-500">Produk tidak ditemukan...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 cursor-pointer">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="relative group border rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col"
                  >
                    <button
                      className="absolute m-2 text-orange-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWishlist(product.id);
                      }}
                    >
                      {wishlistIds.includes(product.id) ? (
                        <IoIosHeart
                          size={40}
                          className="bg-white hover:shadow-xl rounded-full p-3 opacity-0 group-hover:opacity-100 transition duration-300"
                        />
                      ) : (
                        <IoIosHeartEmpty
                          size={40}
                          className="bg-white hover:shadow-xl rounded-full p-3 opacity-0 group-hover:opacity-100 transition duration-300"
                        />
                      )}
                    </button>

                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-48 w-full object-cover rounded mb-4"
                      onClick={() => navigate(`/productdetail/${product.id}`)}
                    />
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-orange-600 font-bold mt-2">
                      Rp {Number(product.price).toLocaleString("id-ID")}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Stok: {product.stocks}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default Product;
