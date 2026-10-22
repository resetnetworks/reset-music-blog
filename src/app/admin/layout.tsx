import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import AdminUser from "@/models/AdminUser";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  await dbConnect();
  const user = await AdminUser.findById(session.userId).lean();

  if (!user || (user.role !== "admin" && user.role !== "hr")) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <AdminSidebar user={JSON.parse(JSON.stringify(user))} />
        <main className="flex-1 min-w-0">
          <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
