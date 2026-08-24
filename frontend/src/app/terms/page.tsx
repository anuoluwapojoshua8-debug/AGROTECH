export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold">Terms of Service</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          By using AgroTech, you agree to these terms. Please read them carefully.
        </p>
        <h2 className="text-lg font-semibold text-foreground">1. Account Registration</h2>
        <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.</p>
        <h2 className="text-lg font-semibold text-foreground">2. Orders & Payments</h2>
        <p>All orders are subject to availability. We reserve the right to cancel orders if necessary. Payments are processed securely through our payment partners.</p>
        <h2 className="text-lg font-semibold text-foreground">3. Delivery</h2>
        <p>Delivery times are estimates and not guaranteed. We are not responsible for delays caused by circumstances beyond our control.</p>
        <h2 className="text-lg font-semibold text-foreground">4. Returns & Refunds</h2>
        <p>Please refer to our Refund Policy for information about returns and refunds.</p>
        <h2 className="text-lg font-semibold text-foreground">5. Limitation of Liability</h2>
        <p>AgroTech shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
      </div>
    </div>
  );
}
