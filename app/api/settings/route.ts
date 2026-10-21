import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcrypt";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
      select: { id: true, name: true, email: true, avatarUrl: true, geminiKey: true }
    });

    return NextResponse.json(user);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { name, avatarUrl, geminiKey, currentPassword, newPassword } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string }
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    const updateData: any = { name, avatarUrl, geminiKey };

    if (newPassword) {
      if (!currentPassword) return new NextResponse("يجب إدخال كلمة المرور الحالية", { status: 400 });
      
      const isCorrect = await bcrypt.compare(currentPassword, user.password);
      if (!isCorrect) return new NextResponse("كلمة المرور الحالية غير صحيحة", { status: 400 });
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: { id: true, name: true, email: true, avatarUrl: true, geminiKey: true }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
