import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/DashBoard/Dashboard"; // make sure folder name matches!
import UploadContract from "./pages/Contracts/UploadContract";
import MyContracts from "./pages/Contracts/MyContracts";
import ContractDetails from "./pages/Contracts/ContractDetails";
import Notifications from "./pages/Notifications/Notifications";
import Profile from "./pages/profile/Profiles";
import AuditLogs from "./pages/Auditlogs/Auditlogs";
import MainLayout from "./layouts/MainLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes WITHOUT sidebar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes WITH sidebar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadContract />} />
          <Route path="/contracts" element={<MyContracts />} />
          <Route path="/contracts/:id" element={<ContractDetails />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/audit" element={<AuditLogs />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
