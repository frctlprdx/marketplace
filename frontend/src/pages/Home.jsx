import HeroSection from "../components/Hero/HeroSection";
import Showcase from "../components/showcase/Showcase";
import Location from "../components/Location/Location";
import Review from "../components/ReviewComponents/Review";
import FAQ from "../components/FAQ/FAQ";
import Footer from "../components/Footer/Footer";

const Home = () => {
  return (
    <div className="w-screen">
      <div>
        <HeroSection />
      </div>
      <div>
        <Showcase />
      </div>
      <div>
        <Review />
      </div>
      <div>
        <FAQ />
      </div>
      <div>
        <Location />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};
export default Home;
