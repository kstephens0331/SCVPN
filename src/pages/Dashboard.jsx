export default function Dashboard(){
  return (
    <section className="container-xl py-16">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      <p className="text-gray-700 mt-2">After Supabase + Stripe, you’ll see plan status and devices here.</p>
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="card p-6">Plan status</div>
        <div className="card p-6">Devices</div>
      </div>
    </section>
  );
}
