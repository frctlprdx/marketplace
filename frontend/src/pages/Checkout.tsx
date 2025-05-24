import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  FaTrash,
  FaPlus,
  FaMapMarkerAlt,
  FaBox,
  FaChevronRight,
  FaWeight,
  FaTruck,
} from "react-icons/fa";
import axios from "axios";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { product } = (location.state as { product?: any }) || {};

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [isLoadingDestination, setIsLoadingDestination] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    recipient_name: "",
    phone: "",
    province: "",
    city: "",
    district: "",
    subdistrict: "",
    zip_code: "",
    detail_address: "",
    is_default: false,
  });

  // Get user authentication from localStorage
  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("user_token");
  const role = localStorage.getItem("role");
  console.log(role)
  const isLoggedIn = !!(userId && token && role === "customer");

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowAddressDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch addresses only if user is logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setAddresses([]);
      setSelectedAddressId(null);
      return;
    }

    const fetchAddresses = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/addresses?user_id=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch addresses");
        const data = await res.json();
        setAddresses(data);
        if (data.length) setSelectedAddressId(data[0].id);
      } catch (error) {
        console.error("Error fetching addresses:", error);
        setAddresses([]);
      }
    };

    fetchAddresses();
  }, [isLoggedIn, userId, token]);

  // Delete address
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/addresses/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        if (selectedAddressId === id) setSelectedAddressId(null);
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Gagal menghapus alamat.");
    }
  };

  // Add new address
  const handleAddAddress = async () => {
    if (!isLoggedIn) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/addresses`,
        { ...newAddress, user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.status === 200 || res.status === 201) {
        const data = res.data;
        setAddresses((prev) => [...prev, data]);
        setSelectedAddressId(data.id);
        setNewAddress({
          label: "",
          recipient_name: "",
          phone: "",
          province: "",
          city: "",
          district: "",
          subdistrict: "",
          zip_code: "",
          detail_address: "",
          is_default: false,
        });
        setShowAddAddressModal(false);
        alert("Alamat berhasil ditambahkan.");
      }
    } catch (error) {
      console.error("Error adding address:", error);
      alert("Gagal menambahkan alamat.");
    }
  };

  // Search destination for shipping
  const searchDestination = async (district: string) => {
    try {
      setIsLoadingDestination(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/destination?search=${district}`
      );
      const result = await response.json();

      if (result.data && result.data.data && result.data.data.length > 0) {
        const firstDestination = result.data.data[0];
        const destinationId = firstDestination.id;

        console.log("Found destination ID:", destinationId);
        console.log("Full destination data:", firstDestination);

        return destinationId;
      } else {
        console.log("No destination found for district:", district);
        return null;
      }
    } catch (error) {
      console.error("Error searching destination:", error);
      alert("Gagal mencari destinasi pengiriman.");
      return null;
    } finally {
      setIsLoadingDestination(false);
    }
  };

  // Calculate shipping price
  const calculateShippingPrice = async (
    destinationId: string | number,
    weight: number
  ) => {
    try {
      setIsCalculatingShipping(true);

      // Fixed origin code
      const origin = "68246";

      // API call to count shipping price
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/countprice`,
        {
          origin: origin,
          destination: destinationId,
          weight: weight,
          courier: "jne:jnt", // Only getting JNE and JNT options
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Shipping price response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error calculating shipping price:", error);
      alert("Gagal menghitung ongkos kirim. Silakan coba lagi.");
      return null;
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  // Proceed to payment
  const handleProceedToPayment = async () => {
    if (!isLoggedIn) {
      alert("Login terlebih dahulu untuk melanjutkan pembayaran!");
      return;
    }

    if (!selectedAddress) {
      alert("Silakan pilih alamat pengiriman terlebih dahulu!");
      return;
    }

    if (!product) {
      alert("Produk tidak ditemukan.");
      return;
    }

    // First get destination ID
    const destinationId = await searchDestination(selectedAddress.district);

    if (!destinationId) {
      alert(
        "Tidak dapat menemukan kode area untuk kecamatan yang dipilih. Silakan pilih alamat lain."
      );
      return;
    }

    // Then calculate shipping price
    const shippingData = await calculateShippingPrice(
      destinationId,
      totalWeight
    );

    if (!shippingData) {
      return; // Error message already shown in calculateShippingPrice
    }

    // Navigate to payment page with all necessary data
    navigate("/payment", {
      state: {
        address: selectedAddress,
        product: product,
        destinationId: destinationId,
        shippingData: shippingData,
      },
    });
  };

  // Calculate subtotal and total weight
  const subtotal = product ? product.price * product.quantity : 0;
  const totalWeight = product
    ? product.totalweight || product.weight * product.quantity
    : 0;

  // Redirect if no product
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Data tidak ditemukan
          </h2>
          <p className="text-gray-600 mb-4">
            Produk yang akan di-checkout tidak ditemukan.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4 text-sm">
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full">
              1
            </span>
            <span className="text-orange-500 font-medium">
              Alamat Pengiriman
            </span>
            <FaChevronRight className="text-gray-400" />
            <span className="bg-gray-300 text-gray-600 px-3 py-1 rounded-full">
              2
            </span>
            <span className="text-gray-500">Pembayaran</span>
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
          {/* Left Column - Address Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <FaMapMarkerAlt className="text-orange-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Alamat Pengiriman
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowAddAddressModal(true)}
                    disabled={!isLoggedIn}
                    className={`flex items-center gap-2 font-medium transition ${
                      isLoggedIn
                        ? "text-orange-500 hover:text-orange-600"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                    title={!isLoggedIn ? "Login terlebih dahulu" : ""}
                  >
                    <FaPlus size={14} />
                    {isLoggedIn ? "Tambah Alamat" : "Login untuk Tambah Alamat"}
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {!isLoggedIn ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaMapMarkerAlt className="text-gray-400 text-2xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Login untuk melihat alamat
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Anda perlu login terlebih dahulu untuk mengakses alamat
                      pengiriman
                    </p>
                    <button
                      onClick={() => navigate("/")}
                      className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                    >
                      Login Menggunakan Akun Customer
                    </button>
                  </div>
                ) : addresses.length > 0 ? (
                  <>
                    {/* Selected Address Display */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              {selectedAddress?.label || "Alamat Utama"}
                            </span>
                            {selectedAddress?.is_default === 1 && (
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                                Default
                              </span>
                            )}
                          </div>

                          <p className="font-semibold text-gray-800 mb-1">
                            {selectedAddress?.recipient_name}
                          </p>
                          <p className="text-gray-600 text-sm mb-1">
                            {selectedAddress?.phone}
                          </p>
                          <p className="text-gray-700">
                            {selectedAddress?.detail_address}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {selectedAddress?.district}, {selectedAddress?.city}
                            , {selectedAddress?.province}{" "}
                            {selectedAddress?.zip_code}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowAddressDropdown(true)}
                          className="text-orange-500 hover:text-orange-600 font-medium text-sm ml-4"
                        >
                          Ubah Alamat
                        </button>
                      </div>
                    </div>
                    {/* Address Dropdown */}
                    {showAddressDropdown && (
                      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 md:p-0">
                        <div
                          ref={dropdownRef}
                          className="bg-white border rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
                        >
                          {/* Header */}
                          <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="font-semibold text-gray-800">
                              Pilih Alamat Lain
                            </h3>
                            <button
                              onClick={() => setShowAddressDropdown(false)}
                              className="text-gray-500 hover:text-gray-800 text-xl"
                            >
                              ×
                            </button>
                          </div>

                          {/* Address List */}
                          <div className="overflow-y-auto p-4 space-y-3 flex-1">
                            {addresses.map((address) => (
                              <div
                                key={address.id}
                                onClick={() => {
                                  setSelectedAddressId(address.id);
                                  setShowAddressDropdown(false);
                                }}
                                className={`cursor-pointer border rounded-lg p-4 transition-all ${
                                  selectedAddressId === address.id
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                      <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">
                                        {address.label || "Alamat"}
                                      </span>
                                      {address.is_default === 1 && (
                                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                                          Default
                                        </span>
                                      )}
                                    </div>

                                    <p className="font-semibold text-gray-800">
                                      {address.recipient_name}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                      {address.phone}
                                    </p>
                                    <p className="text-gray-700 text-sm">
                                      {address.detail_address}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                      {address.district}, {address.city},{" "}
                                      {address.province} {address.zip_code}
                                    </p>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(address.id);
                                    }}
                                    className="text-red-500 hover:text-red-700 p-2"
                                    title="Hapus alamat"
                                  >
                                    <FaTrash size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Footer with close button */}
                          <div className="p-4 border-t bg-gray-50 sticky bottom-0">
                            <button
                              onClick={() => setShowAddressDropdown(false)}
                              className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition"
                            >
                              Tutup
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaMapMarkerAlt className="text-gray-400 text-2xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Belum ada alamat pengiriman
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Tambahkan alamat pengiriman untuk melanjutkan checkout
                    </p>
                    <button
                      onClick={() => setShowAddAddressModal(true)}
                      className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                    >
                      <FaPlus className="inline mr-2" />
                      Tambah Alamat Pertama
                    </button>
                  </div>
                )}
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
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-lg object-cover border"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-orange-500 font-bold text-lg">
                      Rp {Number(product.price).toLocaleString("id-ID")}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Qty: {product.quantity}
                    </p>
                    <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                      <FaWeight size={12} />
                      <span>
                        {Number(totalWeight).toLocaleString("id-ID")} gram
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Berat Total</span>
                    <span>
                      {Number(totalWeight).toLocaleString("id-ID")} gram
                    </span>
                  </div>
                  <div className="flex items-center justify-center text-gray-600 py-2 px-5 text-sm border border-dashed border-gray-300 rounded bg-gray-50">
                    <FaTruck className="mr-2 text-orange-500" />
                    Ongkir akan dihitung di halaman pembayaran
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-orange-500">
                      Rp {subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleProceedToPayment}
                  disabled={
                    !selectedAddress ||
                    !isLoggedIn ||
                    isLoadingDestination ||
                    isCalculatingShipping
                  }
                  className={`w-full mt-6 py-4 rounded-lg font-semibold transition-all ${
                    selectedAddress &&
                    isLoggedIn &&
                    !isLoadingDestination &&
                    !isCalculatingShipping
                      ? "bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isLoadingDestination
                    ? "Mencari destinasi..."
                    : isCalculatingShipping
                    ? "Menghitung ongkir..."
                    : !isLoggedIn
                    ? "Login Terlebih Dahulu"
                    : selectedAddress
                    ? "Lanjut ke Pembayaran"
                    : "Pilih Alamat Terlebih Dahulu"}
                  {selectedAddress &&
                    isLoggedIn &&
                    !isLoadingDestination &&
                    !isCalculatingShipping && (
                      <FaChevronRight className="inline ml-2" />
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

      {/* Add Address Modal */}
      {showAddAddressModal && isLoggedIn && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  Tambah Alamat Baru
                </h3>
                <button
                  onClick={() => setShowAddAddressModal(false)}
                  className="text-gray-500 hover:text-gray-800 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label Alamat
                  </label>
                  <input
                    type="text"
                    placeholder="Rumah, Kantor, Kost, dll."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={newAddress.label}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, label: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Penerima *
                  </label>
                  <input
                    type="text"
                    placeholder="Nama lengkap penerima"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={newAddress.recipient_name}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        recipient_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Telepon *
                  </label>
                  <input
                    type="tel"
                    placeholder="08XXXXXXXXXX"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={newAddress.phone}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, phone: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provinsi *
                    </label>
                    <input
                      type="text"
                      placeholder="Provinsi"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={newAddress.province}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          province: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kota/Kabupaten *
                    </label>
                    <input
                      type="text"
                      placeholder="Kota/Kabupaten"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kecamatan *
                    </label>
                    <input
                      type="text"
                      placeholder="Kecamatan"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={newAddress.district}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          district: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kelurahan/Desa
                    </label>
                    <input
                      type="text"
                      placeholder="Kelurahan/Desa"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={newAddress.subdistrict}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          subdistrict: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Pos *
                  </label>
                  <input
                    type="text"
                    placeholder="12345"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={newAddress.zip_code}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, zip_code: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Lengkap *
                  </label>
                  <textarea
                    placeholder="Jalan, RT/RW, Patokan, No. Rumah, dll."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    rows={3}
                    value={newAddress.detail_address}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        detail_address: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="default-address"
                    checked={newAddress.is_default}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        is_default: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label
                    htmlFor="default-address"
                    className="text-sm text-gray-700"
                  >
                    Jadikan sebagai alamat utama
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 sticky bottom-0 z-10">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddAddressModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddAddress}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition"
                >
                  Simpan Alamat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
