import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold text-2xl tracking-tighter text-black">Quickz</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4 text-black" href="/pricing">
            Pricing
          </Link>
          <span className="text-sm font-medium text-gray-500">
            {session.user.email}
          </span>
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-black">User Dashboard</h1>

          {/* License Section */}
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 text-black">Your Licenses</h2>
            {licenses.length === 0 ? (
              <div className="bg-white p-8 rounded-lg border text-center">
                <p className="text-gray-500 mb-4">You don't have any active licenses yet.</p>
                <Link
                  href="/pricing"
                  className="inline-block py-2 px-6 bg-black text-white rounded-md font-medium"
                >
                  Buy Quickz Pro
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {licenses.map((license) => (
                  <div key={license.id} className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">License Key</span>
                        <p className="text-xl font-mono font-bold text-black break-all">{license.licenseKey}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${license.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {license.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-500">Plan</p>
                        <p className="font-semibold text-black">{license.plan}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Activations</p>
                        <p className="font-semibold text-black">{license.activatedDevices} / {license.maxDevices}</p>
                      </div>
                    </div>
                    {license.activations.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Activated Devices</p>
                        <ul className="space-y-2">
                          {license.activations.map((activation) => (
                            <li key={activation.id} className="text-xs flex justify-between">
                              <span className="text-gray-600">{activation.deviceName || 'Unknown Device'}</span>
                              <span className="text-gray-400">{new Date(activation.activatedAt).toLocaleDateString()}</span>
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
          <section>
            <h2 className="text-xl font-bold mb-4 text-black">Payment History</h2>
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{payment.razorpayOrderId}</td>
                      <td className="px-6 py-4 text-sm text-black font-semibold">₹{payment.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${payment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No payments found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
