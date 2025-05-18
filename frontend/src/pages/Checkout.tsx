import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
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
  const [metodePembayaran, setMetodePembayaran] = useState("");
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "", // tambahan
    recipient_name: "",
    phone: "",
    province: "", // tambahan
    city: "",
    district: "", // tambahan
    subdistrict: "", // tambahan
    zip_code: "",
    detail_address: "",
    is_default: false, // tambahan, boolean
  });

  // Ambil data user dari selected address secara efisien
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  // Close dropdown ketika klik di luar
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

  // Fetch addresses
  useEffect(() => {
    (async () => {
      const userId = localStorage.getItem("user_id");
      const token = localStorage.getItem("user_token");
      if (!userId || !token) {
        setAddresses([]);
        return;
      }
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/addresses?user_id=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Gagal fetch alamat");
        const data = await res.json();
        setAddresses(data);
        if (data.length) setSelectedAddressId(data[0].id);
      } catch {
        setAddresses([]);
      }
    })();
  }, []);

  // Delete alamat
  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("user_token");
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
    } catch {
      alert("Gagal menghapus alamat.");
    }
  };

  // Tambah alamat baru
  const handleAddAddress = async () => {
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("user_token");
    if (!userId || !token) return alert("Anda harus login terlebih dahulu.");

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
          label: "", // tambahan
          recipient_name: "",
          phone: "",
          province: "", // tambahan
          city: "",
          district: "", // tambahan
          subdistrict: "", // tambahan
          zip_code: "",
          detail_address: "",
          is_default: false, // tambahan, boolean
        });
        setShowAddAddressModal(false);
        alert("Alamat berhasil ditambahkan.");
      } else alert("Gagal menambahkan alamat.");
    } catch {
      alert("Gagal menambahkan alamat.");
    }
  };

  // Submit checkout
  const handleSubmit = async () => {
    if (!selectedAddress || !metodePembayaran) {
      alert("Semua kolom harus diisi!");
      return;
    }
    if (!product) {
      alert("Produk tidak ditemukan.");
      return;
    }
    const token = localStorage.getItem("user_token");
    if (!token) {
      alert("Anda harus login terlebih dahulu.");
      return;
    }

    const checkoutData = {
      address: selectedAddress,
      product,
      payment_method: metodePembayaran,
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/checkout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      });
      if (res.ok) {
        alert("Checkout berhasil!");
        navigate("/");
      } else {
        const errorData = await res.json();
        alert("Checkout gagal: " + (errorData.message || "Unknown error"));
      }
    } catch (error) {
      alert("Checkout gagal: " + error);
    }
  };

  if (!product) {
    return (
      <div className="text-center mt-20 text-red-600 font-semibold">
        Data checkout tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded shadow relative">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Pilih Alamat */}
          <section className="bg-gray-50 p-6 rounded shadow relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Pilih Alamat Pengiriman</h2>
              <button
                onClick={() => setShowAddAddressModal(true)}
                className="text-orange-500 hover:text-orange-600"
                aria-label="Tambah Alamat Baru"
              >
                <FaPlus size={18} />
              </button>
            </div>

            {addresses.length > 0 ? (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold">
                      {selectedAddress?.recipient_name}
                    </p>
                    <p>{selectedAddress?.detail_address}</p>
                    <p>
                      {selectedAddress?.city}, {selectedAddress?.zip_code}
                    </p>
                    <p className="text-sm text-gray-600">
                      Telp: {selectedAddress?.phone}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => setShowAddressDropdown((prev) => !prev)}
                      className="text-sm text-orange-500"
                    >
                      {showAddressDropdown ? "Tutup Pilihan" : "Pilih Alamat"}
                    </button>
                  </div>
                </div>

                {showAddressDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-50 bg-white border rounded shadow-lg p-4 w-full max-h-96 overflow-y-auto"
                  >
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`cursor-pointer border rounded p-3 mb-3 flex justify-between items-start gap-2 transition-all ${
                          selectedAddressId === addr.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300"
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{addr.recipient_name}</p>
                          <p>{addr.detail_address}</p>
                          <p>
                            {addr.city}, {addr.zip_code}
                          </p>
                          <p className="text-sm text-gray-600">
                            Telp: {addr.phone}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(addr.id);
                          }}
                        >
                          <FaTrash className="text-red-500 hover:text-red-700" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {showAddAddressModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white rounded p-6 w-96 relative shadow-lg">
                      <button
                        onClick={() => setShowAddAddressModal(false)}
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 font-bold"
                        aria-label="Tutup Modal"
                      >
                        ×
                      </button>
                      <h3 className="text-xl font-semibold mb-4">
                        Tambah Alamat Baru
                      </h3>
                      <div className="flex flex-col gap-3">
                        {[
                          {
                            key: "recipient_name",
                            placeholder: "Nama Penerima",
                          },
                          {
                            key: "phone",
                            placeholder: "Nomor Telepon",
                            type: "tel",
                          },
                          {
                            key: "label",
                            placeholder: "Label Alamat (Rumah, Kantor, dll)",
                          },
                          { key: "province", placeholder: "Provinsi" },
                          { key: "city", placeholder: "Kota/Kabupaten" },
                          { key: "subdistrict", placeholder: "Kecamatan" },
                          { key: "zip_code", placeholder: "Kode Pos" },
                        ].map(({ key, placeholder, type }) => (
                          <input
                            key={key}
                            type={type || "text"}
                            placeholder={placeholder}
                            className="border rounded px-3 py-2"
                            value={(newAddress as any)[key] || ""}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                          />
                        ))}

                        {/* Textarea untuk Alamat Lengkap */}
                        <textarea
                          placeholder="Alamat Lengkap (Jalan, RT/RW, Patokan, dll)"
                          className="border rounded px-3 py-2 resize-none"
                          rows={3}
                          value={(newAddress as any).detail_address || ""}
                          onChange={(e) =>
                            setNewAddress((prev) => ({
                              ...prev,
                              detail_address: e.target.value,
                            }))
                          }
                        />

                        <button
                          onClick={handleAddAddress}
                          className="bg-orange-500 text-white rounded py-2 mt-2 hover:bg-orange-600"
                        >
                          Simpan Alamat
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p>
                Anda belum memiliki alamat pengiriman. Silakan tambah alamat
                baru.
              </p>
            )}
          </section>
          {/* Pilih Metode Pembayaran */}
          <section className="bg-gray-50 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Metode Pembayaran</h2>
            <select
              value={metodePembayaran}
              onChange={(e) => setMetodePembayaran(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Pilih metode pembayaran</option>
              <option value="transfer_bank">Transfer Bank</option>
              <option value="gopay">Gopay</option>
            </select>
          </section>
        </div>

        {/* Ringkasan Pesanan */}
        <div className="bg-gray-50 p-6 rounded shadow flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>
          <div className="flex items-center gap-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-24 h-24 rounded object-cover"
            />
            <div>
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-gray-600">
                Harga: Rp{product.price.toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="mt-auto bg-orange-500 text-white py-3 rounded hover:bg-orange-600 transition"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
