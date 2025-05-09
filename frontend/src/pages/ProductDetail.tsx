import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { FiHeart, FiShoppingCart } from "react-icons/fi";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [dots, setDots] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [hoverCart, setHoverCart] = useState(false);
  const [hoverWishlist, setHoverWishlist] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error(err));
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (!product)
    return (
      <div className="w-screen h-screen flex items-center justify-center text-center text-3xl text-orange-500">
        Loading product{dots}
      </div>
    );

  const subtotal = product.price * quantity;

  return (
    <div className="">
      {/* Breadcrumb */}
      <div className="max-w-7xl h-16 mx-auto px-4">
        <div className="max-w-7xl h-16 mx-auto flex items-center text-sm text-gray-600 space-x-2">
          <a href="/" className="hover:underline cursor-pointer">
            Home
          </a>
          <span>{">"}</span>
          <a href="/product" className="hover:underline cursor-pointer">
            Product
          </a>
          <span>{">"}</span>
          <span className="text-orange-600 font-semibold">{product.name}</span>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-[2fr_3fr_1.5fr] gap-10">
        {/* Left - Image */}
        <div className="flex flex-col items-center mx-4 sm:mx-0 shadow-xl rounded-lg">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-auto rounded-lg object-cover"
          />
        </div>

        {/* Center - Product Info */}
        <div className="flex flex-col gap-4 px-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Terjual :</span>
          </div>
          <p className="text-2xl text-orange-600 font-semibold">
            Rp {product.price.toLocaleString()}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Stok: {product.stocks}
            </span>
          </div>

          {/* Description Toggle with Chevron */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold flex items-center">
              Deskripsi Produk
              <button
                onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                className="ml-2 transform transition-transform duration-300 cursor-pointer"
              >
                <svg
                  className={`w-6 h-6 ${
                    isDescriptionOpen ? "rotate-180" : "rotate-0"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </h2>
            <div
              className={`origin-top transition-all duration-500 ease-in-out transform ${
                isDescriptionOpen
                  ? "scale-y-100 opacity-100"
                  : "scale-y-0 opacity-0"
              }`}
            >
              <p className="text-gray-700 leading-relaxed text-justify shadow-xl p-4 rounded-xl bg-white">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right - Quantity & Buttons */}
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

          <button
            className="flex items-center justify-center border border-transparent gap-2 bg-orange-500 hover:bg-white hover:text-orange-500 hover:border hover:border-orange-500 text-white font-semibold py-3 px-6 rounded-full transition"
            onMouseEnter={() => setHoverCart(true)}
            onMouseLeave={() => setHoverCart(false)}
            onClick={() => alert("Product added to cart!")}
          >
            {hoverCart ? (
              <FaShoppingCart size={20} />
            ) : (
              <FiShoppingCart size={20} />
            )}{" "}
            + Keranjang
          </button>

          <button
            className="flex items-center justify-center gap-2 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold py-3 px-6 rounded-full transition"
            onMouseEnter={() => setHoverWishlist(true)}
            onMouseLeave={() => setHoverWishlist(false)}
          >
            {hoverWishlist ? <FaHeart size={20} /> : <FiHeart size={20} />}{" "}
            Wishlist
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="max-w-7xl mx-auto mt-10 px-4 shadow-xl rounded-xl">
        {/* Isi komen */}
        coba
      </div>
    </div>
  );
};

export default ProductDetail;
