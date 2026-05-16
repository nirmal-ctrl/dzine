import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-lg p-8 bg-white rounded-xl shadow-lg border text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-4xl text-green-600">✔</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your Quickz Pro Lifetime License has been generated and sent to your email.
        </p>
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="block w-full py-4 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
          >
            Go to Dashboard
          </Link>
          <p className="text-sm text-gray-500">
            You can now activate the Chrome extension using your new license key.
          </p>
        </div>
      </div>
    </div>
  );
}
