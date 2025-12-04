import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Shield,
  Wifi,
  WifiOff,
  Clock,
  Gift,
  ChevronRight,
  Copy,
  Check,
  Zap,
  Globe,
  Activity
} from "lucide-react";

export default function PersonalOverview() {
  const [devices, setDevices] = useState([]);
  const [conn, setConn] = useState({});
  const [profile, setProfile] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      // Fetch devices
      const { data: d1 } = await supabase.from("devices").select("id");
      setDevices(d1 || []);

      // Fetch connection status
      const { data: d2 } = await supabase.from("device_latest_telemetry").select("device_id,is_connected");
      const map = Object.fromEntries((d2 || []).map((x) => [x.device_id, x.is_connected]));
      setConn(map);

      // Fetch user profile for trial/subscription info
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profileData);
      }
    })();
  }, []);

  const connected = useMemo(() => devices.filter((d) => conn[d.id]).length, [devices, conn]);

  // Calculate trial status (mock - adjust based on your actual data structure)
  const isOnTrial = profile?.subscription_status === "trialing" || !profile?.subscription_status;
  const trialDaysLeft = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24)))
    : 14;

  // Generate referral link (mock - adjust based on your actual implementation)
  const referralCode = profile?.referral_code || "SACVPN2024";
  const referralLink = `https://sacvpn.com/ref/${referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Activity className="w-4 h-4" />
          <span>Last updated: just now</span>
        </div>
      </div>

      {/* Trial Status Banner (only show if on trial) */}
      {isOnTrial && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <Clock className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Free Trial Active</h3>
                <p className="text-green-300/80">
                  {trialDaysLeft} days remaining • No credit card required
                </p>
              </div>
            </div>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg shadow-green-500/25 hover:shadow-xl transition-all"
            >
              Upgrade Now
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Devices */}
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
          <div className="absolute top-0 right-0 w-20 h-20 bg-brand-500/10 rounded-full blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-brand-500/20">
                <Globe className="w-5 h-5 text-brand-400" />
              </div>
              <span className="text-gray-400 text-sm font-medium">Total Devices</span>
            </div>
            <div className="text-4xl font-bold text-white">{devices.length}</div>
            <p className="text-gray-500 text-sm mt-1">Registered devices</p>
          </div>
        </div>

        {/* Connected */}
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Wifi className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-gray-400 text-sm font-medium">Connected</span>
            </div>
            <div className="text-4xl font-bold text-white">{connected}</div>
            <p className="text-gray-500 text-sm mt-1">Active connections</p>
          </div>
        </div>

        {/* VPN Status */}
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
          <div className={`absolute top-0 right-0 w-20 h-20 ${connected > 0 ? 'bg-green-500/10' : 'bg-gray-500/10'} rounded-full blur-xl`} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${connected > 0 ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                {connected > 0 ? (
                  <Shield className="w-5 h-5 text-green-400" />
                ) : (
                  <WifiOff className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <span className="text-gray-400 text-sm font-medium">VPN Status</span>
            </div>
            <div className={`text-4xl font-bold ${connected > 0 ? 'text-green-400' : 'text-gray-400'}`}>
              {connected > 0 ? "Protected" : "Idle"}
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {connected > 0 ? "Your traffic is encrypted" : "No active connections"}
            </p>
          </div>
        </div>

        {/* Protocol */}
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
          <div className="absolute top-0 right-0 w-20 h-20 bg-accent-cyan/10 rounded-full blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-accent-cyan/20">
                <Zap className="w-5 h-5 text-accent-cyan" />
              </div>
              <span className="text-gray-400 text-sm font-medium">Protocol</span>
            </div>
            <div className="text-4xl font-bold text-white">WireGuard</div>
            <p className="text-gray-500 text-sm mt-1">Fastest VPN protocol</p>
          </div>
        </div>
      </div>

      {/* Referral Program Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-pink/10 to-purple-500/10 border border-accent-pink/20 p-6">
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-pink/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-accent-pink/20">
                <Gift className="w-6 h-6 text-accent-pink" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Refer Friends, Earn Rewards</h3>
                <p className="text-gray-400">Both you and your friend get 1 free month</p>
              </div>
            </div>
          </div>

          <div className="bg-black/20 rounded-xl p-4 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-1">Your referral link</p>
              <p className="text-sm text-white font-mono truncate">{referralLink}</p>
            </div>
            <button
              onClick={copyReferralLink}
              className={`p-3 rounded-xl transition-all ${
                copied
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-pink" />
              <span className="text-gray-400">
                <span className="text-white font-semibold">0</span> friends referred
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-gray-400">
                <span className="text-white font-semibold">0</span> months earned
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/personal/devices"
          className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-white mb-1">Manage Devices</h4>
              <p className="text-gray-400 text-sm">Add, remove, or configure devices</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          to="/personal/settings"
          className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-white mb-1">Account Settings</h4>
              <p className="text-gray-400 text-sm">Update profile and preferences</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          to="/faq"
          className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-white mb-1">Help & Support</h4>
              <p className="text-gray-400 text-sm">FAQs and setup guides</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>
    </div>
  );
}
