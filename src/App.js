import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ShopProvider } from './contexts/ShopContext';
import Auth from './components/Auth';
import Home from './pages/Home';

// Shops
import ShopList from './pages/shops/ShopList';
import ShopCreate from './pages/shops/ShopCreate';
import ShopView from './pages/shops/ShopView';
import ShopEdit from './pages/shops/ShopEdit';
import ShopItems from './pages/shops/ShopItems';
import ShopSales from './pages/shops/ShopSales';
import ShopExpenses from './pages/shops/ShopExpenses';

// Stores
import StoreList from './pages/stores/StoreList';
import StoreCreate from './pages/stores/StoreCreate';
import StoreView from './pages/stores/StoreView';
import StoreEdit from './pages/stores/StoreEdit';
import StoreItems from './pages/stores/StoreItems';

// Categories
import CategoryList from './pages/categories/CategoryList';
import CategoryCreate from './pages/categories/CategoryCreate';
import CategoryView from './pages/categories/CategoryView';
import CategoryEdit from './pages/categories/CategoryEdit';

// Companies
import CompanyList from './pages/companies/CompanyList';
import CompanyCreate from './pages/companies/CompanyCreate';
import CompanyView from './pages/companies/CompanyView';
import CompanyEdit from './pages/companies/CompanyEdit';

// Items
import ItemList from './pages/items/ItemList';
import ItemCreate from './pages/items/ItemCreate';
import ItemView from './pages/items/ItemView';
import ItemEdit from './pages/items/ItemEdit';
import TransferItem from './pages/items/TransferItem';

// Sales
import SaleList from './pages/sales/SaleList';
import SaleCreate from './pages/sales/SaleCreate';
import SaleView from './pages/sales/SaleView';
import SaleEdit from './pages/sales/SaleEdit';

// Orders
import OrderList from './pages/orders/OrderList';
import OrderCreate from './pages/orders/OrderCreate';
import OrderView from './pages/orders/OrderView';
import OrderEdit from './pages/orders/OrderEdit';

// Purchases
import PurchaseList from './pages/purchases/PurchaseList';
import PurchaseCreate from './pages/purchases/PurchaseCreate';
import PurchaseView from './pages/purchases/PurchaseView';
import PurchaseEdit from './pages/purchases/PurchaseEdit';

// Expenses
import ExpenseList from './pages/expenses/ExpenseList';
import ExpenseCreate from './pages/expenses/ExpenseCreate';
import ExpenseView from './pages/expenses/ExpenseView';
import ExpenseEdit from './pages/expenses/ExpenseEdit';

import './App.css';

const isLoggedIn = () => {
  try {
    return !!JSON.parse(localStorage.getItem('user') || 'null');
  } catch (e) {
    return false;
  }
};

const RequireAuth = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <ShopProvider>
      <Router>
        <div className="App">
          <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
          
          {/* Shops Routes */}
          <Route path="/shops" element={<RequireAuth><ShopList /></RequireAuth>} />
          <Route path="/shops/create" element={<RequireAuth><ShopCreate /></RequireAuth>} />
          <Route path="/shops/:id" element={<RequireAuth><ShopView /></RequireAuth>} />
          <Route path="/shops/:id/edit" element={<RequireAuth><ShopEdit /></RequireAuth>} />
          <Route path="/shops/:id/items" element={<RequireAuth><ShopItems /></RequireAuth>} />
          <Route path="/shops/:id/sales" element={<RequireAuth><ShopSales /></RequireAuth>} />
          <Route path="/shops/:id/expenses" element={<RequireAuth><ShopExpenses /></RequireAuth>} />
          
          {/* Stores Routes */}
          <Route path="/stores" element={<RequireAuth><StoreList /></RequireAuth>} />
          <Route path="/stores/create" element={<RequireAuth><StoreCreate /></RequireAuth>} />
          <Route path="/stores/:id" element={<RequireAuth><StoreView /></RequireAuth>} />
          <Route path="/stores/:id/edit" element={<RequireAuth><StoreEdit /></RequireAuth>} />
          <Route path="/stores/:id/items" element={<RequireAuth><StoreItems /></RequireAuth>} />
          
          {/* Categories Routes */}
          <Route path="/categories" element={<RequireAuth><CategoryList /></RequireAuth>} />
          <Route path="/categories/create" element={<RequireAuth><CategoryCreate /></RequireAuth>} />
          <Route path="/categories/:id" element={<RequireAuth><CategoryView /></RequireAuth>} />
          <Route path="/categories/:id/edit" element={<RequireAuth><CategoryEdit /></RequireAuth>} />
          
          {/* Companies Routes */}
          <Route path="/companies" element={<RequireAuth><CompanyList /></RequireAuth>} />
          <Route path="/companies/create" element={<RequireAuth><CompanyCreate /></RequireAuth>} />
          <Route path="/companies/:id" element={<RequireAuth><CompanyView /></RequireAuth>} />
          <Route path="/companies/:id/edit" element={<RequireAuth><CompanyEdit /></RequireAuth>} />
          
          {/* Items Routes */}
          <Route path="/items" element={<RequireAuth><ItemList /></RequireAuth>} />
          <Route path="/items/create" element={<RequireAuth><ItemCreate /></RequireAuth>} />
          <Route path="/items/:id" element={<RequireAuth><ItemView /></RequireAuth>} />
          <Route path="/items/:id/edit" element={<RequireAuth><ItemEdit /></RequireAuth>} />
          <Route path="/items/transfer" element={<RequireAuth><TransferItem /></RequireAuth>} />
          
          {/* Sales Routes */}
          <Route path="/sales" element={<RequireAuth><SaleList /></RequireAuth>} />
          <Route path="/sales/create" element={<RequireAuth><SaleCreate /></RequireAuth>} />
          <Route path="/sales/:id" element={<RequireAuth><SaleView /></RequireAuth>} />
          <Route path="/sales/:id/edit" element={<RequireAuth><SaleEdit /></RequireAuth>} />
          
          {/* Orders Routes */}
          <Route path="/orders" element={<RequireAuth><OrderList /></RequireAuth>} />
          <Route path="/orders/create" element={<RequireAuth><OrderCreate /></RequireAuth>} />
          <Route path="/orders/:id" element={<RequireAuth><OrderView /></RequireAuth>} />
          <Route path="/orders/:id/edit" element={<RequireAuth><OrderEdit /></RequireAuth>} />
          
          {/* Purchases Routes */}
          <Route path="/purchases" element={<RequireAuth><PurchaseList /></RequireAuth>} />
          <Route path="/purchases/create" element={<RequireAuth><PurchaseCreate /></RequireAuth>} />
          <Route path="/purchases/:id" element={<RequireAuth><PurchaseView /></RequireAuth>} />
          <Route path="/purchases/:id/edit" element={<RequireAuth><PurchaseEdit /></RequireAuth>} />
          
          {/* Expenses Routes */}
          <Route path="/expenses" element={<RequireAuth><ExpenseList /></RequireAuth>} />
          <Route path="/expenses/create" element={<RequireAuth><ExpenseCreate /></RequireAuth>} />
          <Route path="/expenses/:id" element={<RequireAuth><ExpenseView /></RequireAuth>} />
          <Route path="/expenses/:id/edit" element={<RequireAuth><ExpenseEdit /></RequireAuth>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ShopProvider>
  );
}

export default App;
