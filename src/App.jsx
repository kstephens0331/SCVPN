import AppLanding from './pages/AppLanding';
import RequireAuth from "./components/RequireAuth";
import PersonalLayout from "./pages/personal/Layout";
import PersonalOverview from "./pages/personal/Overview";
import PersonalDevices from "./pages/personal/Devices";
import PersonalAccount from "./pages/personal/Account";
import PersonalBilling from "./pages/personal/Billing";

import AdminLayout from "./pages/admin/layout";
import AdminOverview from "./pages/admin/overview";
import AdminAccounts from "./pages/admin/accounts";
import AdminDevices from "./pages/admin/devices";
import AdminTelemetry from "./pages/admin/telemetry";
import AdminServers from "./pages/admin/servers";
import AdminAnalytics from "./pages/admin/analytics";
import AdminRoute from "./components/AdminRoute";

import BusinessLayout from "./pages/business/Layout";
import BusinessOverview from "./pages/business/Overview";
import BusinessDevices from "./pages/business/Devices";
import BusinessAccount from "./pages/business/Account";
import BusinessBilling from "./pages/business/Billing";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import PricingFinal from "./pages/PricingFinal.jsx";
import FAQ from "./pages/FAQ.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import About from "./pages/About.jsx";
import Blog from "./pages/Blog.jsx";
import BlogPost from "./pages/BlogPost.jsx";
import PostCheckout from "./pages/PostCheckout";
import AuthCallback from "./pages/AuthCallback";
import TermsOfService from "./pages/TermsOfService.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import Download from "./pages/Download.jsx";
import Tools from "./pages/Tools.jsx";

// Industry Landing Pages
import HealthcareVPN from "./pages/industries/HealthcareVPN.jsx";
import LegalVPN from "./pages/industries/LegalVPN.jsx";
import FinanceVPN from "./pages/industries/FinanceVPN.jsx";
import RemoteTeamsVPN from "./pages/industries/RemoteTeamsVPN.jsx";
import SmallBusinessVPN from "./pages/industries/SmallBusinessVPN.jsx";

import useAuthRedirect from './utils/useAuthRedirect';
import useAutoLogout from './utils/useAutoLogout';


export default function App() {
  useAuthRedirect();
  useAutoLogout();
  return (
    <Routes>
      <Route path="/app" element={<AppLanding />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<PricingFinal />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/download" element={<Download />} />
        <Route path="/tools" element={<Tools />} />
        {/* Industry Landing Pages */}
        <Route path="/industries/healthcare" element={<HealthcareVPN />} />
        <Route path="/industries/legal" element={<LegalVPN />} />
        <Route path="/industries/finance" element={<FinanceVPN />} />
        <Route path="/industries/remote-teams" element={<RemoteTeamsVPN />} />
        <Route path="/industries/small-business" element={<SmallBusinessVPN />} />
      </Route>
    <Route path="/app/personal/*" element={<RequireAuth><PersonalLayout/></RequireAuth>}>
  <Route path="overview" element={<PersonalOverview/>} />
  <Route path="devices"  element={<PersonalDevices/>} />
  <Route path="account"  element={<PersonalAccount/>} />
  <Route path="billing"  element={<PersonalBilling/>} />
</Route>
<Route path="/app/business/*" element={<RequireAuth><BusinessLayout/></RequireAuth>}>
  <Route path="overview" element={<BusinessOverview/>} />
  <Route path="devices"  element={<BusinessDevices/>} />
  <Route path="account"  element={<BusinessAccount/>} />
  <Route path="billing"  element={<BusinessBilling/>} />
</Route>
    <Route
  path="/admin/*"
  element={
    <RequireAuth>
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    </RequireAuth>
  }
>
  <Route index element={<AdminOverview />} />
  <Route path="overview" element={<AdminOverview />} />
  <Route path="devices" element={<AdminDevices />} />
  <Route path="servers" element={<AdminServers />} />
  <Route path="accounts" element={<AdminAccounts />} />
  <Route path="telemetry" element={<AdminTelemetry />} />
  <Route path="analytics" element={<AdminAnalytics />} />
</Route>

  <Route path="/post-checkout" element={<PostCheckout/>} />
</Routes>
  );
}



