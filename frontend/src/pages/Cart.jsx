import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingProductIds, setRemovingProductIds] = useState([]);

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

        const data = await response.json();
        setCart(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleRemoveFromCart = async (productId) => {
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
        data: { user_id: userId, product_id: productId },
      });

      toast.success("Item berhasil dihapus dari cart!");
      setCart((prev) => prev.filter((item) => item.product_id !== productId));
    } catch (error) {
      console.error("Gagal menghapus cart:", error.response?.data || error);
      toast.error("Gagal menghapus cart");
    } finally {
      setRemovingProductIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const groupedBySeller = cart.reduce((acc, item) => {
    const seller = item.seller_name || "Unknown Seller";
    if (!acc[seller]) acc[seller] = [];
    acc[seller].push(item);
    return acc;
  }, {});

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="max-w-7xl h-16 mx-auto px-4">
        <div className="flex items-center text-sm text-gray-600 space-x-2">
          <a href="/" className="hover:underline cursor-pointer">
            Home
          </a>
          <span>/</span>
          <a href="/cart" className="hover:underline cursor-pointer">
            Cart
          </a>
        </div>
      </div>

      <div>
        {cart.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 flex flex-col h-screen justify-center items-center">
            <p className="text-3xl pb-12">Keranjang kosong.</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-xl font-semibold mb-6">
              Cart milik {cart[0].user_name}
            </h2>

            {Object.entries(groupedBySeller).map(([sellerName, items]) => {
              return (
                <div key={sellerName} className="mb-10">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center space-x-2">
                      {items[0].seller_profile ? (
                        <img
                          src={items[0].seller_profile}
                          alt="Seller"
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-[#507969] rounded-full flex items-center justify-center text-white">
                          <svg
                            className="w-5 h-5"
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border rounded-lg hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
                        onClick={() => navigate(`/productdetail/${item.id}`)}
                      >
                        <div className="relative aspect-square">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromCart(item.product_id);
                            }}
                            disabled={removingProductIds.includes(
                              item.product_id
                            )}
                            className={`absolute top-2 right-2 z-20 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-all duration-300 ${
                              removingProductIds.includes(item.product_id)
                                ? "opacity-50 cursor-not-allowed"
                                : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                            }`}
                            title="Hapus dari keranjang"
                          >
                            <FiTrash2 size={18} />
                          </button>

                          <img
                            className="w-full h-full object-cover"
                            src={item.image}
                            alt={item.name}
                          />
                        </div>

                        <div className="p-4">
                          <h3 className="text-lg font-medium line-clamp-2 mb-2">
                            {item.name}
                          </h3>
                          <p className="text-xl font-bold text-[#507969]">
                            Rp {item.price.toLocaleString()}
                          </p>
                          {item.quantity && (
                            <p className="text-sm text-gray-600 mt-1">
                              Quantity: {item.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
};

export default Cart;