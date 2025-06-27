import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

// 1. Define cart item structure
interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  image: string;
  user_name: string;
  seller_name: string;
  seller_profile: string;
}

const Cart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [removingProductIds, setRemovingProductIds] = useState<number[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const userToken = localStorage.getItem("user_token");

    if (!userId || !userToken) {
      console.log("User ID atau Token tidak ditemukan");
      setError("Tidak ada data pengguna");
      setLoading(false);
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/cart?user_id=${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${userToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorDetails = await response.text();
          console.log("Error Details:", errorDetails);
          throw new Error("Failed to fetch cart");
        }

        const data: CartItem[] = await response.json();
        setCart(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleRemoveFromCart = async (productId: number) => {
    const userId = localStorage.getItem("user_id");
    const userToken = localStorage.getItem("user_token");

    if (!userId || !userToken) {
      toast.error("Anda belum login!");
      return;
    }

    setRemovingProductIds((prev) => [...prev, productId]);

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        data: {
          user_id: userId,
          product_id: productId,
        },
      });

      toast.success("Item berhasil dihapus dari cart!");
      setCart((prev) => prev.filter((item) => item.product_id !== productId));
      setRemovingProductIds((prev) => prev.filter((id) => id !== productId));
    } catch (error: any) {
      console.error("Gagal menghapus cart:", error.response?.data || error);
      toast.error("Gagal menghapus cart");
      setRemovingProductIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  // 2. Group items by seller_name
  const groupedBySeller = cart.reduce<Record<string, CartItem[]>>(
    (acc, item) => {
      const seller = item.seller_name || "Unknown Seller";
      if (!acc[seller]) {
        acc[seller] = [];
      }
      acc[seller].push(item);
      return acc;
    },
    {}
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="max-w-7xl h-16 mx-auto px-4">
        <div className="max-w-7xl h-16 mx-auto flex items-center text-sm text-gray-600 space-x-2">
          <a href="/" className="hover:underline cursor-pointer">
            Home
          </a>
          <span>{"/"}</span>
          <a href="/cart" className="hover:underline cursor-pointer">
            Cart
          </a>
        </div>
      </div>

      <div>
        {cart.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 items-center justify-center flex flex-col h-screen">
            <p className="text-3xl pb-12">Keranjang kosong.</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-xl font-semibold mb-6">
              Cart milik {cart[0].user_name}
            </h2>

            {Object.entries(groupedBySeller).map(([sellerName, items]) => (
              <div key={sellerName} className="mb-10">
                <div className="flex items-center space-x-2 mb-4">
                  {items[0].seller_profile ? (
                    <img
                      src={items[0].seller_profile}
                      alt="Seller"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 md:w-8 md:h-8 bg-gradient-to-br from-[#507969] to-[#2d5847] rounded-2xl flex items-center justify-center p-2">
                      <svg
                        className="w-12 h-12 md:w-16 md:h-16 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                  <h3 className="text-lg font-bold">{sellerName}</h3>
                </div>

                {/* Mobile Layout (stack vertically) and Desktop Layout (grid) */}
                <div className="md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 space-y-4 md:space-y-0">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="md:px-2 rounded-lg hover:shadow-2xl flex md:flex-col group hover:border transition-opacity duration-300 bg-white border md:border-0 p-4 md:p-0"
                      onClick={() => navigate(`/productdetail/${item.id}`)}
                    >
                      {/* Mobile: Horizontal layout, Desktop: Vertical layout */}
                      <div className="w-24 h-24 md:w-full md:h-1/2 relative flex-shrink-0 mr-4 md:mr-0">
                        <FiCheck
                          size={24}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromCart(item.product_id);
                          }}
                          className="bg-[#507969] text-white border-[#507969] hover:shadow-lg m-1 md:m-2 rounded-full p-1 md:p-3 absolute opacity-100 md:opacity-0 md:group-hover:opacity-100 transition duration-300 cursor-pointer z-10 top-0 right-0"
                        />
                        <img
                          className="w-full h-full md:mt-2 md:aspect-[4/3] object-cover rounded-md"
                          src={item.image}
                          alt={item.name}
                        />
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 md:h-full flex flex-col md:py-8 md:px-2 justify-between md:space-y-2">
                        <div className="space-y-1 md:space-y-2">
                          <p className="text-lg md:text-2xl font-medium md:font-normal line-clamp-2 md:line-clamp-none">
                            {item.name}
                          </p>
                          <p className="text-sm md:text-xs text-gray-600">
                            Jumlah: {item.quantity}
                          </p>
                          <p className="text-[#507969] font-semibold md:text-primary md:text-xs md:font-normal">
                            Rp {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>

                        <button
                          className="mt-3 md:mt-auto md:mb-2 rounded-xl border-2 px-4 py-2 bg-button text-white hover:bg-black hover:text-white 
                            opacity-100 md:opacity-0 md:group-hover:opacity-100 transition duration-300 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/checkout", { state: { product: item } });
                          }}
                        >
                          Checkout
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
};

export default Cart;
