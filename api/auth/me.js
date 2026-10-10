
const crypto = require("node:crypto");

module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ authenticated: false });
  }

  const secret = process.env.SESSION_SECRET;
  const cookies = req.headers.cookie || "";
  const match = cookies.match(/(?:^|;\s*)tb_admin_session=([^;]+)/);

  if (!secret || !match) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    const [payload, signature, extra] = match[1].split(".");

    if (!payload || !signature || extra) {
      return res.status(401).json({ authenticated: false });
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const a = Buffer.from(signature);
    const b = Buffer.from(expected);

    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).json({ authenticated: false });
    }

    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (
      session.sub !== process.env.ADMIN_USERNAME ||
      !Number.isFinite(session.exp) ||
      session.exp <= Math.floor(Date.now() / 1000)
    ) {
      return res.status(401).json({ authenticated: false });
    }

    return res.status(200).json({ authenticated: true });
  } catch {
    return res.status(401).json({ authenticated: false });
  }
};
