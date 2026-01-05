import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { OrderAudioAlert } from "@/components/OrderAudioAlert";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <OrderAudioAlert />
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
