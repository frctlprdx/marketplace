import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Showcase = () => {
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/products`)
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  return (
    <div className="px-4 py-10 max-w-7xl mx-auto">
      <motion.h2
        className="text-xl sm:text-3xl font-bold mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Produk Unggulan
      </motion.h2>

      <div className="grid gap-4 grid-cols-4 auto-rows-[130px] sm:auto-rows-[180px] lg:auto-rows-[200px]">
        {products.length > 0 ? (
          products.slice(0, 7).map((product, i) => (
            <motion.div
              key={i}
              className={
                [
                  i === 0 &&
                    "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2 shadow-md border",
                  i === 1 &&
                    "col-span-2 row-span-1 sm:col-span-2 sm:row-span-1 shadow-md border",
                  i === 2 &&
                    "col-span-2 row-span-1 sm:col-span-1 sm:row-span-1 shadow-md border",
                  i === 3 &&
                    "col-span-4 row-span-2 sm:col-span-1 sm:row-span-2 shadow-md border",
                  i === 4 &&
                    "col-span-4 row-span-1 sm:col-span-2 sm:row-span-1 shadow-md border",
                  i === 5 &&
                    "col-span-2 row-span-1 sm:col-span-1 sm:row-span-1 shadow-md border",
                  i === 6 &&
                    "col-span-2 row-span-1 sm:col-span-4 sm:row-span-1 shadow-md border",
                ]
                  .filter(Boolean)
                  .join(" ") +
                " bg-gray-300 rounded-[30px] overflow-hidden relative"
              }
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transform transition-all duration-300 hover:scale-110 cursor-pointer"
                onClick={() => navigate(`/productdetail/${product.id}`)}
              />
              <div className="pl-4 text-black absolute bottom-4 left-0 right-0 z-10">
                <h3 className="text-xl font-bold">{product.name}</h3>
              </div>
            </motion.div>
          ))
        ) : (
          <p>Loading products...</p>
        )}
      </div>
    </div>
  );
};

export default Showcase;
