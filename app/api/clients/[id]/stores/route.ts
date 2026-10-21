import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { storeSchema } from "@/lib/validations";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const store = await prisma.store.create({
      data: {
        clientId: resolvedParams.id,
        name: validData.name,
        platformName: validData.platformName,
        storeLink: validData.storeLink || null,
        platformEmail: validData.platformEmail || null,
        platformPassword: validData.platformPassword || null,
      },
    });

    await prisma.clientActivity.create({
      data: {
        clientId: resolvedParams.id,
        type: "STORE_ADDED",
        description: `تم إضافة متجر جديد: ${validData.name} (${validData.platformName})`
      }
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error("[STORE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
