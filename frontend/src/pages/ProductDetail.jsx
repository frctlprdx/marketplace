import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiShoppingCart,
  FiCheck,
  FiArrowLeft,
  FiExternalLink,
  FiUser,
} from "react-icons/fi";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import axios from "axios";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [notifMessage, setNotifMessage] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [cartIds, setCartIds] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const navigate = useNavigate();

  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("user_token");

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${import.meta.env.VITE_API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const ids = res.data.map((item) => Number(item.product_id));
        setWishlistIds(ids);
      })
      .catch((err) => {
        console.error("Failed to fetch wishlist:", err);
      });
  }, [token]);

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${import.meta.env.VITE_API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const ids = res.data.map((item) => Number(item.product_id));
        setCartIds(ids);
      })
      .catch((err) => {
        console.error("Failed to fetch cart:", err);
      });
  }, [token]);

  useEffect(() => {
    if (showNotif) {
      const timer = setTimeout(() => {
        setShowNotif(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showNotif]);

  const handleCart = async () => {
    if (!userId || !token || !product) {
      setNotifMessage("Login terlebih dahulu untuk menambahkan ke keranjang");
      setShowNotif(true);
      return;
    }

    const pid = Number(product.id);
    const isInCart = cartIds.includes(pid);
    setCartLoading(true);

    try {
      if (isInCart) {
        await axios.delete(`${import.meta.env.VITE_API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { user_id: userId, product_id: pid },
        });
        setCartIds((prev) => prev.filter((id) => id !== pid));
        setNotifMessage("Produk dihapus dari keranjang");
        setShowNotif(true);
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/cart`,
          { user_id: userId, product_id: pid, quantity: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCartIds((prev) => [...prev, pid]);
        setNotifMessage("Produk ditambahkan ke keranjang");
        setShowNotif(true);
      }
    } catch (err) {
      console.error("Cart toggle error:", err);
      setNotifMessage("Gagal memperbarui keranjang");
      setShowNotif(true);
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!userId || !token || !product) {
      setNotifMessage("Login terlebih dahulu untuk menambahkan ke wishlist");
      setShowNotif(true);
      return;
    }

    const pid = Number(product.id);
    const isWished = wishlistIds.includes(pid);
    setWishlistLoading(true);

    try {
      if (isWished) {
        await axios.delete(`${import.meta.env.VITE_API_URL}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { user_id: userId, product_id: pid },
        });
        setWishlistIds((prev) => prev.filter((id) => id !== pid));
        setNotifMessage("Produk dihapus dari wishlist");
        setShowNotif(true);
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/wishlist`,
          { user_id: userId, product_id: pid },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlistIds((prev) => [...prev, pid]);
        setNotifMessage("Produk ditambahkan ke wishlist");
        setShowNotif(true);
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
      setNotifMessage("Gagal memperbarui wishlist");
      setShowNotif(true);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleVisitProductUrl = () => {
    if (product.product_url) {
      window.open(product.product_url, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-4 border-[#507969] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">¯\_(ツ)_/¯</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Produk tidak ditemukan
          </h2>
          <p className="text-gray-600 mb-6">
            Maaf, produk yang Anda cari tidak tersedia atau telah dihapus.
          </p>
          <Link
            to="/product"
            className="inline-flex items-center gap-2 bg-[#507969] hover:bg-[#2d5847] text-white px-6 py-3 rounded-lg transition duration-300"
          >
            <FiArrowLeft /> Kembali ke Daftar Produk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Notification */}
      {showNotif && notifMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white px-6 py-4 rounded-lg shadow-lg z-50 border-l-4 border-[#507969] animate-fade-in">
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-700">{notifMessage}</span>
            <button
              onClick={() => setShowNotif(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600 space-x-2">
            <Link
              to="/"
              className="hover:text-[#507969] transition duration-200"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              to="/product"
              className="hover:text-[#507969] transition duration-200"
            >
              Product
            </Link>
            <span>/</span>
            <span className="text-[#507969] font-medium truncate max-w-xs">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:grid md:grid-cols-5 gap-0">
            {/* Product Image */}
            <div className="md:col-span-3 p-6 relative">
              <div className="relative rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center h-96">
                <img
                  src={product.image || "/placeholder.jpg"}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />

                <button
                  onClick={handleWishlist}
                  disabled={wishlistLoading}
                  className="absolute top-4 right-4 bg-white shadow-md rounded-full p-2 hover:shadow-lg transition-shadow duration-300"
                >
                  {wishlistLoading ? (
                    <div className="w-5 h-5 border-2 border-t-2 border-[#507969] border-t-transparent rounded-full animate-spin"></div>
                  ) : wishlistIds.includes(product.id) ? (
                    <IoIosHeart size={22} className="text-[#507969]" />
                  ) : (
                    <IoIosHeartEmpty
                      size={22}
                      className="text-gray-400 hover:text-[#507969]"
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="md:col-span-2 p-6 md:border-l border-gray-100">
              {/* Product Basic Info */}
              <div>
                {product.category_name && (
                  <div className="mb-2">
                    <span className="bg-soft text-primary text-xs font-medium px-2.5 py-1 rounded">
                      {product.category_name}
                    </span>
                  </div>
                )}
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {product.name}
                </h1>
                <p className="text-3xl font-bold text-primary mb-4">
                  Rp {Number(product.price).toLocaleString("id-ID")}
                </p>

                {/* Seller Info */}
                {product.seller_name && (
                  <div className="flex items-center space-x-2 mb-4">
                    <FiUser className="text-gray-500" size={16} />
                    <span className="text-sm text-gray-600">
                      Dijual oleh:{" "}
                      <span className="font-medium text-gray-800">
                        {product.seller_name}
                      </span>
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-2 mb-6">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.stocks > 10
                        ? "bg-green-50 text-green-700"
                        : product.stocks > 0
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    Stok: {product.stocks}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 my-6"></div>

              {/* Price Display */}
              <div className="bg-gray-50 rounded-lg px-4 py-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Harga</span>
                  <span className="text-lg font-bold text-gray-800">
                    Rp {Number(product.price).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCart}
                  disabled={cartLoading || product.stocks === 0}
                  className={`w-full h-12 flex items-center justify-center rounded-lg transition-all duration-300 ${
                    cartIds.includes(Number(product.id))
                      ? "bg-green-500 text-white"
                      : product.stocks === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {cartLoading ? (
                    <div className="w-5 h-5 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : cartIds.includes(Number(product.id)) ? (
                    <>
                      <FiCheck size={20} className="mr-2" />
                      Sudah di Keranjang
                    </>
                  ) : product.stocks === 0 ? (
                    "Stok Habis"
                  ) : (
                    <>
                      <FiShoppingCart size={20} className="mr-2" />
                      Tambah ke Keranjang
                    </>
                  )}
                </button>

                {/* Visit Product URL Button */}
                {product.product_url && (
                  <button
                    onClick={handleVisitProductUrl}
                    className="w-full h-12 flex items-center justify-center rounded-lg bg-[#507969] hover:bg-[#2d5847] text-white transition-all duration-300"
                  >
                    <FiExternalLink size={20} className="mr-2" />
                    Kunjungi Halaman Produk
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="px-6 pb-6">
            <div className="border-t border-gray-100 pt-6">
              <button
                onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                className="w-full flex items-center justify-between text-lg font-medium text-gray-800 mb-4"
              >
                <span>Deskripsi Produk</span>
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isDescriptionOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                className={`transition-all duration-300 overflow-hidden ${
                  isDescriptionOpen
                    ? "max-h-screen opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description ||
                      "Tidak ada deskripsi untuk produk ini."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;