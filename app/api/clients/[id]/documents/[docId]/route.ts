import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string, docId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    const body = await req.json();
    
    await prisma.clientDocument.update({
      where: { 
        id: resolvedParams.docId,
        clientId: resolvedParams.id
      },
      data: {
        name: body.name,
      }
    });

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[DOCUMENT_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string, docId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    
    await prisma.clientDocument.delete({
      where: { 
        id: resolvedParams.docId,
        clientId: resolvedParams.id
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DOCUMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
