import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaMapMarkerAlt,
  FaBox,
  FaChevronRight,
  FaTruck,
  FaClock,
} from "react-icons/fa";
import axios from "axios";

type Courier = {
  code: string;
  service: string;
  cost: number;
  name: string;
  description?: string;
  etd?: string;
};

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get the data passed from Checkout page
  const { address, product, destinationId, shippingData } =
    location.state || {};

  // States
  const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [snapToken, setSnapToken] = useState("");
  const [midtransResponse, setMidtransResponse] = useState<any>(null);

  // Get user authentication from localStorage
  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("user_token");
  const isLoggedIn = !!(userId && token);

  // Check for URL parameters (redirect from Midtrans)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const status =
      urlParams.get("status_code") || urlParams.get("transaction_status");
    const orderId = urlParams.get("order_id");

    // Handle Midtrans redirect
    if (status && orderId) {
      console.log("Midtrans redirect detected:", { status, orderId });

      if (status === "200" || status === "settlement" || status === "pending") {
        setOrderSuccess(true);
        setOrderNumber(orderId);
      } else {
        setOrderError(`Payment failed with status: ${status}`);
      }

      // Clean URL parameters after processing
      navigate("/payment", {
        replace: true,
        state: location.state,
      });
    }
  }, [location.search, navigate, location.state]);

  // Verify that we have all required data
  useEffect(() => {
    if (!address || !product || !destinationId || !shippingData) {
      // Only navigate away if not coming from Midtrans redirect
      const urlParams = new URLSearchParams(location.search);
      const hasPaymentParams =
        urlParams.get("order_id") || urlParams.get("transaction_status");

      if (!hasPaymentParams) {
        navigate("/checkout");
      }
    }
  }, [
    address,
    product,
    destinationId,
    shippingData,
    navigate,
    location.search,
  ]);

  // Return null if no data and no payment redirect
  const urlParams = new URLSearchParams(location.search);
  const hasPaymentParams =
    urlParams.get("order_id") || urlParams.get("transaction_status");

  if (!address || !product || !destinationId || !shippingData) {
    if (!hasPaymentParams) {
      return null;
    }
  }

  // Calculate total price
  const subtotal = product ? product.price * product.quantity : 0;
  const shippingCost = selectedCourier ? selectedCourier.cost : 0;
  const totalPrice = subtotal + shippingCost;

  // Handle courier selection
  const handleSelectCourier = (courier: Courier) => {
    setSelectedCourier(courier);
  };

  // Get Snap Token from Midtrans
  const getSnapToken = async () => {
    if (!userId || !address) {
      setOrderError("Data user atau alamat tidak lengkap");
      return null;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/snaptoken`,
        {
          userID: parseInt(userId),
          totalPrice: totalPrice,
          recipient_name: address.recipient_name,
          phone: address.phone,
          // Add frontend URL for redirects
          frontend_url: window.location.origin,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Midtrans Response:", response.data);
      setMidtransResponse(response.data);

      if (response.data.order_id) {
        setOrderNumber(response.data.order_id);
      }

      return response.data.token;
    } catch (error: any) {
      console.error("Error getting snap token:", error);

      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }

      setOrderError(
        error.response?.data?.message || "Gagal mendapatkan token pembayaran"
      );
      return null;
    }
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!selectedCourier || !isLoggedIn) {
      return;
    }

    setIsLoading(true);
    setOrderError("");

    try {
      const snapToken = await getSnapToken();

      if (!snapToken) {
        setIsLoading(false);
        return;
      }

      setSnapToken(snapToken);

      // Load Midtrans Snap
      // @ts-ignore
      if (window.snap) {
        // @ts-ignore
        window.snap.pay(snapToken, {
          onSuccess: function (result: any) {
            console.log("Payment Success:", result);
            setOrderSuccess(true);
            setOrderNumber(
              result.order_id || orderNumber || "INV-" + Date.now()
            );
          },
          onPending: function (result: any) {
            console.log("Payment Pending:", result);
            setOrderSuccess(true);
            setOrderNumber(
              result.order_id || orderNumber || "INV-" + Date.now()
            );
          },
          onError: function (result: any) {
            console.log("Payment Error:", result);
            setOrderError(
              "Pembayaran gagal: " + (result.status_message || "Unknown error")
            );
          },
          onClose: function () {
            console.log("Payment popup closed");
          },
        });
      } else {
        setOrderError("Midtrans tidak tersedia. Silakan refresh halaman.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setOrderError("Gagal membuat pesanan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load Midtrans Snap script
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

  // Check if the data is loaded correctly (handle redirect case)
  if (
    (!address || !product || !destinationId || !shippingData) &&
    !hasPaymentParams
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Data tidak ditemukan
          </h2>
          <p className="text-gray-600 mb-4">
            Informasi pembayaran tidak ditemukan. Silakan kembali ke halaman
            checkout.
          </p>
          <button
            onClick={() => navigate("/checkout")}
            className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition"
          >
            Kembali ke Checkout
          </button>
        </div>
      </div>
    );
  }

  // Success order screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Pesanan Berhasil!
          </h2>
          <p className="text-gray-600 mb-6">
            Pesanan Anda dengan nomor <strong>{orderNumber}</strong> telah
            berhasil dibuat dan sedang diproses.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Total Pembayaran:</strong> Rp{" "}
              {totalPrice.toLocaleString("id-ID")}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Status:</strong>{" "}
              <span className="text-yellow-500 font-medium">
                Menunggu Pembayaran
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() =>
                navigate("/payment-instruction", { state: { orderNumber } })
              }
              className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition font-medium"
            >
              Lihat Instruksi Pembayaran
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition font-medium"
            >
              Lihat Pesanan Saya
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-200 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Rest of your component remains the same...
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
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full">
              2
            </span>
            <span className="text-orange-500">Pembayaran</span>
            <FaChevronRight className="text-gray-400" />
            <span className="bg-gray-300 text-gray-600 px-3 py-1 rounded-full">
              3
            </span>
            <span className="text-gray-500">Konfirmasi</span>
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
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
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
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FaTruck className="text-blue-500" />
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
                          ? "border-blue-500 bg-blue-50"
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
                          <p className="font-semibold text-orange-500">
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
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FaBox className="text-blue-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Ringkasan Pesanan
                  </h2>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-6">
                <div className="flex gap-4 mb-6">
                  <img
                    src={product?.image}
                    alt={product?.name}
                    className="w-20 h-20 rounded-lg object-cover border"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {product?.name}
                    </h3>
                    <p className="text-orange-500 font-bold text-lg">
                      Rp {Number(product?.price || 0).toLocaleString("id-ID")}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Qty: {product?.quantity}
                    </p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Ongkos Kirim</span>
                    <span>
                      {selectedCourier
                        ? `Rp ${Number(selectedCourier.cost).toLocaleString(
                            "id-ID"
                          )}`
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
                    <span className="text-orange-500">
                      Rp {totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isLoading || !selectedCourier || !isLoggedIn}
                  className={`w-full py-3 rounded-lg text-white font-semibold mt-4 ${
                    !selectedCourier || !isLoggedIn
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                >
                  {isLoading ? "Memproses..." : "Bayar Sekarang"}
                </button>

                {orderError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {orderError}
                  </div>
                )}

                <p className="text-center text-gray-500 text-xs mt-3">
                  Dengan membuat pesanan, Anda menyetujui syarat dan ketentuan
                  kami
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
  