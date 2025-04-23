import { motion, useAnimation } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";

const HeroSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref);
  const controls = useAnimation();

  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/product");
  };

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [inView, controls]);

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 2, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={variants}
        className="max-w-xl sm:mx-0 mx-20 px-4"
      >
        <h1 className="text-center text-3xl sm:text-4xl font-bold mb-4">
          Selamat Datang
        </h1>
        <p className="text-justify leading-relaxed">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Suscipit
          quia illo pariatur quaerat libero natus ullam nulla repellat
          architecto praesentium recusandae obcaecati nobis exercitationem,
          veritatis sint ad ea ab nemo.
        </p>
        <div className="mt-6 flex justify-center">
          <button
            className="bg-black text-white px-15 sm:px-30 py-3 rounded-full text-lg font-semibold hover:bg-gray-800 transition duration-300"
            onClick={handleClick}
          >
            Lihat Produk
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
