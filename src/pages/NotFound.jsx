import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found - SACVPN</title>
        <meta name="robots" content="noindex, follow" />
        <meta name="description" content="The page you requested could not be found on SACVPN. Return to the homepage or browse our VPN plans." />
        <link rel="canonical" href="https://www.sacvpn.com/404" />
      </Helmet>

      <section className="container-xl py-24 text-center">
        <p className="text-secondary font-semibold uppercase tracking-wide">404</p>
        <h1 className="text-5xl font-bold text-primary mt-2">Page not found</h1>
        <p className="mt-4 text-lg text-gray-700 max-w-xl mx-auto">
          The page you were looking for does not exist or has moved. Try one of these instead.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link className="btn btn-primary" to="/">Home</Link>
          <Link className="btn btn-secondary" to="/pricing">Pricing</Link>
          <Link className="btn btn-secondary" to="/faq">FAQ</Link>
          <Link className="btn btn-secondary" to="/contact">Contact</Link>
        </div>
      </section>
    </>
  );
}
