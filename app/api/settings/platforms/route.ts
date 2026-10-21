import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });
    
    const platforms = await prisma.platformOption.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json(platforms);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });
    
    const { name } = await req.json();
    if (!name) return new NextResponse("Name required", { status: 400 });
    
    const platform = await prisma.platformOption.create({
      data: { name }
    });
    return NextResponse.json(platform);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
