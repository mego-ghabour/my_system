import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { serviceSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const services = await prisma.service.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(services);
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
    
    const validationResult = serviceSchema.safeParse(body);
    if (!validationResult.success) {
      return new NextResponse(validationResult.error.issues[0].message, { status: 400 });
    }

    const { name, description, price } = validationResult.data;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        basePrice: price,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("[SERVICES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
