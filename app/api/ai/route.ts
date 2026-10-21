import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, FunctionCallingMode } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { prompt } = await req.json();
    if (!prompt) return new NextResponse("Prompt is required", { status: 400 });

    // Fetch current user
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string }
    });

    const apiKey = user?.geminiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) return new NextResponse("Gemini API Key is not configured in Settings", { status: 400 });

    // Fetch database context
    const clients = await prisma.client.findMany({ include: { stores: true } });
    const invoices = await prisma.invoice.findMany({ include: { client: true, items: true } });
    const tasks = await prisma.task.findMany({ include: { client: true } });
    const tickets = await prisma.ticket.findMany({ include: { client: true } });
    const quotations = await prisma.quotation.findMany({ include: { client: true, items: true } });

    // Build the system context
    const systemContext = `
أنت مساعد ذكي مدمج في نظام CRM لإدارة أعمال مستقل (Freelancer). 
مهمتك هي الإجابة على أسئلة المستخدم باللغة العربية بأسلوب احترافي ودقيق وبناءً على البيانات الحالية في النظام فقط.

إليك ملخص شامل لبيانات النظام الحالية:

1. العملاء (${clients.length}):
${clients.map(c => `- ${c.name} (جوال: ${c.phone})، يملك ${c.stores.length} متجر`).join('\n')}

2. الفواتير (${invoices.length}):
${invoices.map(i => `- فاتورة للعميل ${i.client.name} بمبلغ ${i.total} ر.س. (المدفوع: ${i.paid} ر.س). الحالة: ${i.status === 'PAID' ? 'مدفوعة' : i.status === 'PARTIAL' ? 'مدفوعة جزئياً' : 'غير مدفوعة'}`).join('\n')}
(إجمالي الديون غير المسددة في كل النظام: ${invoices.reduce((acc, curr) => acc + (curr.total - curr.paid), 0)} ر.س)

3. عروض الأسعار (${quotations.length}):
${quotations.map(q => `- عرض للعميل ${q.client.name} بقيمة ${q.total} ر.س. الحالة: ${q.status}`).join('\n')}

4. المهام (${tasks.length}):
- المنجزة: ${tasks.filter(t => t.completed).length}
- غير المنجزة: ${tasks.filter(t => !t.completed).length}

5. تذاكر الدعم الفني (${tickets.length}):
${tickets.map(t => `- تذكرة: ${t.title} (العميل: ${t.client.name}). الحالة: ${t.status}`).join('\n')}

قواعد هامة للإجابة:
- لا تقم بتأليف بيانات غير موجودة في الملخص أعلاه.
- إذا سألك عن "من لم يدفع؟"، ابحث في الفواتير غير المدفوعة.
- إذا سألك عن الديون، اجمع المتبقي من الفواتير غير المدفوعة.
- هام جدا: لإضافة عميل أو مهمة، أنت لا تستطيع فعل ذلك بالنص! يجب عليك استخدام أداة (Tool) تسمى (createClient) أو (createTask).
- إذا طلب المستخدم إضافة عميل، قم فورا بتفعيل الأداة createClient وقم بتمرير اسم العميل ورقم هاتفه.
- إذا لم يذكر العميل رقم الهاتف، مرر الرقم الافتراضي "0000000000" للأداة.
- بعد أن تعمل الأداة بنجاح، يمكنك حينها الرد بأن العملية تمت بنجاح.

سؤال أو أمر المستخدم هو: ${prompt}
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3.5-flash",
        tools: [
          {
            functionDeclarations: [
              {
                name: "createTask",
                description: "إضافة مهمة جديدة إلى النظام (To-Do List)",
                parameters: {
                  type: SchemaType.OBJECT,
                  properties: {
                    title: { type: SchemaType.STRING, description: "عنوان المهمة المطلوبة" }
                  },
                  required: ["title"]
                }
              },
              {
                name: "createClient",
                description: "إضافة عميل جديد إلى قاعدة البيانات",
                parameters: {
                  type: SchemaType.OBJECT,
                  properties: {
                    name: { type: SchemaType.STRING, description: "اسم العميل" },
                    phone: { type: SchemaType.STRING, description: "رقم هاتف أو واتساب العميل" }
                  },
                  required: ["name", "phone"]
                }
              }
            ]
          }
        ],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingMode.AUTO
          }
        }
      });

      const chat = model.startChat();
      // First, send the system context so the AI knows the rules and current data
      await chat.sendMessage(systemContext);
      
      const result = await chat.sendMessage(prompt);
      
      const functionCalls = result.response.functionCalls();
      let responseText = "";

      try {
        responseText = result.response.text();
      } catch (e) {
        // If there's no text (only a function call), this will throw, but it's fine.
      }
      
      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        let actionResult = {};
        
        try {
          if (call.name === "createTask") {
            const args = call.args as any;
            await prisma.task.create({ data: { title: args.title } });
            actionResult = { success: true, message: "تمت إضافة المهمة بنجاح" };
          } 
          else if (call.name === "createClient") {
            const args = call.args as any;
            const phoneStr = args.phone || `0000-${Math.floor(Math.random() * 10000)}`;
            await prisma.client.create({ data: { name: args.name, phone: phoneStr } });
            actionResult = { success: true, message: "تمت إضافة العميل بنجاح" };
          }
        } catch (dbError: any) {
          if (dbError.code === 'P2002') {
            actionResult = { success: false, message: "عذراً، رقم الهاتف هذا مسجل لعميل آخر في النظام." };
          } else {
            actionResult = { success: false, message: "حدث خطأ غير متوقع أثناء الحفظ في قاعدة البيانات." };
          }
        }

        // Send the function response back to the model so it can formulate a human response
        const finalResult = await chat.sendMessage([{
          functionResponse: {
            name: call.name,
            response: actionResult
          }
        }]);
        
        responseText = finalResult.response.text();
      }

      return NextResponse.json({ text: responseText });
    } catch (e: any) {
      // LOCAL FALLBACK: If Google API is down (503/400/etc), answer from DB directly seamlessly!
      const userMsg = prompt.toLowerCase();
      let localAnswer = "";
      
      if (userMsg.includes("دين") || userMsg.includes("ديون") || userMsg.includes("غير مسدد")) {
        const totalDebt = invoices.reduce((acc, curr) => acc + (curr.total - curr.paid), 0);
        localAnswer += `إجمالي الديون غير المسددة في النظام هو **${totalDebt} ر.س**.`;
      } else if (userMsg.includes("من") && (userMsg.includes("لم يدفع") || userMsg.includes("مدين"))) {
        const unpaid = invoices.filter(i => i.status !== 'PAID');
        if (unpaid.length === 0) localAnswer += "لا يوجد أي عملاء عليهم ديون متأخرة حالياً.";
        else localAnswer += `قائمة العملاء الذين لم يسددوا بالكامل: \n` + unpaid.map(i => `- ${i.client.name} (المتبقي: ${i.total - i.paid} ر.س)`).join('\n');
      } else if (userMsg.includes("مهام") || userMsg.includes("تذاكر")) {
        localAnswer += `لديك حالياً ${tasks.filter(t => !t.completed).length} مهام غير منجزة، و ${tickets.filter(t => t.status === 'OPEN').length} تذاكر دعم فني مفتوحة بانتظار الرد.`;
      } else {
        localAnswer += "إليك ملخص سريع لبيانات النظام: \n" + 
        `- إجمالي العملاء المسجلين: ${clients.length}\n` + 
        `- المهام المعلقة: ${tasks.filter(t => !t.completed).length}\n` +
        `- إجمالي الديون المتأخرة: ${invoices.reduce((acc, curr) => acc + (curr.total - curr.paid), 0)} ر.س`;
      }

      return NextResponse.json({ text: localAnswer });
    }

  } catch (error: any) {
    console.error("[AI_ERROR]", error);
    const errorMessage = error?.message || "Internal Error";
    return new NextResponse(errorMessage, { status: 500 });
  }
}
