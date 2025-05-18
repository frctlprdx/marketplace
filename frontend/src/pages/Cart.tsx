import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart, FiCheck } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

const Cart = () => {
  const [cart, setCart] = useState<any[]>([]);
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

        const data = await response.json();
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
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/cart`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          data: {
            user_id: userId,
            product_id: productId,
          },
        }
      );

      // Toast after successfully removing item from cart
      toast.success("Item berhasil dihapus dari cart!");

      // Immediately update cart state after successful deletion
      setCart((prev) => prev.filter((item) => item.product_id !== productId));

      // Remove product ID from the list of removing products
      setRemovingProductIds((prev) => prev.filter((id) => id !== productId));
    } catch (error: any) {
      console.error("Gagal menghapus cart:", error.response?.data || error);
      toast.error("Gagal menghapus cart");
      setRemovingProductIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="max-w-7xl h-16 mx-auto px-4">
        <div className="max-w-7xl h-16 mx-auto flex items-center text-sm text-gray-600 space-x-2">
          <a href="/" className="hover:underline cursor-pointer">
            Home
          </a>
          <span>{">"}</span>
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
            <h2 className="text-xl font-semibold mb-4">
              Cart milik {cart[0].user_name}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg hover:shadow-2xl p-4 flex flex-col group hover:border transition-opacity duration-300"
                  onClick={() => navigate(`/productdetail/${item.id}`)}
                >
                  <div className="w-full h-1/2 relative">
                    <FiCheck
                      size={40}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromCart(item.product_id);
                      }}
                      className="bg-orange-500 text-white border-orange-500 hover:shadow-lg m-2 rounded-full p-3 absolute opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer z-10"
                    />
                    <img
                      className="w-full h-full object-cover rounded-md"
                      src={item.image}
                      alt={item.name}
                    />
                  </div>
                  <div className="h-full flex flex-col p-2">
                    <p className="text-2xl">{item.name}</p>
                    <p className="text-xs">
                      Jumlah Barang: {item.quantity}
                    </p>

                    <p className="text-orange-500 text-center mt-auto mb-2">
                      Total Harga: Rp{" "}
                      {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  <button
                    className="mt-auto rounded-xl border-2 px-4 py-2 border-black hover:bg-black hover:text-white opacity-0 group-hover:opacity-100 transition duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/checkout", { state: { product: item } });
                    }}
                  >
                    Checkout
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ToastContainer must be rendered in the root component */}
      <ToastContainer position="top-center" />
    </div>
  );
};

export default Cart;
