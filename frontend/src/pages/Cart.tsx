import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

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
  weight?: number; // Add weight field
}

const Cart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [removingProductIds, setRemovingProductIds] = useState<number[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [activeSeller, setActiveSeller] = useState<string | null>(null); // Track active seller

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
        setError(error instanceof Error ? error.message : "Unknown error");
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
        data: { user_id: userId, product_id: productId },
      });

      toast.success("Item berhasil dihapus dari cart!");
      setCart((prev) => prev.filter((item) => item.product_id !== productId));
      setSelectedItems((prev) => prev.filter((id) => id !== productId));
    } catch (error: any) {
      console.error("Gagal menghapus cart:", error.response?.data || error);
      toast.error("Gagal menghapus cart");
    } finally {
      setRemovingProductIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const isSelected = (productId: number) => selectedItems.includes(productId);

  const toggleItem = (productId: number) => {
    const item = cart.find(cartItem => cartItem.product_id === productId);
    if (!item) return;

    const itemSeller = item.seller_name || "Unknown Seller";

    // If no seller is active, set this item's seller as active
    if (!activeSeller) {
      setActiveSeller(itemSeller);
      setSelectedItems([productId]);
      return;
    }

    // If trying to select item from different seller, show warning and switch seller
    if (activeSeller !== itemSeller) {
      toast.warning(`Beralih ke seller: ${itemSeller}. Pilihan sebelumnya dibatalkan.`);
      setActiveSeller(itemSeller);
      setSelectedItems([productId]);
      return;
    }

    // If same seller, toggle normally
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );

    // If no items selected, clear active seller
    const newSelectedItems = selectedItems.includes(productId)
      ? selectedItems.filter((id) => id !== productId)
      : [...selectedItems, productId];
    
    if (newSelectedItems.length === 0) {
      setActiveSeller(null);
    }
  };

  // Select all items for a seller
  const toggleSellerItems = (items: CartItem[]) => {
    const sellerName = items[0]?.seller_name || "Unknown Seller";
    const sellerProductIds = items.map(item => item.product_id);
    const allSelected = sellerProductIds.every(id => selectedItems.includes(id));
    
    if (allSelected) {
      // Deselect all items from this seller
      setSelectedItems([]);
      setActiveSeller(null);
    } else {
      // Select all items from this seller
      setActiveSeller(sellerName);
      setSelectedItems(sellerProductIds);
    }
  };

  const groupedBySeller = cart.reduce<Record<string, CartItem[]>>(
    (acc, item) => {
      const seller = item.seller_name || "Unknown Seller";
      if (!acc[seller]) acc[seller] = [];
      acc[seller].push(item);
      return acc;
    },
    {}
  );

  // Helper function to check if seller is active
  const isSellerActive = (sellerName: string) => {
    return !activeSeller || activeSeller === sellerName;
  };

  // Helper function to check if seller has any selected items
  const sellerHasSelectedItems = (sellerName: string) => {
    return activeSeller === sellerName && selectedItems.length > 0;
  };

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

            {/* Info text about seller selection */}
            {/* {activeSeller && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Seller aktif:</span> {activeSeller}
                  <br />
                  <span className="text-xs">Anda hanya dapat memilih produk dari satu seller dalam satu waktu untuk memudahkan pembayaran.</span>
                </p>
              </div>
            )} */}

            {Object.entries(groupedBySeller).map(([sellerName, items]) => {
              const selectedSellerItems = items.filter(item =>
                selectedItems.includes(item.product_id)
              );
              const allSellerItemsSelected = items.length > 0 && 
                items.every(item => selectedItems.includes(item.product_id));
              const sellerActive = isSellerActive(sellerName);

              return (
                <div key={sellerName} className={`mb-10 ${!sellerActive ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
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
                      {!sellerActive && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                          Tidak aktif
                        </span>
                      )}
                    </div>
                    
                    {/* Select All Button for Seller */}
                    <button
                      onClick={() => toggleSellerItems(items)}
                      disabled={!sellerActive}
                      className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        !sellerActive
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : allSellerItemsSelected
                          ? "bg-[#507969] text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <FiCheck size={16} />
                      <span>{allSellerItemsSelected ? "Batalkan Semua" : "Pilih Semua"}</span>
                    </button>
                  </div>

                  <div className="md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 space-y-4 md:space-y-0">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`md:px-2 rounded-lg hover:shadow-2xl flex md:flex-col group hover:border transition-opacity duration-300 bg-white border md:border-0 p-4 md:p-0 ${
                          !sellerActive ? 'cursor-not-allowed' : ''
                        }`}
                        onClick={() => {
                          if (sellerActive) {
                            navigate(`/productdetail/${item.id}`);
                          }
                        }}
                      >
                        <div className="w-24 h-24 md:w-full md:h-1/2 relative flex-shrink-0 mr-4 md:mr-0">
                          <FiCheck
                            size={32}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (sellerActive) {
                                toggleItem(item.product_id);
                              }
                            }}
                            className={`${
                              isSelected(item.product_id)
                                ? "bg-[#507969] text-white"
                                : sellerActive
                                ? "bg-white text-gray-400 border hover:shadow-lg"
                                : "bg-gray-100 text-gray-300 border cursor-not-allowed"
                            } border-[#507969] rounded-full p-1 md:p-2 absolute transition duration-300 cursor-pointer z-20 top-2 right-2`}
                            title={sellerActive ? "Pilih produk" : "Pilih seller ini terlebih dahulu"}
                          />

                          <img
                            className="w-full h-full md:mt-2 md:aspect-[4/3] object-cover rounded-md"
                            src={item.image}
                            alt={item.name}
                          />
                        </div>

                        <div className="flex-1 md:h-full flex flex-col md:py-8 md:px-2 justify-between md:space-y-2">
                          <div className="space-y-1 md:space-y-2">
                            <p className="text-lg md:text-2xl font-medium line-clamp-2">
                              {item.name}
                            </p>
                            <p className="text-sm md:text-xs text-gray-600">
                              Jumlah: {item.quantity}
                            </p>
                            <p className="text-[#507969] font-semibold">
                              Rp {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout button per seller */}
                  {selectedSellerItems.length > 0 && sellerHasSelectedItems(sellerName) && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">
                          {selectedSellerItems.length} item dipilih
                        </span>
                        <span className="font-semibold text-[#507969]">
                          Total: Rp {selectedSellerItems.reduce((total, item) => 
                            total + (item.price * item.quantity), 0
                          ).toLocaleString()}
                        </span>
                      </div>
                      <button
                        className="text-sm bg-[#507969] hover:bg-[#2d5847] text-white px-6 py-2 rounded-xl w-full"
                        onClick={() => {
                          navigate("/checkout", {
                            state: { products: selectedSellerItems },
                          });
                        }}
                      >
                        Checkout ({selectedSellerItems.length} item)
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Global Selected Items Summary */}
            {selectedItems.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4 z-30">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-600">
                      {selectedItems.length} item dipilih dari seller: {activeSeller}
                    </span>
                    <div className="font-semibold text-[#507969]">
                      Total: Rp {cart
                        .filter(item => selectedItems.includes(item.product_id))
                        .reduce((total, item) => total + (item.price * item.quantity), 0)
                        .toLocaleString()}
                    </div>
                  </div>
                  <button
                    className="bg-[#507969] hover:bg-black text-white px-6 py-3 rounded-xl font-medium"
                    onClick={() => {
                      const allSelectedItems = cart.filter(item => 
                        selectedItems.includes(item.product_id)
                      );
                      navigate("/checkout", {
                        state: { products: allSelectedItems },
                      });
                    }}
                  >
                    Checkout Semua ({selectedItems.length})
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
};

export default Cart;