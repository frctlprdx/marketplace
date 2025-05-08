import { useEffect, useState } from "react";

const Product = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <div className="max-w-7xl h-16 mx-auto px-4">
        <div className="max-w-7xl h-16 mx-auto flex items-center text-sm text-gray-600 space-x-2">
          <a href="/" className="hover:underline cursor-pointer">
            Home
          </a>
          <span>{">"}</span>
          <a href="/product" className="hover:underline cursor-pointer">
            Products
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
          {/* Left Filter - 2/7 */}
          <aside className="lg:col-span-2 bg-white rounded-xl shadow p-4 h-fit sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Filter Produk</h2>
            {/* Tambahkan filter kategori, harga, rating, dll */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm text-gray-600">Kategori</label>
                <select className="w-full mt-1 border rounded p-2">
                  <option>Semua</option>
                  <option>Elektronik</option>
                  <option>Pakaian</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600">
                  Harga Maksimal
                </label>
                <input
                  type="number"
                  className="w-full mt-1 border rounded p-2"
                />
              </div>
            </div>
          </aside>

          {/* Right Product Grid - 5/7 */}
          <section className="lg:col-span-5">
            <h2 className="text-xl font-bold mb-6">Daftar Produk</h2>
            {products.length === 0 ? (
              <p className="text-gray-500">Produk tidak ditemukan...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-48 w-full object-cover rounded mb-4"
                    />
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-orange-600 font-bold mt-2">
                      Rp {product.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Stok: {product.stocks}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Product;
