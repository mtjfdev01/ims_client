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

function App() {
  return (
    <ShopProvider>
      <Router>
        <div className="App">
          <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/home" element={<Home />} />
          
          {/* Shops Routes */}
          <Route path="/shops" element={<ShopList />} />
          <Route path="/shops/create" element={<ShopCreate />} />
          <Route path="/shops/:id" element={<ShopView />} />
          <Route path="/shops/:id/edit" element={<ShopEdit />} />
          <Route path="/shops/:id/items" element={<ShopItems />} />
          <Route path="/shops/:id/sales" element={<ShopSales />} />
          <Route path="/shops/:id/expenses" element={<ShopExpenses />} />
          
          {/* Stores Routes */}
          <Route path="/stores" element={<StoreList />} />
          <Route path="/stores/create" element={<StoreCreate />} />
          <Route path="/stores/:id" element={<StoreView />} />
          <Route path="/stores/:id/edit" element={<StoreEdit />} />
          <Route path="/stores/:id/items" element={<StoreItems />} />
          
          {/* Categories Routes */}
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/categories/create" element={<CategoryCreate />} />
          <Route path="/categories/:id" element={<CategoryView />} />
          <Route path="/categories/:id/edit" element={<CategoryEdit />} />
          
          {/* Companies Routes */}
          <Route path="/companies" element={<CompanyList />} />
          <Route path="/companies/create" element={<CompanyCreate />} />
          <Route path="/companies/:id" element={<CompanyView />} />
          <Route path="/companies/:id/edit" element={<CompanyEdit />} />
          
          {/* Items Routes */}
          <Route path="/items" element={<ItemList />} />
          <Route path="/items/create" element={<ItemCreate />} />
          <Route path="/items/:id" element={<ItemView />} />
          <Route path="/items/:id/edit" element={<ItemEdit />} />
          <Route path="/items/transfer" element={<TransferItem />} />
          
          {/* Sales Routes */}
          <Route path="/sales" element={<SaleList />} />
          <Route path="/sales/create" element={<SaleCreate />} />
          <Route path="/sales/:id" element={<SaleView />} />
          <Route path="/sales/:id/edit" element={<SaleEdit />} />
          
          {/* Orders Routes */}
          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/create" element={<OrderCreate />} />
          <Route path="/orders/:id" element={<OrderView />} />
          <Route path="/orders/:id/edit" element={<OrderEdit />} />
          
          {/* Purchases Routes */}
          <Route path="/purchases" element={<PurchaseList />} />
          <Route path="/purchases/create" element={<PurchaseCreate />} />
          <Route path="/purchases/:id" element={<PurchaseView />} />
          <Route path="/purchases/:id/edit" element={<PurchaseEdit />} />
          
          {/* Expenses Routes */}
          <Route path="/expenses" element={<ExpenseList />} />
          <Route path="/expenses/create" element={<ExpenseCreate />} />
          <Route path="/expenses/:id" element={<ExpenseView />} />
          <Route path="/expenses/:id/edit" element={<ExpenseEdit />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ShopProvider>
  );
}

export default App;
