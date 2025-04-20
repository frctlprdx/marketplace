import { motion } from "framer-motion";

const Showcase = () => {
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
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.div
            key={i}
            className={
              [
                // Apply specific layout rules per item
                i === 0 && "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2",
                i === 1 && "col-span-2 row-span-1 sm:col-span-2 sm:row-span-1",
                i === 2 && "col-span-2 row-span-1 sm:col-span-1 sm:row-span-1",
                i === 3 && "col-span-4 row-span-2 sm:col-span-1 sm:row-span-2",
                i === 4 && "col-span-4 row-span-1 sm:col-span-2 sm:row-span-1",
                i === 5 && "col-span-2 row-span-1 sm:col-span-1 sm:row-span-1",
                i === 6 && "col-span-2 row-span-1 sm:col-span-4 sm:row-span-1",
              ].filter(Boolean).join(" ") + " bg-gray-300 rounded-[30px]"
            }
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
};

export default Showcase;
