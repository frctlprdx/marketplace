import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const location = useLocation();

  // Ambil user_id dari query string
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("user_id");

  useEffect(() => {
    if (userId) {
      // Lakukan fetch wishlist berdasarkan user_id yang didapatkan
      const fetchWishlist = async () => {
        const userId = localStorage.getItem("user_id");
        const userToken = localStorage.getItem("user_token");

        // Cek apakah userToken ada
        console.log("User Token:", userToken); // Cek apakah token ada
        if (!userToken) {
          console.log("Token tidak ditemukan");
          return; // Hentikan eksekusi jika token tidak ada
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

          console.log("Response Status:", response.status); // Cek status dari server

          if (!response.ok) {
            const errorDetails = await response.text();
            console.log("Error Details:", errorDetails); // Cek error yang dikirim oleh server
            throw new Error("Failed to fetch wishlist");
          }

          const data = await response.json();
          console.log("Data from API:", data); // Cek data yang diterima dari API
          setWishlist(data);
        } catch (error) {
          if (error instanceof Error) {
            console.log("Error:", error.message); // Cek error yang terjadi
          } else {
            console.log("Error:", error); // Handle unknown error type
          }
          setError(
            error instanceof Error ? error.message : "An unknown error occurred"
          );
        } finally {
          setLoading(false);
        }
      };

      fetchWishlist();
    }
  }, [userId]);

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
          <span>{">"}</span>
          <a href="/wishlist" className="hover:underline cursor-pointer">
            Wishlist
          </a>
        </div>
      </div>
      <div>
        {wishlist.length === 0 ? (
          <p>Your wishlist is empty.</p>
        ) : (
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-xl font-semibold mb-4">
              Wishlist milik {wishlist[0].user_name}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg hover:shadow-2xl p-4 flex flex-col h-120 group hover:border"
                  onClick={() => navigate(`/productdetail/${item.id}`)}
                >
                  <div className="w-full h-1/2">
                    <IoIosHeart
                      size={40}
                      className="text-orange-500 bg-white hover:shadow-lg m-2 rounded-full p-3 absolute opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer"
                    />
                    <img
                      className="w-full h-full object-cover rounded-md"
                      src={item.image}
                      alt={item.name}
                    />
                  </div>
                  <div className="py-3 space-y-4 ">
                    <p className="">{item.name}</p>
                    <p className="text-orange-500">Rp {item.price}</p>
                    <p className="text-sm"> Stocks: {item.stocks}</p>
                    <p className="text-xs">Posted at {item.created_at}</p>
                  </div>
                  <button className="mt-auto rounded-xl border-2 px-4 py-2 border-black hover:bg-black hover:text-white opacity-0 group-hover:opacity-100 transition duration-300">
                    Add To Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
