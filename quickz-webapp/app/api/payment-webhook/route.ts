import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { generateLicenseKey } from "@/lib/license";
import { sendLicenseEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(body);
    const event = payload.event;

    if (event === "payment.captured") {
      const payment = payload.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const amount = payment.amount / 100;

      // Check idempotency
      const existingPayment = await prisma.payment.findUnique({
        where: { razorpayOrderId: orderId },
      });

      if (existingPayment && existingPayment.status === "COMPLETED") {
        return NextResponse.json({ status: "already processed" });
      }

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { razorpayOrderId: orderId },
        data: {
          razorpayPaymentId: paymentId,
          status: "COMPLETED",
          webhookVerified: true,
        },
      });

      // Generate and save license
      const licenseKey = generateLicenseKey();
      await prisma.license.create({
        data: {
          userId: updatedPayment.userId,
          licenseKey: licenseKey,
          paymentStatus: "COMPLETED",
          paymentId: paymentId,
          paymentAmount: parseFloat(amount.toString()),
          maxDevices: 2,
          isActive: true,
        },
      });

      // Fetch user to get email and name
      const user = await prisma.user.findUnique({
        where: { id: updatedPayment.userId },
      });

      if (user && user.email) {
        try {
          await sendLicenseEmail(user.email, user.name || "Customer", licenseKey);
        } catch (emailError) {
          console.error("Failed to send license email but license was created:", emailError);
        }
      }

      return NextResponse.json({ status: "success" });
    }

    return NextResponse.json({ status: "ignored event" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
