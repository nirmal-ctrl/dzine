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
          avatar: session.user.image || "" 
        }} 
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4">
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

        <main className="flex-1 p-4 md:p-8 bg-muted/20">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-foreground">User Dashboard</h1>

            {/* License Section */}
            <section id="licenses" className="mb-12 scroll-mt-20">
              <h2 className="text-xl font-bold mb-4 text-foreground">Your Licenses</h2>
              {licenses.length === 0 ? (
                <div className="bg-card p-8 rounded-lg border text-center">
                  <p className="text-muted-foreground mb-4">{"You don't have any active licenses yet."}</p>
                  <Link
                    href="/pricing"
                    className="inline-block py-2 px-6 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
                  >
                    Buy Quickz Pro
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {licenses.map((license: LicenseType) => (
                    <div key={license.id} className="bg-card p-6 rounded-lg border shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">License Key</span>
                          <p className="text-xl font-mono font-bold text-foreground break-all">{license.licenseKey}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${license.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-destructive/10 text-destructive'}`}>
                          {license.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Plan</p>
                          <p className="font-semibold text-foreground">{license.plan}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Activations</p>
                          <p className="font-semibold text-foreground">{license.activatedDevices} / {license.maxDevices}</p>
                        </div>
                      </div>
                      {license.activations.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Activated Devices</p>
                          <ul className="space-y-2">
                            {license.activations.map((activation: ActivationType) => (
                              <li key={activation.id} className="text-xs flex justify-between">
                                <span className="text-foreground">{activation.deviceName || 'Unknown Device'}</span>
                                <span className="text-muted-foreground">{new Date(activation.activatedAt).toLocaleDateString()}</span>
                              </li>
                            ))}
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
              <h2 className="text-xl font-bold mb-4 text-foreground">Payment History</h2>
              <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Order ID</th>
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Amount</th>
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payments.map((payment: PaymentType) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{payment.razorpayOrderId}</td>
                        <td className="px-6 py-4 text-sm text-foreground font-semibold">₹{payment.amount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${payment.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No payments found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
