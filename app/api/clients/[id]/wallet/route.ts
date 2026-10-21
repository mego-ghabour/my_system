import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    const body = await req.json();
    const { amount, type, notes } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return new NextResponse("Invalid amount", { status: 400 });
    }
    if (!["CREDIT", "DEBIT"].includes(type)) {
      return new NextResponse("Invalid type", { status: 400 });
    }

    // Use transaction to update balance and create record safely
    await prisma.$transaction(async (tx) => {
      const client = await tx.client.findUnique({ where: { id: resolvedParams.id } });
      if (!client) throw new Error("Client not found");

      let newBalance = client.walletBalance || 0;
      if (type === "CREDIT") {
        newBalance += amount;
      } else {
        newBalance -= amount;
      }

      await tx.client.update({
        where: { id: resolvedParams.id },
        data: { walletBalance: newBalance }
      });

      await tx.walletTransaction.create({
        data: {
          clientId: resolvedParams.id,
          amount,
          type,
          notes: notes || null
        }
      });
    });

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[WALLET_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
