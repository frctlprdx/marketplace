import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaMapMarkerAlt,
  FaBox,
  FaChevronRight,
  FaTruck,
  FaClock,
  FaWeight,
} from "react-icons/fa";
import axios from "axios";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Ambil data dari location.state
  const {
    address,
    product,
    products,
    destinationId,
    shippingData,
    isCartCheckout,
  } = location.state || {};

  // Tentukan checkoutItems sesuai kondisi cart atau single product
  const checkoutItems = isCartCheckout ? products || [] : product ? [product] : [];

  const [selectedCourier, setSelectedCourier] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [midtransResponse, setMidtransResponse] = useState(null);

  // Auth data dari localStorage
  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("user_token");
  const isLoggedIn = !!(userId && token);

  // Redirect jika data kurang lengkap
  useEffect(() => {
    if (!address || !checkoutItems.length || !destinationId || !shippingData) {
      navigate("/checkout");
    }
  }, [address, checkoutItems, destinationId, shippingData, navigate]);

  if (!address || !checkoutItems.length || !destinationId || !shippingData) {
    return null;
  }

  // Hitung subtotal, berat total dan total item
  const subtotal = checkoutItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const totalWeight = checkoutItems.reduce((total, item) => {
    const itemWeight = item.weight || 0;
    return total + itemWeight * item.quantity;
  }, 0);

  const totalItems = checkoutItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const shippingCost = selectedCourier ? selectedCourier.cost : 0;
  const totalPrice = subtotal + shippingCost;

  const handleSelectCourier = (courier) => {
    setSelectedCourier(courier);
  };

  // Mendapatkan Snap Token Midtrans
  const getSnapToken = async () => {
    if (!userId || !address || !selectedCourier || !checkoutItems.length) {
      console.error("Data tidak lengkap untuk membuat transaksi");
      return null;
    }

    try {
      if (isCartCheckout) {
        const transactionData = {
          userID: parseInt(userId),
          totalPrice: totalPrice,
          recipient_name: address.recipient_name,
          phone: address.phone,
          frontend_url: window.location.origin,
          courier: selectedCourier.name,
          destination_id: address.id,
          products: checkoutItems.map((item) => ({
            product_id: item.product_id ? item.product_id : item.id,
            seller_id: item.user_id || 0,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          })),
          isCartCheckout: true,
        };

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/snaptoken`,
          transactionData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Midtrans Response (Cart):", response.data);
        setMidtransResponse(response.data);
        return response.data.token;
      } else {
        const singleProduct = checkoutItems[0];
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/snaptoken`,
          {
            userID: parseInt(userId),
            totalPrice: totalPrice,
            recipient_name: address.recipient_name,
            phone: address.phone,
            frontend_url: window.location.origin,
            seller_id: singleProduct.user_id || singleProduct.id,
            product_id: singleProduct.id,
            quantity: singleProduct.quantity,
            subtotal: subtotal,
            courier: selectedCourier.name,
            destination_id: address.id,
            isCartCheckout: false,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Midtrans Response (Single):", response.data);
        setMidtransResponse(response.data);
        return response.data.token;
      }
    } catch (error) {
      console.error("Error getting snap token:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      return null;
    }
  };

  // Fungsi tombol bayar
  const handlePlaceOrder = async () => {
    if (!selectedCourier || !isLoggedIn) {
      return;
    }

    setIsLoading(true);

    try {
      const snapToken = await getSnapToken();

      if (!snapToken) {
        setIsLoading(false);
        return;
      }

      // @ts-ignore
      if (window.snap) {
        // @ts-ignore
        window.snap.pay(snapToken, {
          onSuccess: function (result) {
            console.log("Payment Success:", result);
            window.location.href = "/thanks";
          },
          onPending: function (result) {
            console.log("Payment Pending:", result);
            window.location.href = "/";
          },
          onError: function (result) {
            console.log("Payment Error:", result);
            window.location.href = "/payment-failed";
          },
          onClose: function () {
            console.log("Payment popup closed");
          },
        });
      } else {
        console.error("Midtrans tidak tersedia. Silakan refresh halaman.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Midtrans Snap JS
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      import.meta.env.VITE_MIDTRANS_CLIENT_KEY || ""
    );
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Kembali
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Pembayaran</h1>
            <span className="text-sm text-gray-600">
              ({checkoutItems.length} produk)
            </span>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4 text-sm">
            <span className="bg-green-500 text-white px-3 py-1 rounded-full">
              ✓
            </span>
            <span className="text-green-500 font-medium">
              Alamat Pengiriman
            </span>
            <FaChevronRight className="text-gray-400" />
            <span className="bg-[#507969] text-white px-3 py-1 rounded-full">
              2
            </span>
            <span className="text-primary">Pembayaran</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Address Section */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
              <div className="p-6 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FaMapMarkerAlt className="text-green-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Alamat Pengiriman
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                      {address?.label || "Alamat Utama"}
                    </span>
                    {address?.is_default === 1 && (
                      <span className="bg-[#507969] text-white text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-800 mb-1">
                    {address?.recipient_name}
                  </p>
                  <p className="text-gray-600 text-sm mb-1">{address?.phone}</p>
                  <p className="text-gray-700">{address?.detail_address}</p>
                  <p className="text-gray-600 text-sm">
                    {address?.district}, {address?.city}, {address?.province}{" "}
                    {address?.zip_code}
                  </p>
                </div>
              </div>
            </div>

            {/* Courier Selection */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
              <div className="p-6 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="bg-soft p-2 rounded-lg">
                    <FaTruck className="text-[#507969]" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Pilih Kurir
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {shippingData?.data?.data?.map((courier) => (
                    <div
                      key={`${courier.code}-${courier.service}`}
                      onClick={() => handleSelectCourier(courier)}
                      className={`cursor-pointer border rounded-lg p-4 transition-all hover:border-blue-300 ${
                        selectedCourier &&
                        selectedCourier.code === courier.code &&
                        selectedCourier.service === courier.service
                          ? "border-[#507969] bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">
                              {courier.name}
                            </span>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              {courier.service}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {courier.description}
                          </p>
                          {courier.etd && (
                            <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                              <FaClock size={14} />
                              <span>Estimasi tiba: {courier.etd}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">
                            Rp {Number(courier.cost).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden sticky top-6">
              {/* Header */}
              <div className="p-6 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="bg-soft p-2 rounded-lg">
                    <FaBox className="text-[#507969]" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Ringkasan Pesanan
                  </h2>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-6">
                {/* Product List */}
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                  {checkoutItems.map((item, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">
                          {item.name}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Qty: {item.quantity}</span>
                          <span className="text-primary font-semibold">
                            Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                          </span>
                        </div>
                        {item.weight && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <FaWeight size={10} />
                            <span>
                              {(item.weight * item.quantity).toLocaleString("id-ID")}g
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalItems} item)</span>
                    <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Berat Total</span>
                    <span>{Number(totalWeight).toLocaleString("id-ID")} gram</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Ongkos Kirim</span>
                    <span>
                      {selectedCourier
                        ? `Rp ${Number(selectedCourier.cost).toLocaleString("id-ID")}`
                        : "Pilih kurir"}
                    </span>
                  </div>

                  {selectedCourier && (
                    <div className="flex justify-between text-gray-600 text-sm border-t pt-2">
                      <span>{selectedCourier.name}</span>
                      <span>{selectedCourier.service}</span>
                    </div>
                  )}

                  <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">
                      Rp {totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isLoading || !selectedCourier || !isLoggedIn}
                  className={`w-full py-3 rounded-lg text-white font-semibold mt-4 transition-all ${
                    !selectedCourier || !isLoggedIn
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-[#507969] hover:bg-[#2d5847] shadow-md hover:shadow-lg"
                  }`}
                >
                  {isLoading ? "Memproses..." : "Bayar Sekarang"}
                </button>

                <p className="text-center text-gray-500 text-xs mt-3">
                  Dengan membuat pesanan, Anda menyetujui syarat dan ketentuan kami
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
