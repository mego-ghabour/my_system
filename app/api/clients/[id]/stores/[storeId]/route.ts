import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { storeSchema } from "@/lib/validations";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string, storeId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    
    await prisma.store.delete({
      where: { 
        id: resolvedParams.storeId,
        clientId: resolvedParams.id
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[STORE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string, storeId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    const body = await req.json();
    
    const validationResult = storeSchema.safeParse(body);
    if (!validationResult.success) {
      return new NextResponse(validationResult.error.issues[0].message, { status: 400 });
    }

    const validData = validationResult.data;

    await prisma.store.update({
      where: { 
        id: resolvedParams.storeId,
        clientId: resolvedParams.id
      },
      data: {
        name: validData.name,
        platformName: validData.platformName,
        storeLink: validData.storeLink || null,
        platformEmail: validData.platformEmail || null,
        platformPassword: validData.platformPassword || null,
      }
    });

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[STORE_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
