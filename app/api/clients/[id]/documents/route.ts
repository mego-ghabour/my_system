import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;
    const clientId = resolvedParams.id;

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const documentName = formData.get("name") as string;
    const storeId = formData.get("storeId") as string | null;

    if (!file || !documentName) {
      return new NextResponse("File and name are required", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save locally to public/uploads
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filepath = path.join(process.cwd(), "public", "uploads", filename);
    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/${filename}`;

    const document = await prisma.clientDocument.create({
      data: {
        clientId,
        storeId,
        name: documentName,
        fileUrl,
        type: file.type.includes("pdf") ? "PDF" : "IMAGE",
      }
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("[DOCUMENT_UPLOAD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
