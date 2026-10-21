import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { invoiceSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    const validationResult = invoiceSchema.safeParse(body);
    if (!validationResult.success) {
      return new NextResponse(validationResult.error.issues[0].message, { status: 400 });
    }

    const { clientId, items, total, paid } = validationResult.data;

    const status = paid >= total ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID";

    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        total,
        paid,
        status,
        items: {
          create: items.map((item: any) => ({
            title: item.title,
            price: item.price,
          })),
        },
      },
      include: { client: true }
    });

    await prisma.clientActivity.create({
      data: {
        clientId,
        type: "INVOICE_CREATED",
        description: `تم إصدار فاتورة جديدة بقيمة ${total} ر.س`
      }
    });

    // Attempt to send an automated WhatsApp message to the client
    if (invoice.client && invoice.client.phone) {
      try {
        const message = `مرحباً ${invoice.client.name}،\n\nتم إصدار فاتورة جديدة بحسابكم بقيمة *${total} ر.س*.\nالمبلغ المتبقي للسداد: *${total - paid} ر.س*.\n\nشكراً لتعاملكم معنا!`;
        
        // Fire and forget (don't await so we don't block the response if WA is down)
        fetch("http://localhost:3001/api/whatsapp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ number: invoice.client.phone, message }),
        }).catch(err => console.error("WA Notify Error:", err));
      } catch (e) {
        console.error("WA Send Catch:", e);
      }
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("[INVOICES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
