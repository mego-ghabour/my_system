import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { accountSchema } from "@/lib/validations";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string, accountId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    
    await prisma.clientAccount.delete({
      where: { 
        id: resolvedParams.accountId,
        clientId: resolvedParams.id
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[ACCOUNT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string, accountId: string }> }) {
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

    await prisma.clientAccount.update({
      where: { 
        id: resolvedParams.accountId,
        clientId: resolvedParams.id
      },
      data: {
        name: validData.name,
        username: validData.username || null,
        password: validData.password || null,
        link: validData.link || null,
      }
    });

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[ACCOUNT_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
