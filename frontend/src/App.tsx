import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/NavbarComponent";
import Home from "./pages/Home";
import Product from "./pages/Product";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";

function App() {
  return (
    <Router>
      <div className="w-screen">
        <div className="sticky sticky top-0 z-50">
          <Navbar />
        </div>
        <div className="w-screen">
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/product" element={<Product />}></Route>
            <Route path="/wishlist" element={<Wishlist />}></Route>
            <Route path="/cart" element={<Cart />}></Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
