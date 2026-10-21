import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const { contractId, signatureData, signerName } = body;

    if (!contractId || !signatureData || !signerName) {
      return new NextResponse("بيانات التوقيع غير مكتملة", { status: 400 });
    }

    const contract = await prisma.contract.findFirst({
      where: { id: contractId, clientId: resolvedParams.id },
    });

    if (!contract) {
      return new NextResponse("العقد غير موجود", { status: 404 });
    }

    const updated = await prisma.contract.update({
      where: { id: contractId },
      data: {
        status: "SIGNED",
        signatureData,
        signerName,
        signedAt: new Date(),
      },
    });

    // Create client activity log
    await prisma.clientActivity.create({
      data: {
        clientId: resolvedParams.id,
        type: "CONTRACT_SIGNED",
        description: `قام العميل ${signerName} بتوقيع العقد "${contract.title}" إلكترونياً`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PORTAL_SIGN_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
