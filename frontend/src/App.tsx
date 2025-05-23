import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/NavbarComponent";
import Home from "./pages/Home";
import Product from "./pages/Product";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import TransactionHistory from "./pages/TransactionHistory";
import AddProduct from "./pages/AddProduct";
import SellerLayout from "./components/Layouts/SellerLayout";
import SellerProducts from "./pages/SellerProducts";
import EditProduct from "./pages/EditProduct";
import AllTransaction from "./pages/AllTransaction";
import TransactionDetail from "./pages/TransactionDetail";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <div className="w-screen">
        <div className="sticky top-0 z-50">
          <Navbar />
        </div>

        <Routes>
          {/* Halaman umum */}
          <Route path="/" element={<Home />} />
          <Route path="/product" element={<Product />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/productdetail/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/transactionhistory" element={<TransactionHistory />} />

          {/* Halaman seller */}
          <Route
            path="/addproduct"
            element={
              <SellerLayout>
                <AddProduct />
              </SellerLayout>
            }
          />
          <Route
            path="/allproducts"
            element={
              <SellerLayout>
                <SellerProducts />
              </SellerLayout>
            }
          />
          <Route
            path="/editproduct/:id"
            element={
              <SellerLayout>
                <EditProduct />
              </SellerLayout>
            }
          />
          <Route
            path="/alltransaction"
            element={
              <SellerLayout>
                <AllTransaction />
              </SellerLayout>
            }
          />
          <Route
            path="/transactiondetail/:id"
            element={
              <SellerLayout>
                <TransactionDetail />
              </SellerLayout>
            }
          />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
