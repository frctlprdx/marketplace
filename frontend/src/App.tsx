import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/NavbarComponent";
import Home from "./pages/Home";
import Product from "./pages/Product";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <div className="w-screen">
        <div className="sticky top-0 z-50">
          <Navbar />
        </div>
        <div className="w-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product" element={<Product />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/productdetail/:id" element={<ProductDetail />} />
          </Routes>
        </div>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
