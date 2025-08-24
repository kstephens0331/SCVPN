import { IconLock, IconGauge } from "./icons.jsx";
import CheckItem from "./CheckItem.jsx";

export default function Security(){
  return (
    <section className="container-xl py-16">
      {/* Row 1: Security details */}
      <div className="grid md:grid-cols-2 gap-10 items-start">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <IconLock className="h-8 w-8 text-primary"/>Security you can trust
          </h2>
          <p className="text-gray-700 mt-3">
            We use WireGuard with modern cryptography and a strict no-logs approach. Your traffic is encrypted end-to-end inside the tunnel.
          </p>
          <ul className="mt-4 space-y-2 text-gray-800">
            <CheckItem>WireGuard-only protocol for speed and simplicity.</CheckItem>
            <CheckItem>Modern cryptography with minimal overhead for high throughput.</CheckItem>
            <CheckItem>No-logs policy: we do not track your browsing activity.</CheckItem>
            <CheckItem>DNS over the tunnel to reduce leaks and profiling.</CheckItem>
            <CheckItem>Key-based access for each device; revoke a device at any time.</CheckItem>
            <CheckItem>Server images kept minimal and regularly updated.</CheckItem>
          </ul>
        </div>

        {/* Performance callout */}
        <div className="card p-6">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <IconGauge className="h-6 w-6 text-primary"/>Built for speed
          </h3>
          <p className="text-gray-700 mt-2">
            WireGuard�s lightweight design means faster connections and lower CPU usage, ideal for gaming and streaming.
          </p>

          {/* Performance snapshot */}
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <Stat label="Typical download" value="450-900 Mbps" />
            <Stat label="Typical upload" value="350-800 Mbps" />
            <Stat label="Latency to nearest region" value="8-20 ms" />
            <Stat label="Gaming route improvement" value="10-30% lower ping" />
          </div>

          <p className="text-xs text-gray-600 mt-4">
            *These figures are from internal test environments and represent typical results under good conditions.
            Actual performance varies by distance to server, local ISP, time of day, peering, device hardware, and network congestion.
            We cannot guarantee specific speeds or latency.*
          </p>
        </div>
      </div>
    </section>
  );
}

/* Local stat component (kept here for simplicity) */
function Stat({ label, value }){
  return (
    <div className="rounded-xl border border-black/10 p-4">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
