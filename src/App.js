import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeScreen from "./Screens/HomeScreen";
import Navbar from "./components/navBar";
import LoginScreen from "./Screens/LoginScreen";
import ProductScreen from "./Screens/ProductScreen";
import CartScreen from "./Screens/CartScreen";
import OrderScreen from "./Screens/OrderScreen";
import OrdersScreen from "./Screens/OrdersScreen";
import ProfileScreen from "./Screens/ProfileScreen";
import ProductRateScreen from "./Screens/ProductRateScreen";


function App() {

  return (
    <Router>

      <Navbar />
      <div className="flex flex-col h-screen">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/product/:productId" element={<ProductScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/order/:idList" element={<OrderScreen />} />
          <Route path="/user/orders" element={<OrdersScreen />} />
          <Route path="/user/profile" element={<ProfileScreen />} />
          <Route path="/user/rate" element={<ProductRateScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;