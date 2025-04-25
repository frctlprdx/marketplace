import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!product) return <p>Loading product...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6 mt-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Gambar Produk */}
        <div className="md:w-1/2">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-auto object-cover rounded-2xl"
          />
        </div>

        {/* Detail Produk */}
        <div className="md:w-1/2 flex flex-col justify-center pl-10">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="mb-2">
            <strong>Price:</strong> ${product.price}
          </p>
          <p className="mb-2">
            <strong>Stock:</strong> {product.stocks}
          </p>
          <p className="mb-4">
            <strong>Description:</strong> {product.description}
          </p>
          <button
            className="bg-green-500 text-white px-6 py-2 rounded w-fit"
            onClick={() => alert("Product added to cart!")}
          >
            Masukkan ke Keranjang
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
