export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { planId } = req.body || {};
    // TODO: validate planId, create Stripe Checkout Session
    // const session = await stripe.checkout.sessions.create({...});
    // return res.status(200).json({ url: session.url });

    return res.status(200).json({ url: 'https://example.com/fake-success' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Checkout error' });
  }
}