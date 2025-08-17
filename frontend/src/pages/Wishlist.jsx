import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { IoIosHeart } from "react-icons/io";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [removingProductIds, setRemovingProductIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (userId) {
      const fetchWishlist = async () => {
        const userToken = localStorage.getItem("user_token");

        if (!userToken) {
          console.log("Token tidak ditemukan");
          return;
        }

        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/wishlist?user_id=${userId}`,
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
            throw new Error("Failed to fetch wishlist");
          }

          const data = await response.json();
          setWishlist(data);
        } catch (error) {
          setError(error.message || "An unknown error occurred");
        } finally {
          setLoading(false);
        }
      };

      const fetchCart = async () => {
        const userToken = localStorage.getItem("user_token");

        if (!userToken) {
          console.log("Token tidak ditemukan");
          return;
        }

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
          setError(error.message || "An unknown error occurred");
        }
      };

      fetchWishlist();
      fetchCart();
    }
  }, [userId]);

  const handleRemoveFromWishlist = async (productId) => {
    const userId = localStorage.getItem("user_id");
    const userToken = localStorage.getItem("user_token");

    if (!userId || !userToken) {
      toast.error("Anda belum login!");
      return;
    }

    setRemovingProductIds((prev) => [...prev, productId]);

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/wishlist`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        data: {
          user_id: userId,
          product_id: productId,
        },
      });

      toast.success("Item berhasil dihapus dari wishlist!");

      setTimeout(() => {
        setWishlist((prev) =>
          prev.filter((item) => item.product_id !== productId)
        );
        setRemovingProductIds((prev) => prev.filter((id) => id !== productId));
      }, 300);
    } catch (error) {
      console.error("Gagal menghapus wishlist:", error.response?.data || error);
      toast.error("Gagal menghapus wishlist");
      setRemovingProductIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleAddToCart = async (productId) => {
    const userId = localStorage.getItem("user_id");
    const userToken = localStorage.getItem("user_token");

    if (!userId || !userToken) {
      toast.error("Anda belum login!");
      return;
    }

    const quantity = 1; // Fixed quantity of 1

    const item = wishlist.find((item) => item.product_id === productId);
    if (item && item.stocks === 0) {
      toast.error("Stok habis!");
      return;
    }

    setRemovingProductIds((prev) => [...prev, productId]);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/cart`,
        {
          product_id: productId,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Item berhasil ditambahkan ke keranjang!");

      setWishlist((prev) =>
        prev.map((item) =>
          item.product_id === productId ? { ...item, addedToCart: true } : item
        )
      );
    } catch (error) {
      console.error(
        "Gagal menambahkan ke keranjang:",
        error.response?.data || error
      );
      toast.error("Gagal menambahkan ke keranjang");
    } finally {
      setRemovingProductIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <div className="max-w-7xl h-16 mx-auto px-4">
        <div className="max-w-7xl h-16 mx-auto flex items-center text-sm text-gray-600 space-x-2">
          <a href="/" className="hover:underline cursor-pointer">
            Home
          </a>
          <span>{"/"}</span>
          <a href="/wishlist" className="hover:underline cursor-pointer">
            Wishlist
          </a>
        </div>
      </div>
      <div>
        {wishlist.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 items-center justify-center flex flex-col h-screen">
            <p className="text-3xl pb-12">Wishlist Kosong.</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-xl font-semibold mb-4">
              Wishlist milik {wishlist[0].user_name}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist.map((item) => {
                return (
                  <div
                    key={item.id}
                    className={`rounded-lg hover:shadow-2xl p-4 flex flex-col group hover:border transition-opacity duration-300 ${
                      removingProductIds.includes(item.product_id)
                        ? "opacity-0 scale-95"
                        : "opacity-100"
                    }`}
                    onClick={() => navigate(`/productdetail/${item.id}`)}
                  >
                    <div className="w-full h-1/2 relative">
                      <IoIosHeart
                        size={40}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWishlist(item.product_id);
                        }}
                        className="text-primary bg-white hover:shadow-lg m-2 rounded-full p-3 absolute opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer z-10"
                      />
                      <img
                        className="w-full h-full object-cover rounded-md"
                        src={item.image}
                        alt={item.name}
                      />
                    </div>
                    <div className="py-2 space-y-2">
                      <p>{item.name}</p>
                      <p className="text-primary font-bold">
                        Rp {Number(item.price).toLocaleString("id-ID")}
                      </p>
                      <p className="text-sm">Stocks: {item.stocks}</p>
                    </div>

                    <button
                      disabled={item.addedToCart || item.stocks === 0}
                      className={`mt-auto rounded-xl border-2 px-4 py-2 bg-button text-white   
                      hover:bg-black hover:text-white 
                      opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition duration-300 
                      ${
                        item.addedToCart || item.stocks === 0
                          ? "cursor-not-allowed bg-gray-300 text-gray-600 border-gray-400 hover:bg-gray-300 hover:text-gray-600"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.addedToCart || item.stocks === 0) return;
                        handleAddToCart(item.product_id);
                      }}
                    >
                      {item.stocks === 0
                        ? "Stok Habis"
                        : item.addedToCart
                        ? "Sudah di Keranjang"
                        : "Add To Cart"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="top-center" autoClose={1500} />
    </div>
  );
};

export default Wishlist;
