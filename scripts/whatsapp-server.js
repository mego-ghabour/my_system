const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const cors = require("cors");
const qrcode = require("qrcode");

const app = express();
app.use(cors());
app.use(express.json());

let qrCodeData = null;
let status = "DISCONNECTED"; // DISCONNECTED, CONNECTING, CONNECTED

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "./.wwebjs_auth" }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote",
    ],
  },
});

let qrLogged = false;
client.on("qr", async (qr) => {
  if (!qrLogged) {
    console.log("WhatsApp QR Code is ready to scan.");
    qrLogged = true;
  }
  status = "CONNECTING";
  // Generate base64 QR code image
  qrCodeData = await qrcode.toDataURL(qr);
});

client.on("ready", () => {
  console.log("Client is ready and authenticated!");
  status = "CONNECTED";
  qrCodeData = null; // Clear QR code as it's no longer needed
  qrLogged = false;
});

client.on("disconnected", (reason) => {
  console.log("Client was logged out", reason);
  status = "DISCONNECTED";
  qrCodeData = null;
  client.initialize(); // Restart client to get new QR
});

client.on("auth_failure", () => {
  console.error("Auth Failure");
  status = "DISCONNECTED";
});

// Initialize WhatsApp Client
client.initialize();

// API Endpoints for Next.js to communicate with
app.get("/api/whatsapp/status", (req, res) => {
  res.json({
    status,
    qrCode: qrCodeData,
    info: status === "CONNECTED" && client.info ? {
      phone: client.info.wid ? client.info.wid.user : "",
      name: client.info.pushname || "",
    } : null,
  });
});

app.post("/api/whatsapp/logout", async (req, res) => {
  try {
    if (client) {
      await client.logout();
    }
    status = "DISCONNECTED";
    qrCodeData = null;
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Failed to logout" });
  }
});

app.post("/api/whatsapp/send", async (req, res) => {
  if (status !== "CONNECTED") {
    return res.status(400).json({ error: "WhatsApp is not connected" });
  }

  const { number, message } = req.body;
  if (!number || !message) {
    return res.status(400).json({ error: "Number and message are required" });
  }

  try {
    const formattedNumber = number.includes("@c.us") ? number : `${number.replace(/\+/g, "").replace(/\s/g, "")}@c.us`;
    
    // Check if the number is registered on WhatsApp
    const numberDetails = await client.getNumberId(formattedNumber);
    if (!numberDetails) {
      return res.status(400).json({ error: "الرقم غير مسجل في الواتساب" });
    }

    await client.sendMessage(numberDetails._serialized, message);
    res.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Failed to send message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

const PORT = process.env.WHATSAPP_PORT || 3001;
const HOST = process.env.WHATSAPP_HOST || "127.0.0.1";
app.listen(PORT, HOST, () => {
  console.log(`WhatsApp Microservice running on http://${HOST}:${PORT}`);
});
