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
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/wishlist?user_id=${userId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch wishlist");
          }
          const data = await response.json();
          setWishlist(data);
        } catch (error: any) {
          setError(error.message);
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
