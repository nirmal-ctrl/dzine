import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WorkflowEditorClient } from "./WorkflowEditorClient";

export default async function WorkflowsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  return <WorkflowEditorClient session={session} />;
}
