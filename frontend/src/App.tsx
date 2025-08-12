import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./src/components/Navbar/NavbarComponent";
import Home from "./pages/Home"
import Product from "./pages/Product";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import TransactionHistory from "./pages/TransactionHistory";
import Thanks from "./pages/Thanks";
import Error from "./pages/Error";
import AddProduct from "./pages/AddProduct";
import SellerLayout from "./components/Layouts/SellerLayout";
import SellerProducts from "./pages/SellerProducts";
import EditProduct from "./pages/EditProduct";
import AllTransaction from "./pages/AllTransaction";
import TransactionDetail from "./pages/TransactionDetail";
import Profile from "./pages/Profile";
import History from "./pages/TransactionHistory";``
import "react-toastify/dist/ReactToastify.css";

// Component to handle conditional navbar rendering
function AppContent() {
  const location = useLocation();

  // Define routes where navbar should be hidden
  const hideNavbarRoutes = ["/thanks", "/error"];

  // Check if current route should hide navbar
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="w-screen">
      {/* Conditionally render navbar */}
      {!shouldHideNavbar && (
        <div className="sticky top-0 z-50">
          <Navbar />
        </div>
      )}

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
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<History />} />
        {/* Halaman khusus */}
        <Route path="/thanks" element={<Thanks />} />
        <Route path="/error" element={<Error />} />

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
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
