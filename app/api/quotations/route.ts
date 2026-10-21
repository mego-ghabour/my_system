import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const quotations = await prisma.quotation.findMany({
      include: {
        client: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(quotations);
  } catch (error) {
    console.error("[QUOTATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { clientId, items } = body;

    if (!clientId || !items || !items.length) {
      return new NextResponse("Client ID and Items are required", { status: 400 });
    }

    const total = items.reduce((acc: number, item: any) => acc + (parseFloat(item.price) || 0), 0);

    const quotation = await prisma.quotation.create({
      data: {
        clientId,
        total,
        status: "DRAFT",
        items: {
          create: items.map((item: any) => ({
            title: item.title,
            price: parseFloat(item.price),
          })),
        },
      },
      include: { client: true }
    });

    return NextResponse.json(quotation);
  } catch (error) {
    console.error("[QUOTATIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
