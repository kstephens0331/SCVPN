import FAQComparison from "../components/FAQComparison.jsx";

export default function FAQ(){
  const faqs = [
    { q:"How many devices can I use?", a:"Personal and Gaming allow unlimited devices; Business tiers include fixed quotas (10, 50, 250+)." },
    { q:"Do you keep logs?", a:"No. SACVPN enforces a strict no-logs policy. We never track browsing activity, DNS requests, or IP addresses." },
    { q:"What protocol do you use?", a:"WireGuard only. It’s faster, simpler, and more secure than older VPN protocols like OpenVPN or IKEv2." },
    { q:"Will SACVPN slow down my internet?", a:"Our servers typically deliver 450–900 Mbps down and 8–20 ms latency to nearby regions. Actual results depend on distance, ISP, and peering." },
    { q:"Do you offer a refund or free trial?", a:"Yes. We provide a 7-day money-back guarantee if you are unsatisfied." },
    { q:"Can I use SACVPN for streaming?", a:"Yes. We help unlock geo-restricted content and prevent ISP throttling while streaming." },
    { q:"Is SACVPN good for gaming?", a:"Yes. Our Gaming plan uses optimized routes to reduce latency and packet loss." },
    { q:"How do I set up a device?", a:"After creating a device in your dashboard, you’ll receive a QR code and config file via email with step-by-step instructions." },
    { q:"What payment methods do you accept?", a:"We support major credit cards and will integrate PayPal/crypto in the future." },
    { q:"How do Business plans work?", a:"Business plans are priced by device quota (10, 50, 250+). Admins can add/revoke devices and manage employee access." },
    { q:"Where are your servers located?", a:"We deploy servers in North America, Europe, and Asia. Additional regions will be added based on demand." },
    { q:"Do you offer support?", a:"Yes, 24/7 customer support via email, with live chat in progress." },
  ];

  return (
    <section className="container-xl py-16">
      <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
      <div className="mt-8 grid gap-4">
        {faqs.map((f,i)=>(
          <div key={i} className="card p-5">
            <h3 className="font-semibold">{f.q}</h3>
            <p className="text-gray-700 mt-2">{f.a}</p>
          </div>
        ))}
      </div>

      {/* Competitor comparison below FAQ */}
      <FAQComparison />
    </section>
  );
}