import { motion, useAnimation } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import herobg from "../../../public/assets/herobg.png";

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
    <div
      className="w-screen h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        // backgroundImage: `url(${herobg})`,
      }}
    >
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={variants}
        className="sm:mx-0 mx-20 px-4 bg-[#507969]/0 w-screen py-4 text-center"
      >
        <h1 className=" text-black text-center text-3xl sm:text-4xl font-bold mb-4">
          Welcome !
        </h1>
        <p className=" text-black">
          Marketplace to sell all your products online
        </p>
        <div className="mt-6 flex justify-center">
          <button
            className="bg-button text-white px-15 sm:px-30 py-3 rounded-full text-lg font-semibold transition duration-300 cursor-pointer"
            onClick={handleClick}
          >
            See Products
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
