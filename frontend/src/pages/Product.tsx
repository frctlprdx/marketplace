import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import axios from "axios";

const Product = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("user_token");

  useEffect(() => {
    // Fetch produk
    axios
      .get(`${import.meta.env.VITE_API_URL}/products`)
      .then((res) => setProducts(res.data))
      .catch(console.error);

    // Fetch wishlist user
    if (userId && token) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/wishlist?user_id=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const ids = res.data.map((item: any) => item.product_id);
          setWishlistIds(ids);
        })
        .catch(console.error);
    }
  }, []);

  const handleWishlist = (productId: number) => {
    if (!userId || !token) return;

    const isInWishlist = wishlistIds.includes(productId);

    if (isInWishlist) {
      // Hapus dari wishlist
      axios
        .delete(`${import.meta.env.VITE_API_URL}/wishlist`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            user_id: userId,
            product_id: productId,
          },
        })
        .then(() => {
          setWishlistIds((prev) => prev.filter((id) => id !== productId));
        })
        .catch(console.error);
    } else {
      // Tambahkan ke wishlist
      axios
        .post(
          `${import.meta.env.VITE_API_URL}/wishlist`,
          {
            user_id: userId,
            product_id: productId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then(() => {
          setWishlistIds((prev) => [...prev, productId]);
        })
        .catch(console.error);
    }
  };

  return (
    <div>
      <div className="max-w-7xl h-16 mx-auto px-4">
        <div className="max-w-7xl h-16 mx-auto flex items-center text-sm text-gray-600 space-x-2">
          <a href="/" className="hover:underline cursor-pointer">
            Home
          </a>
          <span>{">"}</span>
          <a href="/product" className="hover:underline cursor-pointer">
            Products
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
          {/* Left Filter - 2/7 */}
          <aside className="lg:col-span-2 bg-white rounded-xl shadow p-4 h-fit sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Filter Produk</h2>
            {/* Tambahkan filter kategori, harga, rating, dll */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm text-gray-600">Kategori</label>
                <select className="w-full mt-1 border rounded p-2">
                  <option>Semua</option>
                  <option>Elektronik</option>
                  <option>Pakaian</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600">
                  Harga Maksimal
                </label>
                <input
                  type="number"
                  className="w-full mt-1 border rounded p-2"
                />
              </div>
            </div>
          </aside>

          {/* Right Product Grid - 5/7 */}
          <section className="lg:col-span-5">
            <h2 className="text-xl font-bold mb-6">Daftar Produk</h2>
            {products.length === 0 ? (
              <p className="text-gray-500">Produk tidak ditemukan...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 cursor-pointer">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="relative group border rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col group"
                  >
                    {/* Heart button muncul saat hover */}
                    <button
                      className="absolute m-2 text-orange-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Wishlist clicked", product.id);
                        handleWishlist(product.id);
                      }}
                    >
                      {wishlistIds.includes(product.id) ? (
                        <IoIosHeart
                          size={40}
                          className="bg-white hover:shadow-xl rounded-full p-3 opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer"
                        />
                      ) : (
                        <IoIosHeartEmpty
                          size={40}
                          className="bg-white hover:shadow-xl rounded-full p-3 opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer"
                        />
                      )}
                    </button>

                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-48 w-full object-cover rounded mb-4"
                      onClick={() => navigate(`/productdetail/${product.id}`)}
                    />
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-orange-600 font-bold mt-2">
                      Rp {product.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Stok: {product.stocks}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Product;
