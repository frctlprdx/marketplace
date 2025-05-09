import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Simulasi user_id yang sedang aktif (bisa menggunakan context atau localStorage)
  const userId = "1"; // Ganti dengan logika untuk mendapatkan user_id yang aktif

  useEffect(() => {
    // Ambil wishlist berdasarkan user_id
    const fetchWishlist = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/wishlist?user_id=${userId}`);
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
