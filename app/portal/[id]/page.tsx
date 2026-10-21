import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ClientPortalView } from "@/components/ClientPortalView";

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  const client = await prisma.client.findUnique({
    where: { id: resolvedParams.id },
    include: {
      stores: true,
      invoices: {
        orderBy: { createdAt: "desc" },
      },
      quotations: {
        orderBy: { createdAt: "desc" },
      },
      tasks: {
        orderBy: { createdAt: "desc" },
      },
      tickets: {
        orderBy: { createdAt: "desc" },
      },
      contracts: {
        orderBy: { createdAt: "desc" },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!client) {
    notFound();
  }

  return <ClientPortalView client={client} />;
}
