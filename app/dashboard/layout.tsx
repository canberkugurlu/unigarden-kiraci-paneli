import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import KiraciShell from "@/components/KiraciShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/giris");

  return (
    <KiraciShell ad={session.ad} soyad={session.soyad} email={session.email} rol={session.rol ?? "Aktif"}>
      {children}
    </KiraciShell>
  );
}
