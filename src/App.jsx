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
import Pricing from "./pages/Pricing.jsx";
import FAQ from "./pages/FAQ.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import About from "./pages/About.jsx";
import PostCheckout from "./pages/PostCheckout";

import useAuthRedirect from './utils/useAuthRedirect';


export default function App() {
  useAuthRedirect();
  return (
    <Routes>
      <Route path="/app" element={<AppLanding />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        
        <Route path="/about" element={<About />} />
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



