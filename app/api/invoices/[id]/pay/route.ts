import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return new NextResponse("Invalid amount", { status: 400 });
    }

    // Run within a transaction to avoid race conditions
    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: resolvedParams.id } });
      if (!invoice) throw new Error("INVOICE_NOT_FOUND");

      const newPaid = invoice.paid + amount;
      if (newPaid > invoice.total) {
        throw new Error("OVERPAYMENT");
      }

      const status = newPaid === invoice.total ? "PAID" : "PARTIAL";

      return await tx.invoice.update({
        where: { id: resolvedParams.id },
        data: { paid: newPaid, status }
      });
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[INVOICE_PAY]", error);
    if (error.message === "OVERPAYMENT") return new NextResponse("المبلغ يفوق المتبقي من الفاتورة", { status: 400 });
    if (error.message === "INVOICE_NOT_FOUND") return new NextResponse("الفاتورة غير موجودة", { status: 404 });
    return new NextResponse("Internal Error", { status: 500 });
  }
}
