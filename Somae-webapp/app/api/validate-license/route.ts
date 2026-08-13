import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// The extension (and local dev preview) call this endpoint cross-origin.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function json(data: object, status = 200) {
  return NextResponse.json(data, { status, headers: CORS_HEADERS });
}

export async function POST(req: Request) {
  try {
    const { license_key, device_hash, device_name, browser_info } = await req.json();

    if (!license_key || !device_hash) {
      return json({ valid: false, message: "Missing required fields" }, 400);
    }

    const license = await prisma.license.findUnique({
      where: { licenseKey: license_key },
      include: { activations: true },
    });

    if (!license) {
      return json({ valid: false, message: "Invalid license key" });
    }

    if (!license.isActive) {
      return json({ valid: false, message: "License is inactive" });
    }

    // Check if device is already activated
    const existingActivation = license.activations.find(
      (a: { deviceHash: string; id: string }) => a.deviceHash === device_hash
    );

    if (existingActivation) {
      // Update last seen
      await prisma.deviceActivation.update({
        where: { id: existingActivation.id },
        data: { lastSeenAt: new Date() },
      });

      return json({
        valid: true,
        remaining_devices: license.maxDevices - license.activatedDevices,
      });
    }

    // New device activation
    if (license.activatedDevices >= license.maxDevices) {
      return json({
        valid: false,
        message: "Device limit reached. Please deactivate another device first.",
      });
    }

    // Create new activation
    await prisma.$transaction([
      prisma.deviceActivation.create({
        data: {
          licenseId: license.id,
          deviceHash: device_hash,
          deviceName: device_name,
          browserInfo: browser_info,
        },
      }),
      prisma.license.update({
        where: { id: license.id },
        data: {
          activatedDevices: {
            increment: 1,
          },
        },
      }),
    ]);

    return json({
      valid: true,
      remaining_devices: license.maxDevices - (license.activatedDevices + 1),
    });
  } catch (error) {
    console.error("Validation error:", error);
    return json({ valid: false, message: "Internal Server Error" }, 500);
  }
}
