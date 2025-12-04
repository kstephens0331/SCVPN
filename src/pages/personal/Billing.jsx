import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  CreditCard,
  Receipt,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Loader2,
  Shield,
  Zap,
  Crown,
  ArrowUpRight,
  DollarSign,
  FileText,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

const STATUS_STYLES = {
  active: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400", icon: CheckCircle },
  trialing: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", icon: Clock },
  past_due: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", icon: AlertCircle },
  canceled: { bg: "bg-gray-500/10", border: "border-gray-500/20", text: "text-gray-400", icon: AlertCircle },
  paid: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400", icon: CheckCircle },
  pending: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400", icon: Clock },
  failed: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", icon: AlertCircle },
};

export default function PersonalBilling() {
  const [sub, setSub] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: s } = await supabase
          .from("subscriptions")
          .select("id,plan,status,renews_at,created_at")
          .eq("user_id", user.id)
          .maybeSingle();
        setSub(s || null);

        const { data: i } = await supabase
          .from("invoices")
          .select("id,amount_cents,currency,status,period_start,period_end,paid_at")
          .eq("user_id", user.id)
          .order("period_start", { ascending: false })
          .limit(10);
        setInvoices(i || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert("Please sign in to manage billing");
        return;
      }

      const response = await fetch(`${API_URL}/api/billing/manage`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.redirected) {
        window.location.href = response.url;
      } else if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to access billing portal");
      } else {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (err) {
      console.error("Billing error:", err);
      alert("Failed to access billing portal");
    } finally {
      setPortalLoading(false);
    }
  }

  const statusStyle = STATUS_STYLES[sub?.status] || STATUS_STYLES.pending;
  const StatusIcon = statusStyle.icon;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (cents, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  const getPlanIcon = (plan) => {
    if (!plan) return Shield;
    const lower = plan.toLowerCase();
    if (lower.includes("gaming")) return Zap;
    if (lower.includes("business")) return Crown;
    return Shield;
  };

  const PlanIcon = getPlanIcon(sub?.plan);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Billing</h2>
          <p className="text-gray-400 text-sm mt-1">Manage your subscription and payment history</p>
        </div>
      </div>

      {/* Current Plan Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500/10 via-accent-purple/10 to-accent-cyan/10 border border-white/10 p-6">
        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-purple/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center shadow-lg shadow-brand-500/30">
                <PlanIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {sub?.plan || "No Active Plan"}
                </h3>
                {sub ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text} border`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm mt-1">Start your 14-day free trial today</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {sub ? (
                <button
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium transition-all disabled:opacity-50"
                >
                  {portalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Manage Billing
                      <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-accent-purple text-white font-semibold shadow-lg shadow-brand-500/25 hover:shadow-xl transition-all"
                >
                  <Zap className="w-4 h-4" />
                  Choose a Plan
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {sub?.renews_at && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Next billing date:</span>
                  <span className="text-white font-medium">{formatDate(sub.renews_at)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              Total Paid
            </div>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(
                invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount_cents, 0)
              )}
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand-500/10 rounded-full blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Receipt className="w-4 h-4 text-brand-400" />
              Invoices
            </div>
            <div className="text-3xl font-bold text-white">{invoices.length}</div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
          <div className="absolute top-0 right-0 w-16 h-16 bg-accent-cyan/10 rounded-full blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Calendar className="w-4 h-4 text-accent-cyan" />
              Member Since
            </div>
            <div className="text-2xl font-bold text-white">
              {sub?.created_at ? formatDate(sub.created_at) : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-400" />
            Invoice History
          </h3>
        </div>

        {invoices.length === 0 ? (
          <div className="p-8 text-center">
            <Receipt className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No invoices yet</p>
            <p className="text-gray-500 text-sm mt-1">Your billing history will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-white/10">
                  <th className="px-6 py-4 text-gray-400 font-medium">Period</th>
                  <th className="px-6 py-4 text-gray-400 font-medium">Amount</th>
                  <th className="px-6 py-4 text-gray-400 font-medium">Status</th>
                  <th className="px-6 py-4 text-gray-400 font-medium">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map((iv) => {
                  const invStyle = STATUS_STYLES[iv.status] || STATUS_STYLES.pending;
                  const InvIcon = invStyle.icon;
                  return (
                    <tr key={iv.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white">
                        {formatDate(iv.period_start)} — {formatDate(iv.period_end)}
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        {formatCurrency(iv.amount_cents, iv.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${invStyle.bg} ${invStyle.border} ${invStyle.text} border`}>
                          <InvIcon className="w-3.5 h-3.5" />
                          {iv.status.charAt(0).toUpperCase() + iv.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {iv.paid_at ? formatDate(iv.paid_at) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/faq"
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
          >
            <div className="p-2 rounded-lg bg-brand-500/20 text-brand-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Billing FAQ</p>
              <p className="text-gray-400 text-sm">Common billing questions</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
          </Link>
          <Link
            to="/contact"
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
          >
            <div className="p-2 rounded-lg bg-accent-purple/20 text-accent-purple">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Contact Support</p>
              <p className="text-gray-400 text-sm">Get help with billing issues</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
