import express from "express";
import Stripe from "stripe";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
const supa  = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// For JSON endpoints (not webhook)
app.use(express.json({ limit: "1mb" }));

// Create a Checkout Session
app.post("/api/checkout", async (req, res) => {
  try {
    const { price_id, user_id, plan_code } = req.body;
    if (!price_id || !user_id || !plan_code) return res.status(400).json({ error: "Missing fields" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: `${process.env.SITE_URL}/?checkout=success`,
      cancel_url: `${process.env.SITE_URL}/pricing?checkout=cancel`,
      metadata: { user_id, plan_code },
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// Webhook must use raw body
import bodyParser from "body-parser";
app.post("/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    let event;
    try {
      const sig = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verify failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === "checkout.session.completed") {
        const s = event.data.object;
        const user_id  = s.metadata?.user_id;
        const plan_code= s.metadata?.plan_code;
        const sub_id   = s.subscription;

        if (user_id && plan_code && sub_id) {
          // Example: upsert into your profiles table with plan + stripe sub id
          await supa.from("profiles").update({
            plan: plan_code,
            stripe_subscription_id: sub_id
          }).eq("id", user_id);
        }
      }

      if (event.type === "customer.subscription.deleted") {
        const sub = event.data.object;
        // Example: mark plan as canceled
        await supa.from("profiles").update({
          plan: null,
          stripe_subscription_id: null
        }).eq("stripe_subscription_id", sub.id);
      }
    } catch (e) {
      console.error("Webhook handler error:", e);
      return res.status(500).send("Webhook handler failed");
    }

    res.json({ received: true });
  }
);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on :${port}`));
