import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { taskSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const tasks = await prisma.task.findMany({
      orderBy: [
        { completed: "asc" },
        { createdAt: "desc" }
      ]
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const validationResult = taskSchema.safeParse(body);
    if (!validationResult.success) {
      return new NextResponse(validationResult.error.issues[0].message, { status: 400 });
    }

    const { title } = validationResult.data;

    const task = await prisma.task.create({
      data: { title }
    });
    return NextResponse.json(task);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
