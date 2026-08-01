import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BlocksGuideClient } from "./BlocksGuideClient";

export default async function BlocksPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  return <BlocksGuideClient session={session} />;
}
