import crypto from "node:crypto";

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_SECRET } = process.env;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD ||
      !SESSION_SECRET || SESSION_SECRET.length < 32) {
    return res.status(500).json({
      error: "Authentication is not configured"
    });
  }

  const { username, password } = req.body || {};

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !safeEqual(username, ADMIN_USERNAME) ||
    !safeEqual(password, ADMIN_PASSWORD)
  ) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const payload = Buffer.from(JSON.stringify({
    sub: ADMIN_USERNAME,
    exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60
  })).toString("base64url");

  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");

  res.setHeader("Set-Cookie",
    `tb_admin_session=${payload}.${signature}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800`
  );

  return res.status(200).json({ authenticated: true });
}
