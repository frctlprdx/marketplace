import { useEffect, useState } from "react";

const Cart = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

        console.log("Response Status:", response.status);

        if (!response.ok) {
          const errorDetails = await response.text();
          console.log("Error Details:", errorDetails);
          throw new Error("Failed to fetch cart");
        }

        const data = await response.json();
        console.log("Data from API:", data);
        setCart(data);
      } catch (error) {
        if (error instanceof Error) {
          console.log("Error:", error.message);
          setError(error.message);
        } else {
          console.log("Error:", error);
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h1>Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul>
          {cart.map((item) => (
            <li key={item.id}>{item.name}</li> // Ganti sesuai struktur datamu
          ))}
        </ul>
      )}
    </div>
  );
};

export default Cart;
