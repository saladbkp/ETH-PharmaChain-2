import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import WalletConnect from './WalletConnect';
import { useWeb3 } from '../contexts/Web3Context';
import '../styles/Dashboard.css';

export default function DashboardLayout() {
  const [role, setRole] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { connectWallet, disconnectWallet, isConnected } = useWeb3();

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setRole(userRole);

    // Auto-connect wallet when entering dashboard
    if (!isConnected) {
      connectWallet();
    }

    // Redirect to role's default page if at /dashboard root
    if (location.pathname === '/dashboard') {
      switch(userRole) {
        case 'admin':
          navigate('/dashboard/admin/pending-medicines');
          break;
        case 'manufacturer':
          navigate('/dashboard/manufacturer/register');
          break;
        case 'retailer':
          navigate('/dashboard/inventory');
          break;
        default:
          navigate('/login');
      }
    }
  }, [navigate, isConnected, connectWallet, location.pathname]);

  const manufacturerLinks = [
    { path: '/dashboard/manufacturer/register', label: 'Register Medicine' },
    { path: '/dashboard/manufacturer/medicines', label: 'My Medicines' },
    { path: '/dashboard/manufacturer/create-batch', label: 'Create Batch' },
    { path: '/dashboard/manufacturer/batches', label: 'My Batches' },
    { path: '/dashboard/inventory', label: 'Inventory' },
    { path: '/dashboard/transfer', label: 'Transfer' },
    { path: '/dashboard/generate-qr', label: 'Generate QR' },
  ];

  const adminLinks = [
    { path: '/dashboard/admin/pending-medicines', label: 'Pending Medicines' },
    { path: '/dashboard/admin/pending-batches', label: 'Pending Batches' },
    { path: '/dashboard/admin/history', label: 'Approval History' },
    { path: '/dashboard/admin/batch-history', label: 'Batch History' },
    { path: '/dashboard/admin/categories', label: 'Manage Categories' },
    { path: '/dashboard/admin/staff', label: 'Manage Staff' },
    { path: '/dashboard/generate-qr', label: 'Generate QR' },
  ];

  const retailerLinks = [
    { path: '/dashboard/inventory', label: 'My Inventory' },
    { path: '/dashboard/transactions', label: 'Transactions' },
    { path: '/dashboard/scan-qr', label: 'Scan QR' },
  ];

  const sharedLinks = [
    { path: '/dashboard/transactions', label: 'Transaction History' },
    { path: '/dashboard/scan-qr', label: 'Scan QR' },
  ];

  const getLinks = () => {
    switch(role) {
      case 'manufacturer': return [...manufacturerLinks, ...sharedLinks];
      case 'admin': return [...adminLinks, ...sharedLinks];
      case 'retailer': return retailerLinks;
      default: return [];
    }
  };

  const handleLogout = () => {
    // Disconnect wallet before logging out
    disconnectWallet();
    // Clear all localStorage
    localStorage.clear();
    // Navigate to login
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>PharmaChain</h2>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="sidebar-user-info">
          <span className="user-role">Role: {role || 'Loading...'}</span>
        </div>

        <ul className="sidebar-nav">
          {getLinks().map(link => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={location.pathname === link.path ? 'active' : ''}
                onClick={() => setSidebarOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      {/* Main content area */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1>PharmaChain Dashboard</h1>
          <WalletConnect />
        </header>

        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
