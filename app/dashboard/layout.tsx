import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import KiraciSidebar from "@/components/KiraciSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/giris");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <KiraciSidebar ad={session.ad} soyad={session.soyad} email={session.email} />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
