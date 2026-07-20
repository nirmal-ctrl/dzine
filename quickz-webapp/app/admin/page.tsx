import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

interface PaymentWithUser {
  id: string;
  amount: number;
  status: string;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

interface LicenseWithUser {
  id: string;
  licenseKey: string;
  isActive: boolean;
  user?: {
    email?: string | null;
  } | null;
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    // Check if the email matches the ADMIN_EMAIL in .env
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        redirect("/dashboard");
    }
  }

  const usersCount = await prisma.user.count();
  const licensesCount = await prisma.license.count();
  const totalRevenue = await prisma.payment.aggregate({
    where: { status: "COMPLETED" },
    _sum: { amount: true },
  });

  const recentPayments = await prisma.payment.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  const recentLicenses = await prisma.license.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold text-2xl tracking-tighter text-black">Quickz Admin</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4 text-black" href="/dashboard">
            User Dashboard
          </Link>
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-black">Admin Control Panel</h1>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <p className="text-sm text-gray-500 uppercase font-bold">Total Users</p>
              <p className="text-3xl font-bold text-black">{usersCount}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <p className="text-sm text-gray-500 uppercase font-bold">Licenses Issued</p>
              <p className="text-3xl font-bold text-black">{licensesCount}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <p className="text-sm text-gray-500 uppercase font-bold">Total Revenue</p>
              <p className="text-3xl font-bold text-black">₹{totalRevenue._sum.amount || 0}</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Recent Payments */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-black">Recent Payments</h2>
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">User</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {recentPayments.map((payment: PaymentWithUser) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-4">
                          <p className="font-medium text-black">{payment.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{payment.user?.email}</p>
                        </td>
                        <td className="px-4 py-4 text-black font-semibold">₹{payment.amount}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${payment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Recent Licenses */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-black">Recent Licenses</h2>
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">License Key</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">User</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {recentLicenses.map((license: LicenseWithUser) => (
                      <tr key={license.id}>
                        <td className="px-4 py-4 font-mono text-black">{license.licenseKey}</td>
                        <td className="px-4 py-4 text-gray-600">{license.user?.email}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${license.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {license.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
