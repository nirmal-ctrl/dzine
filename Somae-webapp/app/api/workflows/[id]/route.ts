import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as { id: string }).id;

    const workflow = await prisma.workflow.findFirst({
      where: { id, userId },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error("Error fetching workflow:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const { name, description, nodes, edges, isActive } = body;

    const workflow = await prisma.workflow.findFirst({
      where: { id, userId },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const updatedWorkflow = await prisma.workflow.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(nodes !== undefined && { nodes }),
        ...(edges !== undefined && { edges }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(updatedWorkflow);
  } catch (error) {
    console.error("Error updating workflow:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as { id: string }).id;

    const workflow = await prisma.workflow.findFirst({
      where: { id, userId },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    await prisma.workflow.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workflow:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
