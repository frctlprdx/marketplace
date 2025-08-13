import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaMapMarkerAlt,
  FaBox,
  FaChevronRight,
  FaTruck,
  FaClock,
  FaWeight,
  FaArrowLeft,
  FaCheck,
} from "react-icons/fa";
import axios from "axios";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    address,
    product,
    products,
    destinationId,
    shippingData,
    isCartCheckout,
  } = location.state || {};

  const checkoutItems = isCartCheckout
    ? products || []
    : product
    ? [product]
    : [];
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("user_token");
  const isLoggedIn = !!(userId && token);

  useEffect(() => {
    if (!address || !checkoutItems.length || !destinationId || !shippingData) {
      navigate("/checkout");
    }
  }, [address, checkoutItems, destinationId, shippingData, navigate]);

  if (!address || !checkoutItems.length || !destinationId || !shippingData) {
    return null;
  }

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

  const getSnapToken = async () => {
    if (!userId || !address || !selectedCourier || !checkoutItems.length) {
      console.error("Data tidak lengkap untuk membuat transaksi");
      return null;
    }

    try {
      // Prepare item details for Midtrans
      const itemDetails = [
        // Add products
        ...checkoutItems.map((item) => ({
          id: `product_${item.product_id || item.id}`,
          price: item.price,
          quantity: item.quantity,
          name: item.name,
          category: item.category || "Product",
          merchant_name: item.seller_name || "Go-Smile Marketplace",
        })),
        // Add shipping cost as separate item
        {
          id: "shipping_cost",
          price: selectedCourier.cost,
          quantity: 1,
          name: `Ongkir ${selectedCourier.name} (${selectedCourier.service})`,
          category: "Shipping",
        },
      ];

      const transactionData = {
        userID: parseInt(userId),
        totalPrice: totalPrice,
        recipient_name: address.recipient_name,
        phone: address.phone,
        frontend_url: window.location.origin,
        courier: selectedCourier.name,
        destination_id: address.id,
        isCartCheckout: isCartCheckout,
        // Add item details for Midtrans
        item_details: itemDetails,
        customer_details: {
          first_name: address.recipient_name,
          phone: address.phone,
          shipping_address: {
            first_name: address.recipient_name,
            phone: address.phone,
            address: address.detail_address,
            city: address.city,
            postal_code: address.postal_code || "",
            country_code: "IDN",
          },
        },
        // Add products data for later processing (not stored in DB yet)
        products_data: isCartCheckout
          ? checkoutItems.map((item) => ({
              product_id: item.product_id ? item.product_id : item.id,
              seller_id: item.user_id || 0,
              quantity: item.quantity,
              subtotal: item.price * item.quantity,
            }))
          : [
              {
                product_id: checkoutItems[0].id,
                seller_id: checkoutItems[0].user_id || checkoutItems[0].id,
                quantity: checkoutItems[0].quantity,
                subtotal: subtotal,
              },
            ],
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

      console.log("Midtrans Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error getting snap token:", error);
      return null;
    }
  };

  const processSuccessfulPayment = async (orderId, paymentResult) => {
    try {
      console.log("Processing successful payment...");
      console.log("Order ID:", orderId);
      console.log("Checkout Items:", checkoutItems);
      console.log("Is Cart Checkout:", isCartCheckout);

      const processData = {
        order_id: orderId,
        payment_result: paymentResult,
        user_id: parseInt(userId),
        total_price: totalPrice,
        recipient_name: address.recipient_name,
        phone: address.phone,
        courier: selectedCourier.name,
        destination_id: address.id,
        is_cart_checkout: isCartCheckout,
        products: isCartCheckout
          ? checkoutItems.map((item) => ({
              product_id: item.product_id ? item.product_id : item.id,
              seller_id: item.user_id || 0,
              quantity: item.quantity,
              subtotal: item.price * item.quantity,
            }))
          : [
              {
                product_id: checkoutItems[0].id,
                seller_id: checkoutItems[0].user_id || checkoutItems[0].id,
                quantity: checkoutItems[0].quantity,
                subtotal: subtotal,
              },
            ],
      };

      console.log("Process data being sent:", processData);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/transaction/process-payment`,
        processData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Payment processed successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error processing payment:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      throw error;
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedCourier || !isLoggedIn) return;

    setIsLoading(true);

    try {
      const snapResponse = await getSnapToken();

      if (!snapResponse || !snapResponse.token) {
        setIsLoading(false);
        return;
      }

      const { token: snapToken, order_id } = snapResponse;

      if (window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: async function (result) {
            console.log("Payment Success:", result);

            try {
              // Process payment and create transaction in database
              console.log("Calling processSuccessfulPayment...");
              const processResult = await processSuccessfulPayment(
                order_id,
                result
              );
              console.log("Process result:", processResult);

              // Force redirect to success page - gunakan window.location.replace untuk mencegah back button
              window.location.replace(
                "https://marketplace-xi-puce.vercel.app/thanks"
              );
            } catch (error) {
              console.error("Error in onSuccess:", error);
              // Show error message but don't redirect to thanks page
              alert(
                "Terjadi kesalahan saat memproses pembayaran. Silakan hubungi customer service."
              );
            }
          },
          onPending: function (result) {
            console.log("Payment Pending:", result);
            window.location.href = "https://marketplace-xi-puce.vercel.app/";
          },
          onError: function (result) {
            console.log("Payment Error:", result);
            window.location.href =
              "https://marketplace-xi-puce.vercel.app/error";
          },
          onClose: function () {
            console.log("Payment popup closed");
            setIsLoading(false);
          },
        });
      } else {
        console.error("Midtrans tidak tersedia. Silakan refresh halaman.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setIsLoading(false);
    }
  };

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
      {/* Compact Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaArrowLeft size={16} />
              </button>
              <h1 className="text-xl font-bold text-gray-800">Pembayaran</h1>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {checkoutItems.length} item
              </span>
            </div>

            {/* Mini Progress */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-green-600">
                <FaCheck
                  size={12}
                  className="bg-green-500 text-white rounded-full p-1"
                />
                <span>Alamat</span>
              </div>
              <FaChevronRight className="text-gray-300" size={10} />
              <div className="flex items-center gap-1 text-green-600 font-medium">
                <div className="w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                  2
                </div>
                <span>Bayar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Address & Shipping */}
          <div className="space-y-4">
            {/* Compact Address */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center gap-2 mb-3">
                <FaMapMarkerAlt className="text-green-500" size={16} />
                <h3 className="font-semibold text-gray-800">
                  Alamat Pengiriman
                </h3>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex gap-2 mb-1">
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                    {address?.label || "Utama"}
                  </span>
                  {address?.is_default === 1 && (
                    <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="font-medium text-gray-800 text-sm">
                  {address?.recipient_name}
                </p>
                <p className="text-xs text-gray-600 mb-1">{address?.phone}</p>
                <p className="text-sm text-gray-700">
                  {address?.detail_address}
                </p>
                <p className="text-xs text-gray-600">
                  {address?.district}, {address?.city}, {address?.province}
                </p>
              </div>
            </div>

            {/* Compact Shipping */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center gap-2 mb-3">
                <FaTruck className="text-green-500" size={16} />
                <h3 className="font-semibold text-gray-800">Pilih Kurir</h3>
              </div>
              <div className="space-y-2">
                {shippingData?.data?.data?.map((courier) => (
                  <div
                    key={`${courier.code}-${courier.service}`}
                    onClick={() => setSelectedCourier(courier)}
                    className={`cursor-pointer border rounded-lg p-3 transition-all ${
                      selectedCourier &&
                      selectedCourier.code === courier.code &&
                      selectedCourier.service === courier.service
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-800">
                            {courier.name}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {courier.service}
                          </span>
                        </div>
                        {courier.etd && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <FaClock size={10} />
                            <span>{courier.etd}</span>
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-green-600 text-sm">
                        Rp {Number(courier.cost).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                  <FaBox className="text-green-500" size={16} />
                  <h3 className="font-semibold text-gray-800">
                    Ringkasan Pesanan
                  </h3>
                </div>
              </div>

              <div className="p-4">
                {/* Compact Product List */}
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {checkoutItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-2 bg-gray-50 rounded"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 text-xs line-clamp-2 mb-1">
                          {item.name}
                        </h4>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-gray-600">
                            <span>×{item.quantity}</span>
                            {item.weight && (
                              <div className="flex items-center gap-1">
                                <FaWeight size={8} />
                                <span>{item.weight * item.quantity}g</span>
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-green-600">
                            Rp{" "}
                            {(item.price * item.quantity).toLocaleString(
                              "id-ID"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Summary */}
                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalItems} item)</span>
                    <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Berat Total</span>
                    <span>
                      {Number(totalWeight).toLocaleString("id-ID")} gram
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Ongkir</span>
                    <span>
                      {selectedCourier
                        ? `Rp ${Number(selectedCourier.cost).toLocaleString(
                            "id-ID"
                          )}`
                        : "Pilih kurir"}
                    </span>
                  </div>
                  {selectedCourier && (
                    <div className="flex justify-between text-xs text-gray-500 pb-2">
                      <span>{selectedCourier.name}</span>
                      <span>{selectedCourier.service}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">
                      Rp {totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isLoading || !selectedCourier || !isLoggedIn}
                  className={`w-full py-3 rounded-lg text-white font-semibold mt-4 transition-all ${
                    !selectedCourier || !isLoggedIn
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    "Bayar Sekarang"
                  )}
                </button>

                <p className="text-center text-gray-500 text-xs mt-3">
                  Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
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
