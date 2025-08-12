import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqList = [
  {
    question: "Apa itu Marketplace Desa?",
    answer:
      "Marketplace Desa adalah platform digital untuk membantu warga desa melakukan jual beli secara online.",
  },
  {
    question: "Siapa yang bisa bergabung di platform ini?",
    answer:
      "Semua warga desa yang memiliki produk untuk dijual dapat bergabung.",
  },
  {
    question: "Bagaimana cara mendaftar sebagai penjual?",
    answer:
      "Anda dapat mendaftar melalui menu pendaftaran di halaman utama.",
  },
  {
    question: "Apakah penggunaan platform ini berbayar?",
    answer:
      "Saat ini, platform dapat digunakan secara gratis oleh warga desa.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-0 py-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-left mb-10">
        Pertanyaan Umum
      </h2>
      <div className="space-y-4">
        {faqList.map((item, index) => (
          <div
            key={index}
            className="rounded-xl bg-transparent backdrop-blur-sm transition-all border-b-2 border-gray-500 shadow-sm"
          >
            <button
              className="w-full flex justify-between items-center px-6 py-4 font-medium text-left hover:bg-gray-100/20 transition"
              onClick={() => toggleFAQ(index)}
            >
              <span className="text-sm sm:text-base">{item.question}</span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={20} />
              </motion.div>
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-6 py-4 text-sm sm:text-base text-gray-700">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
