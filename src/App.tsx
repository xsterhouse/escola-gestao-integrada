
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Schools from './pages/Schools';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Planning from './pages/Planning';
import Contracts from './pages/Contracts';
import Financial from './pages/Financial';
import Accounting from './pages/Accounting';
import TransactionHistory from './pages/TransactionHistory';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/schools" element={<Schools />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/products" element={<Products />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/financial" element={<Financial />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/transaction-history" element={<TransactionHistory />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
