export default function Contact(){
  return (
    <section className="container-xl py-16">
      <h1 className="text-4xl font-bold">Contact</h1>
      <p className="text-gray-700 mt-2">Tell us what you need and we'll get back to you.</p>
      <form className="card p-6 mt-8 grid gap-4 max-w-2xl">
        <input className="border rounded-xl px-4 py-3" placeholder="Your email" />
        <textarea rows="6" className="border rounded-xl px-4 py-3" placeholder="How can we help?" />
        <button type="button" className="button-primary w-full md:w-auto">Send</button>
      </form>
    </section>
  );
}
