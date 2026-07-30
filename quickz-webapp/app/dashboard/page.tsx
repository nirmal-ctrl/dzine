import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { KeyRound, MonitorSmartphone, Zap } from "lucide-react";

interface ActivationType {
  id: string;
  deviceName: string | null;
  activatedAt: string | Date;
}

interface LicenseType {
  id: string;
  licenseKey: string;
  isActive: boolean;
  plan: string;
  activatedDevices: number;
  maxDevices: number;
  activations: ActivationType[];
}

interface PaymentType {
  id: string;
  razorpayOrderId: string;
  amount: number;
  status: string;
  createdAt: string | Date;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session.user as any).id;

  const licenses = await prisma.license.findMany({
    where: { userId },
    include: { activations: true },
    orderBy: { createdAt: "desc" },
  });

  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: session.user.name || "User",
          email: session.user.email || "",
          avatar: session.user.image || "",
        }}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/5 bg-white px-4 dark:border-white/10 dark:bg-card">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 bg-[#f8f8f8] p-5 dark:bg-background md:p-8">
          <div className="mx-auto max-w-6xl">
            {/* Page heading */}
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-[1.75rem] font-bold tracking-[-0.02em] text-foreground sm:text-[2rem]">
                  Dashboard
                </h1>
                <p className="mt-1 font-medium text-muted-foreground">
                  Manage your licenses, devices, and billing.
                </p>
              </div>
              <Link
                href="/buy"
                className="inline-flex items-center gap-2 rounded-full bg-[#0865ff] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(8,101,255,0.35)] transition-transform hover:scale-[1.03]"
              >
                <Zap className="size-4" /> Buy Quickz Pro
              </Link>
            </div>

            {/* License Section */}
            <section id="licenses" className="mb-10 scroll-mt-20">
              <h2 className="mb-4 text-xl font-bold tracking-[-0.01em] text-foreground">
                Your Licenses
              </h2>
              {licenses.length === 0 ? (
                <div className="rounded-[24px] bg-white p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:bg-card">
                  <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-[#0865ff]/10 text-[#0865ff]">
                    <KeyRound className="size-6" />
                  </span>
                  <p className="font-medium text-muted-foreground">
                    {"You don't have any active licenses yet."}
                  </p>
                  <Link
                    href="/pricing"
                    className="mt-6 inline-block rounded-full bg-black px-8 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.03] dark:bg-[#0865ff]"
                  >
                    Buy Quickz Pro
                  </Link>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {licenses.map((license: LicenseType) => (
                    <div
                      key={license.id}
                      className="rounded-[24px] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:bg-card sm:p-7"
                    >
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                            License Key
                          </span>
                          <p className="mt-1 break-all font-mono text-lg font-bold tracking-tight text-foreground">
                            {license.licenseKey}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${
                            license.isActive
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {license.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-[#f8f8f8] p-4 dark:bg-muted/40">
                          <p className="text-xs font-semibold text-muted-foreground">
                            Plan
                          </p>
                          <p className="mt-0.5 font-bold text-foreground">
                            {license.plan}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-[#f8f8f8] p-4 dark:bg-muted/40">
                          <p className="text-xs font-semibold text-muted-foreground">
                            Activations
                          </p>
                          <p className="mt-0.5 font-bold text-foreground">
                            {license.activatedDevices} / {license.maxDevices}
                          </p>
                        </div>
                      </div>

                      {license.activations.length > 0 && (
                        <div className="mt-5 border-t border-black/5 pt-5 dark:border-white/10">
                          <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                            <MonitorSmartphone className="size-3.5" />
                            Activated Devices
                          </p>
                          <ul className="space-y-2.5">
                            {license.activations.map(
                              (activation: ActivationType) => (
                                <li
                                  key={activation.id}
                                  className="flex items-center justify-between gap-3 text-sm"
                                >
                                  <span className="font-medium text-foreground">
                                    {activation.deviceName || "Unknown Device"}
                                  </span>
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {new Date(
                                      activation.activatedAt
                                    ).toLocaleDateString()}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Payment History */}
            <section id="payments" className="scroll-mt-20">
              <h2 className="mb-4 text-xl font-bold tracking-[-0.01em] text-foreground">
                Payment History
              </h2>
              <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left">
                    <thead className="border-b border-black/5 bg-[#f8f8f8] dark:border-white/10 dark:bg-muted/40">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Order ID
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Status
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/10">
                      {payments.map((payment: PaymentType) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 font-mono text-sm text-muted-foreground">
                            {payment.razorpayOrderId}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-foreground">
                            ₹{payment.amount}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                payment.status === "COMPLETED"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {payments.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-10 text-center font-medium text-muted-foreground"
                          >
                            No payments found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
