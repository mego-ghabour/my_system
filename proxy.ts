export { default as proxy } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/financials/:path*",
    "/quotations/:path*",
    "/tasks/:path*",
    "/assets/:path*",
    "/whatsapp/:path*",
  ],
};
