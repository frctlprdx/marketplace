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
  FaEdit,
  FaTimes,
  FaCheck,
  FaChevronDown,
} from "react-icons/fa";
import axios from "axios";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Extract data from location state - support both single product and multiple products
  const { product, products } = location.state || {};

  // Normalize data untuk memastikan struktur yang konsisten
  const normalizeCheckoutItems = () => {
    console.log("Debug - Raw data:", { product, products }); // Untuk debugging

    if (products && Array.isArray(products)) {
      // Dari cart checkout
      console.log("Processing cart checkout with", products.length, "items");
      return products.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        weight: item.weight,
        user_id: item.user_id,
        seller_name: item.seller_name,
        seller_profile: item.seller_profile,
      }));
    } else if (product) {
      // Dari product detail - "Beli Sekarang"
      console.log("Processing direct purchase:", product);
      return [
        {
          id: product.id,
          product_id: product.id, // Gunakan id sebagai product_id untuk direct purchase
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: product.quantity,
          weight: product.weight,
          user_id: product.user_id || parseInt(userId || "0"),
          seller_name: product.seller_name || "Direct Purchase",
          seller_profile: product.seller_profile || "",
        },
      ];
    }

    console.log("No valid data found");
    return [];
  };

  // Get normalized checkout items
  const checkoutItems = normalizeCheckoutItems();
  const isCartCheckout = !!products;

  // State declarations
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isLoadingDestination, setIsLoadingDestination] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
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
  const isLoggedIn = !!(userId && token && role === "customer");

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  // Calculate totals
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

  // Debug logging
  useEffect(() => {
    console.log("Checkout Debug Info:");
    console.log("Original product:", product);
    console.log("Original products:", products);
    console.log("Normalized checkoutItems:", checkoutItems);
    console.log("isCartCheckout:", isCartCheckout);
  }, [product, products, checkoutItems, isCartCheckout]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
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

    fetchAddresses();
  }, [isLoggedIn, userId, token]);

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

      // Set default address or first address as selected
      const defaultAddress = data.find((addr) => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (data.length > 0) {
        setSelectedAddressId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setAddresses([]);
    }
  };

  // Delete address
  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus alamat ini?")) {
      return;
    }

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
        if (selectedAddressId === id) {
          // Select first remaining address if available
          const remainingAddresses = addresses.filter((a) => a.id !== id);
          setSelectedAddressId(
            remainingAddresses.length > 0 ? remainingAddresses[0].id : null
          );
        }
        alert("Alamat berhasil dihapus.");
      } else {
        throw new Error("Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Gagal menghapus alamat.");
    }
  };

  // Add new address
  const handleAddAddress = async () => {
    if (!isLoggedIn) return;

    // Validation
    if (
      !newAddress.recipient_name ||
      !newAddress.phone ||
      !newAddress.province ||
      !newAddress.city ||
      !newAddress.district ||
      !newAddress.subdistrict ||
      !newAddress.zip_code ||
      !newAddress.detail_address
    ) {
      alert("Mohon lengkapi semua field yang wajib diisi.");
      return;
    }

    setIsSubmittingAddress(true);

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

        // Reset form
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
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  // Edit address
  const handleEditAddress = (address) => {
    setEditingAddress({ ...address });
    setShowEditAddressModal(true);
  };

  // Update address
  const handleUpdateAddress = async () => {
    if (!editingAddress) return;

    // Validation
    if (
      !editingAddress.recipient_name ||
      !editingAddress.phone ||
      !editingAddress.province ||
      !editingAddress.city ||
      !editingAddress.district ||
      !editingAddress.subdistrict ||
      !editingAddress.zip_code ||
      !editingAddress.detail_address
    ) {
      alert("Mohon lengkapi semua field yang wajib diisi.");
      return;
    }

    setIsSubmittingAddress(true);

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/addresses/${editingAddress.id}`,
        editingAddress,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        const updatedAddress = res.data;
        setAddresses((prev) =>
          prev.map((addr) =>
            addr.id === updatedAddress.id ? updatedAddress : addr
          )
        );

        setShowEditAddressModal(false);
        setEditingAddress(null);
        alert("Alamat berhasil diperbarui.");
      }
    } catch (error) {
      console.error("Error updating address:", error);
      alert("Gagal memperbarui alamat.");
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  // Search destination for shipping
  const searchDestination = async (district) => {
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
  const calculateShippingPrice = async (destinationId, weight) => {
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

    if (!checkoutItems || checkoutItems.length === 0) {
      alert("Tidak ada produk untuk di-checkout.");
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

    // Navigate to payment page with normalized data
    navigate("/payment", {
      state: {
        address: selectedAddress,
        products: checkoutItems, // Always send normalized data as products array
        destinationId: destinationId,
        shippingData: shippingData,
        isCartCheckout: isCartCheckout,
      },
    });
  };

  // Redirect if no product
  if (!checkoutItems || checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Data tidak ditemukan
          </h2>
          <p className="text-gray-600 mb-4">
            {!product && !products
              ? "Tidak ada data produk yang ditemukan. Pastikan Anda mengakses halaman ini dari tombol 'Beli Sekarang' atau 'Checkout'."
              : "Produk yang akan di-checkout tidak dapat diproses."}
          </p>
          <div className="text-xs text-gray-400 mb-4">
            Debug: product={!!product}, products={!!products && products.length}
            , items={checkoutItems.length}
          </div>
          <button
            onClick={() => navigate("/")}
            className="bg-[#507969] text-white px-6 py-2 rounded hover:bg-[#2d5847] transition mr-2"
          >
            Kembali ke Beranda
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        {/* Address Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <FaMapMarkerAlt className="text-[#507969] mr-2" />
            <h2 className="text-lg font-semibold">Alamat Pengiriman</h2>
          </div>

          {selectedAddress ? (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <p className="font-medium mr-2">
                      {selectedAddress.recipient_name}
                    </p>
                    {selectedAddress.is_default && (
                      <span className="bg-[#507969] text-white text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedAddress.phone}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedAddress.detail_address},{" "}
                    {selectedAddress.subdistrict}, {selectedAddress.district},{" "}
                    {selectedAddress.city}, {selectedAddress.province}{" "}
                    {selectedAddress.zip_code}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                    className="text-[#507969] hover:text-[#2d5847] text-sm font-medium flex items-center"
                  >
                    Ganti Alamat
                    <FaChevronDown className="ml-1 text-xs" />
                  </button>
                </div>
              </div>

              {/* Address Dropdown */}
              {showAddressDropdown && (
                <div ref={dropdownRef} className="mt-4 border-t pt-4">
                  <div className="max-h-60 overflow-y-auto">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-3 border rounded-lg mb-3 cursor-pointer transition ${
                          selectedAddressId === address.id
                            ? "border-[#507969] bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => {
                          setSelectedAddressId(address.id);
                          setShowAddressDropdown(false);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <p className="font-medium mr-2">
                                {address.recipient_name}
                              </p>
                              {address.is_default && (
                                <span className="bg-[#507969] text-white text-xs px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {address.phone}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.detail_address}, {address.subdistrict},{" "}
                              {address.district}, {address.city},{" "}
                              {address.province} {address.zip_code}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(address);
                              }}
                              className="text-blue-500 hover:text-blue-600 text-sm"
                              title="Edit alamat"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(address.id);
                              }}
                              className="text-red-500 hover:text-red-600 text-sm"
                              title="Hapus alamat"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setShowAddAddressModal(true);
                      setShowAddressDropdown(false);
                    }}
                    className="w-full mt-3 bg-[#507969] text-white px-4 py-2 rounded hover:bg-[#2d5847] transition flex items-center justify-center"
                  >
                    <FaPlus className="mr-2" />
                    Tambah Alamat Baru
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Belum ada alamat yang dipilih
              </p>
              <button
                onClick={() => setShowAddAddressModal(true)}
                className="bg-[#507969] text-white px-6 py-2 rounded hover:bg-[#2d5847] transition"
              >
                <FaPlus className="inline mr-2" />
                Tambah Alamat
              </button>
            </div>
          )}
        </div>

        {/* Product List */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <FaBox className="text-[#507969] mr-2" />
            <h2 className="text-lg font-semibold">Produk Dipesan</h2>
          </div>

          {checkoutItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center border-b border-gray-200 py-4 last:border-b-0"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg mr-4"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  {item.seller_name} • Berat: {item.weight || 0}g
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-semibold text-[#507969]">
                    Rp {item.price.toLocaleString("id-ID")}
                  </span>
                  <span className="text-sm text-gray-600">
                    Qty: {item.quantity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Ringkasan Pesanan</h2>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal ({totalItems} produk)</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Berat</span>
              <span>{totalWeight}g</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Ongkos Kirim</span>
              <span>Akan dihitung di halaman pembayaran</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-[#507969]">
                Rp {subtotal.toLocaleString("id-ID")} + Ongkir
              </span>
            </div>
          </div>
        </div>

        {/* Proceed Button */}
        <button
          onClick={handleProceedToPayment}
          disabled={
            !selectedAddress || isLoadingDestination || isCalculatingShipping
          }
          className="w-full bg-[#507969] text-white py-3 rounded-lg hover:bg-[#2d5847] transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoadingDestination || isCalculatingShipping
            ? "Memproses..."
            : "Lanjutkan ke Pembayaran"}
        </button>
      </div>

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Tambah Alamat Baru</h3>
                <button
                  onClick={() => setShowAddAddressModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label Alamat
                  </label>
                  <input
                    type="text"
                    value={newAddress.label}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, label: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#507969]"
                    placeholder="Contoh: Rumah, Kantor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Penerima *
                  </label>
                  <input
                    type="text"
                    value={newAddress.recipient_name}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        recipient_name: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#507969]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Telepon *
                  </label>
                  <input
                    type="tel"
                    value={newAddress.phone}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, phone: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#507969]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provinsi *
                    </label>
                    <input
                      type="text"
                      value={newAddress.province}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          province: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#507969]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kota *
                    </label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#507969]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kecamatan *
                    </label>
                    <input
                      type="text"
                      value={newAddress.district}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          district: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#507969]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kelurahan *
                    </label>
                    <input
                      type="text"
                      value={newAddress.subdistrict}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          subdistrict: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#507969]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Pos *
                  </label>
                  <input
                    type="text"
                    value={newAddress.zip_code}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, zip_code: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#507969]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Lengkap *
                  </label>
                  <textarea
                    value={newAddress.detail_address}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        detail_address: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#507969]"
                    rows="3"
                    placeholder="Nama jalan, nomor rumah, RT/RW, patokan"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={newAddress.is_default}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        is_default: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-700">
                    Jadikan alamat utama
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddAddressModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
                  disabled={isSubmittingAddress}
                >
                  Batal
                </button>
                <button
                  onClick={handleAddAddress}
                  disabled={isSubmittingAddress}
                  className="flex-1 bg-[#507969] text-white py-2 rounded-lg hover:bg-[#2d5847] transition disabled:bg-gray-400"
                >
                  {isSubmittingAddress ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Address Modal */}
      {showEditAddressModal && editingAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Alamat</h3>
                <button
                  onClick={() => {
                    setShowEditAddressModal(false);
                    setEditingAddress(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label Alamat
                  </label>
                  <input
                    type="text"
                    value={editingAddress.label || ""}
                    onChange={(e) =>
                      setEditingAddress({
                        ...editingAddress,
                        label: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#507969]"
                    placeholder="Contoh: Rumah, Kantor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Penerima *
                  </label>
                  <input
                    type="text"
                    value={editingAddress.recipient_name}
                    onChange={(e) =>
                      setEditingAddress({
                        ...editingAddress,
                        recipient_name: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#507969]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Telepon *
                  </label>
                  <input
                    type="tel"
                    value={editingAddress.phone}
                    onChange={(e) =>
                      setEditingAddress({
                        ...editingAddress,
                        phone: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#507969]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provinsi *
                    </label>
                    <input
                      type="text"
                      value={editingAddress.province}
                      onChange={(e) =>
                        setEditingAddress({
                          ...editingAddress,
                          province: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#507969]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kota *
                    </label>
                    <input
                      type="text"
                      value={editingAddress.city}
                      onChange={(e) =>
                        setEditingAddress({
                          ...editingAddress,
                          city: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#507969]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kecamatan *
                    </label>
                    <input
                      type="text"
                      value={editingAddress.district}
                      onChange={(e) =>
                        setEditingAddress({
                          ...editingAddress,
                          district: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#507969]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kelurahan *
                    </label>
                    <input
                      type="text"
                      value={editingAddress.subdistrict}
                      onChange={(e) =>
                        setEditingAddress({
                          ...editingAddress,
                          subdistrict: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#507969]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Pos *
                  </label>
                  <input
                    type="text"
                    value={editingAddress.zip_code}
                    onChange={(e) =>
                      setEditingAddress({
                        ...editingAddress,
                        zip_code: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#507969]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Lengkap *
                  </label>
                  <textarea
                    value={editingAddress.detail_address}
                    onChange={(e) =>
                      setEditingAddress({
                        ...editingAddress,
                        detail_address: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#507969]"
                    rows="3"
                    placeholder="Nama jalan, nomor rumah, RT/RW, patokan"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editIsDefault"
                    checked={editingAddress.is_default}
                    onChange={(e) =>
                      setEditingAddress({
                        ...editingAddress,
                        is_default: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label
                    htmlFor="editIsDefault"
                    className="text-sm text-gray-700"
                  >
                    Jadikan alamat utama
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditAddressModal(false);
                    setEditingAddress(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
                  disabled={isSubmittingAddress}
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdateAddress}
                  disabled={isSubmittingAddress}
                  className="flex-1 bg-[#507969] text-white py-2 rounded-lg hover:bg-[#2d5847] transition disabled:bg-gray-400"
                >
                  {isSubmittingAddress ? "Menyimpan..." : "Update"}
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
