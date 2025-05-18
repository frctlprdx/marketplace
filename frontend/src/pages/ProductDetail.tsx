import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiCheck } from "react-icons/fi";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import axios from "axios";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [notifMessage, setNotifMessage] = useState<string | null>(null);
  const [showNotif, setShowNotif] = useState(false);
  const [cartIds, setCartIds] = useState<number[]>([]);
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
        const ids = res.data.map((item: any) => Number(item.product_id));
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
        const ids = res.data.map((item: any) => Number(item.product_id));
        setCartIds(ids);
      })
      .catch((err) => {
        console.error("Failed to fetch cart:", err);
      });
  }, [token]);

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
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/cart`,
          { user_id: userId, product_id: pid, quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCartIds((prev) => [...prev, pid]);
      }
    } catch (err) {
      console.error("Cart toggle error:", err);
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
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/wishlist`,
          { user_id: userId, product_id: pid },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlistIds((prev) => [...prev, pid]);
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const subtotal = product ? product.price * quantity : 0;

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center text-2xl text-orange-500">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-screen h-screen flex items-center justify-center text-2xl text-red-500">
        Produk tidak ditemukan.
      </div>
    );
  }

  return (
    <div>
      {/* Notifikasi */}
      {showNotif && notifMessage && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-white border border-orange-400 text-orange-700 px-6 py-3 rounded shadow z-50">
          <div className="flex items-center justify-between gap-4">
            <span>{notifMessage}</span>
            <button
              onClick={() => setShowNotif(false)}
              className="text-orange-600 font-bold text-lg"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="max-w-7xl h-16 mx-auto px-4">
        <div className="h-16 flex items-center text-sm text-gray-600 space-x-2">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <span>{">"}</span>
          <Link to="/product" className="hover:underline">
            Product
          </Link>
          <span>{">"}</span>
          <span className="text-orange-600 font-semibold">{product.name}</span>
        </div>
      </div>

      {/* Main Detail */}
      <div className="max-w-7xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-[2fr_3fr_1.5fr] gap-10">
        {/* Image */}
        <div className="flex flex-col items-center shadow-xl rounded-lg overflow-hidden mx-8 sm:mx-0">
          <img
            src={product.image || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-4 px-8">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="text-sm text-gray-600">Stok: {product.stocks}</div>
          <p className="text-2xl text-orange-600 font-semibold">
            Rp {Number(product.price).toLocaleString("id-ID")}
          </p>

          {/* Expandable Description */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold flex items-center">
              Deskripsi Produk
              <button
                onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                className="ml-2 transition-transform duration-300"
              >
                <svg
                  className={`w-6 h-6 ${isDescriptionOpen ? "rotate-180" : ""}`}
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
            </h2>
            <div
              className={`transition-all duration-500 mt-2 ${
                isDescriptionOpen
                  ? "opacity-100 max-h-screen"
                  : "opacity-0 max-h-0 overflow-hidden"
              }`}
            >
              <p className="text-gray-700 leading-relaxed text-justify shadow-xl p-4 rounded-xl bg-white">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Checkout */}
        <div className="bg-white shadow-md rounded-lg px-8 pb-4 flex flex-col gap-6 h-fit">
          <div className="flex flex-col gap-2">
            <span className="text-gray-700">Jumlah</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xl"
              >
                -
              </button>
              <span className="text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xl"
              >
                +
              </button>
            </div>
            <div className="mt-2 text-gray-700">
              Subtotal:{" "}
              <span className="font-semibold">
                Rp {Number(subtotal).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center">
            <button
              onClick={handleCart}
              disabled={cartLoading}
              className={`w-12 h-12 flex items-center justify-center border transition rounded-full ${
                cartIds.includes(product.id)
                  ? "bg-orange-500 text-white border-orange-500 hover:shadow-xl"
                  : "bg-white text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white"
              }`}
            >
              {cartLoading ? (
                <div className="w-6 h-6 border-4 border-t-4 border-white rounded-full animate-spin"></div>
              ) : cartIds.includes(product.id) ? (
                <FiCheck size={20} />
              ) : (
                <FiShoppingCart size={20} />
              )}
            </button>

            <button
              onClick={handleWishlist}
              disabled={wishlistLoading}
              className={`w-12 h-12 flex items-center justify-center border border-orange-500 ${
                wishlistIds.includes(product.id)
                  ? "bg-white text-orange-500 hover:shadow-xl"
                  : "bg-white text-orange-500 hover:shadow-xl"
              } rounded-full transition`}
            >
              {wishlistLoading ? (
                <div className="w-6 h-6 border-4 border-t-4 border-orange-500 rounded-full animate-spin"></div>
              ) : wishlistIds.includes(product.id) ? (
                <IoIosHeart size={24} />
              ) : (
                <IoIosHeartEmpty size={24} />
              )}
            </button>
          </div>
          <button
            onClick={() => {
              if (!product) return;
              navigate("/checkout", {
                state: {
                  product: {
                    ...product,
                    quantity,
                  },
                },
              });
            }}
            className="w-full py-2 mt-4 rounded-xl bg-orange-500 text-white font-semibold rounded hover:bg-orange-600 transition"
          >
            Beli Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
