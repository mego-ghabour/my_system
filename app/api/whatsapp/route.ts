import { NextResponse } from "next/server";

const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || "http://127.0.0.1:3001";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${WHATSAPP_SERVICE_URL}/api/whatsapp/status`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        { status: "OFFLINE", error: "WhatsApp service returned an error" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      status: data.status,
      qrCode: data.qrCode,
      info: data.info || null,
      serviceOnline: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "OFFLINE",
        serviceOnline: false,
        qrCode: null,
        error: "خادم الواتساب غير متصل حالياً (port 3001)",
      },
      { status: 200 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body.action || "send";

    if (action === "send") {
      const res = await fetch(`${WHATSAPP_SERVICE_URL}/api/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: body.number,
          message: body.message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json(
          { error: data.error || "فشل إرسال الرسالة" },
          { status: res.status }
        );
      }
      return NextResponse.json(data);
    }

    if (action === "logout") {
      const res = await fetch(`${WHATSAPP_SERVICE_URL}/api/whatsapp/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "تعذر الاتصال بخدمة الواتساب" },
      { status: 503 }
    );
  }
}
