import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { clientSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(clients);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    // Zod Validation
    const validationResult = clientSchema.safeParse(body);
    if (!validationResult.success) {
      return new NextResponse(validationResult.error.issues[0].message, { status: 400 });
    }

    const validData = validationResult.data;

    const client = await prisma.client.create({
      data: {
        name: validData.name,
        phone: validData.phone,
        email: validData.email || null,
        companyName: validData.companyName || null,
        taxId: validData.taxId || null,
        address: validData.address || null,
        notes: validData.notes || null,
        status: validData.status,
        activities: {
          create: [{
            type: "CLIENT_CREATED",
            description: "تم إضافة العميل وتسجيله في النظام"
          }]
        },
        stores: (validData.storeLink || validData.platformName) ? {
          create: [{
            storeLink: validData.storeLink || null,
            platformName: validData.platformName || "متجر جديد",
            platformEmail: validData.platformEmail || null,
            platformPassword: validData.platformPassword || null,
          }]
        } : undefined,
      },
      include: {
        stores: true,
      }
    });

    return NextResponse.json(client);
  } catch (error: any) {
    console.error("[CLIENTS_POST]", error);
    if (error.code === 'P2002') {
      return new NextResponse("رقم الجوال مسجل مسبقاً", { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
