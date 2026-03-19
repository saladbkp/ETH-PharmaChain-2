import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Web3ProviderComponent } from "./contexts/Web3Context";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ScanTransaction from "./pages/ScanTransaction";
import DashboardLayout from "./components/DashboardLayout";
import ManufacturerRegister from "./pages/manufacturer/RegisterMedicine";
import ManufacturerBatches from "./pages/manufacturer/MyBatches";
import ManufacturerCreateBatch from "./pages/manufacturer/CreateBatch";
import AdminPendingMedicines from "./pages/admin/PendingMedicines";
import AdminApprovalHistory from "./pages/admin/ApprovalHistory";
import AdminManageCategories from "./pages/admin/ManageCategories";
import AdminPendingBatches from "./pages/admin/PendingBatches";
import AdminManageStaff from "./pages/admin/ManageStaff";
import InventoryPage from "./pages/Inventory";
import TransferPage from "./pages/Transfer";
import TransactionHistory from "./pages/TransactionHistory";
import GenerateQR from "./pages/GenerateQR";
import ScanQR from "./pages/ScanQR";

function App() {
    return (
        <Web3ProviderComponent>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/scan" element={<ScanTransaction />} />
                    <Route path="/dashboard" element={<DashboardLayout />}>
                        {/* Manufacturer routes */}
                        <Route path="manufacturer/register" element={<ManufacturerRegister />} />
                        <Route path="manufacturer/batches" element={<ManufacturerBatches />} />
                        <Route path="manufacturer/create-batch" element={<ManufacturerCreateBatch />} />

                        {/* Admin routes */}
                        <Route path="admin/pending-medicines" element={<AdminPendingMedicines />} />
                        <Route path="admin/pending-batches" element={<AdminPendingBatches />} />
                        <Route path="admin/history" element={<AdminApprovalHistory />} />
                        <Route path="admin/categories" element={<AdminManageCategories />} />
                        <Route path="admin/staff" element={<AdminManageStaff />} />

                        {/* Shared routes */}
                        <Route path="inventory" element={<InventoryPage />} />
                        <Route path="transfer" element={<TransferPage />} />
                        <Route path="transactions" element={<TransactionHistory />} />
                        <Route path="generate-qr" element={<GenerateQR />} />
                        <Route path="scan-qr" element={<ScanQR />} />
                    </Route>
                </Routes>
            </Router>
        </Web3ProviderComponent>
    );
}

export default App;
