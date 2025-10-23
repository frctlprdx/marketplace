import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar/NavbarComponent";
import Home from "./pages/Home";
import Product from "./pages/Product";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import AddProduct from "./pages/AddProduct";
import SellerLayout from "./components/Layouts/SellerLayout";
import SellerProducts from "./pages/SellerProducts";
import EditProduct from "./pages/EditProduct";
import Profile from "./pages/Profile";
import AddCategory from "./pages/AddCategory";
import TemperatureMonitor from "./pages/TemperaturMonitor";
import TemperatureHistory from "./pages/TemperatureHistory";
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
        <Route path="/profile" element={<Profile />} /> 
        {/* Halaman khusus */}

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
          path="/addcategory"
          element={
            <SellerLayout>
              <AddCategory />
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
          path="tempmonitor"
          element={
            <SellerLayout>
              <TemperatureMonitor />
            </SellerLayout>
          }
        />
        <Route
          path="temphistory"
          element={
            <SellerLayout>
              <TemperatureHistory />
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
