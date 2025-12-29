import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import { OrderAudioAlert } from "@/components/OrderAudioAlert";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      <OrderAudioAlert />
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default AdminLayout;
