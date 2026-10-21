import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { accountSchema } from "@/lib/validations";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    const body = await req.json();
    
    const validationResult = accountSchema.safeParse(body);
    if (!validationResult.success) {
      return new NextResponse(validationResult.error.issues[0].message, { status: 400 });
    }

    const validData = validationResult.data;

    const account = await prisma.clientAccount.create({
      data: {
        clientId: resolvedParams.id,
        name: validData.name,
        username: validData.username || null,
        password: validData.password || null,
        link: validData.link || null,
        storeId: validData.storeId || null,
      },
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error("[ACCOUNT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
