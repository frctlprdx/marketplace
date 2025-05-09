import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
          setError(error instanceof Error ? error.message : "An unknown error occurred");
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
      <h1>Wishlist</h1>
      {wishlist.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        <ul>
          {wishlist.map((item) => (
            <li key={item.id}>{item.name}</li> // Ganti dengan data wishlist yang sesuai
          ))}
        </ul>
      )}
    </div>
  );
};

export default Wishlist;
