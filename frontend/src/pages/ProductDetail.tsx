import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import axios from "axios";
import { toast } from "react-toastify";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);

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

  const handleWishlist = async () => {
    if (!userId || !token || !product) {
      console.log("belum login")
      toast.error("Login terlebih dahulu untuk menambahkan ke wishlist", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        theme: "light",
      });
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
        <div className="flex flex-col items-center shadow-xl rounded-lg overflow-hidden mx-4 sm:mx-0">
          <img
            src={product.image || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-4 px-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="text-sm text-gray-600">Stok: {product.stocks}</div>
          <p className="text-2xl text-orange-600 font-semibold">
            Rp {product.price.toLocaleString()}
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
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-6 h-fit">
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
                Rp {subtotal.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center">
            <button className="w-12 h-12 flex items-center justify-center border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white rounded-full transition">
              <FiShoppingCart size={20} />
            </button>

            <button
              onClick={handleWishlist}
              disabled={wishlistLoading}
              className={`w-12 h-12 flex items-center justify-center border border-orange-500 ${
                wishlistIds.includes(product.id)
                  ? "bg-white text-orange-500"
                  : "text-orange-500"
              } hover:bg-orange-500 hover:text-white rounded-full transition`}
            >
              {wishlistIds.includes(product.id) ? (
                <IoIosHeart size={20} />
              ) : (
                <IoIosHeartEmpty size={20} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Placeholder Additional Info */}
      <div className="max-w-7xl mx-auto mt-10 px-4 shadow-xl rounded-xl">
        <p className="py-10 text-center text-gray-500">Informasi Tambahan</p>
      </div>
    </div>
  );
};

export default ProductDetail;
