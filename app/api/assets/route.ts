import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const assets = await prisma.asset.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(assets);
  } catch (error) {
    console.error("[ASSETS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name, type, content } = body;

    if (!name || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const asset = await prisma.asset.create({
      data: {
        name,
        type: type || "TEXT",
        content,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error("[ASSETS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
