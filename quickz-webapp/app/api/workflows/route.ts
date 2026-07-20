import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const workflows = await prisma.workflow.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(workflows);
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const { name, description, nodes = [], edges = [] } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Workflow name is required" }, { status: 400 });
    }

    const workflow = await prisma.workflow.create({
      data: {
        userId,
        name,
        description,
        nodes: nodes || [],
        edges: edges || [],
      },
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error("Error creating workflow:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
