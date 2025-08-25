import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: true }));
app.use(express.json());

// minimal health check
app.get("/api/healthz", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(\[scvpn-api] listening on :\\);
});
