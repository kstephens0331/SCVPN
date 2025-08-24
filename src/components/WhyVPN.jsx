import CheckItem from "./CheckItem.jsx";

export default function WhyVPN(){
  return (
    <section className="container-xl py-16">
      <h2 className="text-3xl font-bold text-center">Why you should use a VPN at home and in public</h2>
      
      {/* Row 1: General VPN reasons */}
      <div className="card p-6 mt-10">
        <h3 className="font-semibold text-lg mb-4">Everyday reasons to use a VPN</h3>
        <ul className="space-y-3 text-gray-800">
          <CheckItem>Prevent your ISP from tracking and selling your browsing history.</CheckItem>
          <CheckItem>Stop ISP throttling on streaming, video calls, and gaming.</CheckItem>
          <CheckItem>Unlock streaming services and regional content worldwide.</CheckItem>
          <CheckItem>Protect smart TVs, game consoles, and IoT devices at home.</CheckItem>
          <CheckItem>Secure online shopping and banking with encrypted traffic.</CheckItem>
          <CheckItem>Keep your kids safer online by masking household IP addresses.</CheckItem>
          <CheckItem>Maintain privacy on every device at home and away.</CheckItem>
          <CheckItem>Stay safe on public Wi-Fi (coffee shops, airports, hotels).</CheckItem>
        </ul>
      </div>

      {/* Row 2: SACVPN differentiators */}
      <div className="card p-6 mt-10">
        <h3 className="font-semibold text-lg mb-4">What makes SACVPN different</h3>
        <ul className="space-y-3 text-gray-800">
          <CheckItem>Unlimited devices on Personal & Gaming plans  cover every device in the house.</CheckItem>
          <CheckItem>One-click setup: QR code + clear email instructions for iOS, Android, Windows, macOS, and Linux.</CheckItem>
          <CheckItem>Dedicated gaming-optimized routes to reduce ping and packet loss.</CheckItem>
          <CheckItem>No-logs privacy policy  we never store your activity.</CheckItem>
          <CheckItem>Transparent Business pricing with clear device quotas (10, 50, 250+).</CheckItem>
          <CheckItem>WireGuard protocol for speed and modern cryptography.</CheckItem>
          <CheckItem>24/7 customer support from real people, not bots.</CheckItem>
          <CheckItem>Affordable plans starting at just $7.99/month.</CheckItem>
        </ul>
      </div>
    </section>
  );
}
