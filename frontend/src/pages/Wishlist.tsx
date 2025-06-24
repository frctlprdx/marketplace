import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { IoIosHeart } from "react-icons/io";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [removingProductIds, setRemovingProductIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]); // State untuk menyimpan data cart
  const [quantities, setQuantities] = useState<{ [productId: number]: number }>(
    {}
  );
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("user_id");

  useEffect(() => {
    if (userId) {
      const fetchWishlist = async () => {
        const userId = localStorage.getItem("user_id");
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
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError("An unknown error occurred");
          }
        } finally {
          setLoading(false);
        }
      };

      const fetchCart = async () => {
        const userId = localStorage.getItem("user_id");
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
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError("An unknown error occurred");
          }
        }
      };

      fetchWishlist();
      fetchCart();
    }
  }, [userId]);

  const handleRemoveFromWishlist = async (productId: number) => {
    const userId = localStorage.getItem("user_id");
    const userToken = localStorage.getItem("user_token");

    if (!userId || !userToken) {
      toast.error("Anda belum login!");
      return;
    }

    setRemovingProductIds((prev) => [...prev, productId]);

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/wishlist`,
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

      toast.success("Item berhasil dihapus dari wishlist!");

      setTimeout(() => {
        setWishlist((prev) =>
          prev.filter((item) => item.product_id !== productId)
        );
        setRemovingProductIds((prev) => prev.filter((id) => id !== productId));
      }, 300); // delay untuk animasi
    } catch (error: any) {
      console.error("Gagal menghapus wishlist:", error.response?.data || error);
      toast.error("Gagal menghapus wishlist");
      setRemovingProductIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleAddToCart = async (productId: number) => {
    const userId = localStorage.getItem("user_id");
    const userToken = localStorage.getItem("user_token");

    if (!userId || !userToken) {
      toast.error("Anda belum login!");
      return;
    }

    const quantity = quantities[productId] || 1; // default quantity = 1

    // Check if quantity exceeds available stock
    const item = wishlist.find((item) => item.product_id === productId);
    if (item && quantity > item.stocks) {
      toast.error(`Stok tidak mencukupi! Hanya tersedia ${item.stocks} item.`);
      return;
    }

    setRemovingProductIds((prev) => [...prev, productId]);

    try {
      const response = await axios.post(
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

      // update UI (tandai bahwa item sudah di cart)
      setWishlist((prev) =>
        prev.map((item) =>
          item.product_id === productId ? { ...item, addedToCart: true } : item
        )
      );
    } catch (error: any) {
      console.error(
        "Gagal menambahkan ke keranjang:",
        error.response?.data || error
      );
      toast.error("Gagal menambahkan ke keranjang");
    } finally {
      setRemovingProductIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const isInCart = (productId: number) => {
    return cart.some((item) => item.product_id === productId);
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
                const quantity = quantities[item.product_id] || 1;
                const totalPrice = Number(item.price) * quantity;

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
                    <div className="py-3 space-y-4 ">
                      <p>{item.name}</p>
                      {/* Harga total sesuai quantity */}
                      <p className="text-primary font-bold">
                        Rp {totalPrice.toLocaleString("id-ID")}
                      </p>
                      <p className="text-sm"> Stocks: {item.stocks}</p>
                      <p className="text-xs">Di Post pada {item.created_at}</p>
                    </div>

                    {/* Input quantity */}
                    <div
                      className="flex items-center gap-3 sm:my-2 mb-2 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          setQuantities((prev) => ({
                            ...prev,
                            [item.product_id]: Math.max(
                              (prev[item.product_id] || 1) - 1,
                              1
                            ),
                          }))
                        }
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xl"
                      >
                        -
                      </button>
                      <span className="text-lg">{quantity}</span>
                      <button
                        onClick={() => {
                          const currentQty = quantities[item.product_id] || 1;
                          if (currentQty < item.stocks) {
                            setQuantities((prev) => ({
                              ...prev,
                              [item.product_id]: currentQty + 1,
                            }));
                          } else {
                            toast.warning(
                              `Maksimal ${item.stocks} item tersedia!`
                            );
                          }
                        }}
                        disabled={quantity >= item.stocks}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xl
                          ${
                            quantity >= item.stocks
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-gray-200 hover:bg-gray-300"
                          }`}
                      >
                        +
                      </button>
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
