import { IconQr, IconShield, IconZap } from "./icons.jsx";
export default function HowItWorks(){
  const steps = [
    { icon: IconShield, title: "Choose a plan", text: "Pick Personal, Gaming, or Business. Sign up with your email." },
    { icon: IconQr,     title: "Create a device", text: "We generate a WireGuard config and email you a QR + file." },
    { icon: IconZap,    title: "Connect in seconds", text: "Scan the QR in the WireGuard app and you are protected." },
  ];
  return (
    <section className="container-xl py-16">
      <h2 className="text-3xl font-bold">How SACVPN works</h2>
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {(steps ?? []).map((s,i)=>(
          <div key={i} className="card p-6">
            <s.icon className="h-8 w-8 text-primary" />
            <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
            <p className="text-gray-700 mt-2">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
