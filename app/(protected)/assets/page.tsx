import { prisma } from "@/lib/db";
import { AssetsClient } from "@/components/AssetsClient";

export default async function AssetsPage() {
  const assets = await prisma.asset.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <AssetsClient initialAssets={assets} />
    </div>
  );
}
