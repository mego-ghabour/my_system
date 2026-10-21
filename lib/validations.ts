import * as z from "zod";

export const clientSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  phone: z.string().min(9, "رقم الجوال غير صحيح"),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  companyName: z.string().optional().or(z.literal("")),
  taxId: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  
  storeLink: z.string().url("رابط المتجر غير صحيح").optional().or(z.literal("")),
  platformName: z.string().optional().or(z.literal("")),
  platformEmail: z.string().optional().or(z.literal("")),
  platformPassword: z.string().optional().or(z.literal("")),
  
  status: z.enum(["ACTIVE", "INACTIVE", "LEAD", "VIP"]).optional().default("ACTIVE"),
});

export const storeSchema = z.object({
  name: z.string().min(1, "اسم المتجر مطلوب"),
  platformName: z.string().min(1, "اسم المنصة مطلوب"),
  storeLink: z.string().url("رابط المتجر غير صحيح").optional().or(z.literal("")),
  platformEmail: z.string().optional().or(z.literal("")),
  platformPassword: z.string().optional().or(z.literal("")),
});

export const documentSchema = z.object({
  title: z.string().min(1, "اسم المستند مطلوب"),
  fileUrl: z.string().url("رابط الملف غير صحيح"),
  fileType: z.string().optional(),
  storeId: z.string().optional(),
});

export const accountSchema = z.object({
  name: z.string().min(1, "اسم الحساب مطلوب"),
  username: z.string().optional(),
  password: z.string().optional(),
  link: z.string().optional(),
  storeId: z.string().optional(),
});

export const serviceSchema = z.object({
  name: z.string().min(2, "اسم الخدمة يجب أن يكون حرفين على الأقل"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "السعر يجب أن يكون رقماً موجباً"),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, "العميل مطلوب"),
  total: z.coerce.number().min(0, "الإجمالي غير صحيح"),
  paid: z.coerce.number().min(0, "المبلغ المدفوع غير صحيح").default(0),
  items: z.array(z.object({
    title: z.string().min(1, "وصف العنصر مطلوب"),
    price: z.coerce.number().min(0, "السعر غير صحيح"),
  })).min(1, "يجب إضافة عنصر واحد على الأقل"),
});

export const taskSchema = z.object({
  title: z.string().min(1, "عنوان المهمة مطلوب"),
  description: z.string().optional(),
  completed: z.boolean().default(false)
});
