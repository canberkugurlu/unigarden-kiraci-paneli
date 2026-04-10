export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Megaphone } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function DuyurularPage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  const sozlesme = await prisma.sozlesme.findFirst({
    where: { ogrenciId: session.id, durum: "Aktif" },
    include: { konut: { select: { etap: true } } },
  });
  const etap = sozlesme?.konut.etap;

  const duyurular = await prisma.duyuru.findMany({
    where: {
      yayinda: true,
      OR: [
        { hedef: "Tumu" },
        ...(etap ? [{ hedef: `Etap${etap}` }] : []),
        { hedef: { contains: session.id } },
      ],
    },
    orderBy: { tarih: "desc" },
  });

  const fmtT = (d: Date | string) => format(new Date(d), "d MMMM yyyy", { locale: tr });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Duyurular</h1>
        <span className="text-xs text-gray-400">{duyurular.length} duyuru</span>
      </div>

      {duyurular.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Megaphone size={48} className="mx-auto mb-4 opacity-30" />
          <p>Şu an aktif duyuru yok</p>
        </div>
      ) : (
        <div className="space-y-4">
          {duyurular.map((d, i) => (
            <div key={d.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ${i === 0 ? "ring-2 ring-emerald-200" : ""}`}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${i === 0 ? "bg-emerald-100" : "bg-gray-100"}`}>
                  <Megaphone size={16} className={i === 0 ? "text-emerald-600" : "text-gray-400"} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h2 className="font-semibold text-gray-800">{d.baslik}</h2>
                    {i === 0 && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Yeni</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{d.icerik}</p>
                  <p className="text-xs text-gray-400 mt-3">{fmtT(d.tarih)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
