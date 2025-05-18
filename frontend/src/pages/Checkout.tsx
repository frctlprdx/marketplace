import { useLocation } from "react-router-dom";

const Checkout = () => {
  const location = useLocation();
  const { product } = (location.state as { product?: any }) || {};

  if (!product) {
    return (
      <div className="text-center mt-20 text-red-600 font-semibold">
        Data checkout tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kiri: alamat & deskripsi */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Alamat Pengiriman */}
          <section className="bg-gray-50 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Alamat Pengiriman</h2>
            <form className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Nama Penerima"
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Alamat Lengkap"
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Kota"
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Kode Pos"
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="tel"
                placeholder="No. Telepon"
                className="border border-gray-300 rounded px-3 py-2"
              />
            </form>
          </section>

          {/* Deskripsi Produk */}
          <section className="bg-gray-50 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Deskripsi Produk</h2>
            <div className="flex items-center gap-6">
              <img
                src={product.image}
                alt={product.name}
                className="w-32 h-32 object-cover rounded"
              />
              <div>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p>Jumlah: {product.quantity}</p>
                <p className="text-orange-600 font-bold">
                  Total: Rp{" "}
                  {(product.price * product.quantity).toLocaleString("id-ID")}
                </p>
                <p className="mt-2 text-gray-700">{product.description}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Kanan: Metode Pembayaran */}
        <div className="bg-gray-50 p-6 rounded shadow flex flex-col gap-6">
          <h2 className="text-xl font-semibold">Metode Pembayaran</h2>
          <form className="flex flex-col gap-4">
            <label className="flex items-center gap-3">
              <input type="radio" name="payment" value="transfer" />
              Transfer Bank
            </label>
            <label className="flex items-center gap-3">
              <input type="radio" name="payment" value="credit" />
              Kartu Kredit
            </label>
            <label className="flex items-center gap-3">
              <input type="radio" name="payment" value="cod" />
              Bayar di Tempat (COD)
            </label>
          </form>

          <button className="mt-auto bg-orange-500 text-white py-3 rounded hover:bg-orange-600 transition">
            Bayar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
