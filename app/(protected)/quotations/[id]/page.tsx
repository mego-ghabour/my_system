import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PrintableQuotation } from "@/components/PrintableQuotation";

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  const quotation = await prisma.quotation.findUnique({
    where: { id: resolvedParams.id },
    include: {
      client: true,
      items: true,
    },
  });

  if (!quotation) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <PrintableQuotation quotation={quotation} />
    </div>
  );
}
