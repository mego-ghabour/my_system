import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { clientSchema } from "@/lib/validations";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    const client = await prisma.client.findUnique({
      where: { id: resolvedParams.id },
      include: { stores: true }
    });

    if (!client) return new NextResponse("Not Found", { status: 404 });
    return NextResponse.json(client);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    const body = await req.json();
    
    const validationResult = clientSchema.safeParse(body);
    if (!validationResult.success) {
      return new NextResponse(validationResult.error.issues[0].message, { status: 400 });
    }

    const validData = validationResult.data;

    const client = await prisma.client.update({
      where: { id: resolvedParams.id },
      data: { 
        name: validData.name, 
        phone: validData.phone, 
        notes: validData.notes || null, 
        email: validData.email || null, 
        companyName: validData.companyName || null, 
        taxId: validData.taxId || null, 
        address: validData.address || null 
      },
    });

    return NextResponse.json(client);
  } catch (error: any) {
    console.error("[CLIENT_PUT_ERROR]", error);
    if (error.code === 'P2002') return new NextResponse("رقم الهاتف موجود مسبقاً", { status: 400 });
    return new NextResponse("Internal Error", { status: 500 });
  }
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    const body = await req.json();

    const client = await prisma.client.update({
      where: { id: resolvedParams.id },
      data: body,
    });

    return NextResponse.json(client);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
