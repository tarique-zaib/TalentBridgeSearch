
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import crypto from "node:crypto";

function localApi(env: Record<string, string>) {
  return {
    name: "talentbridge-local-api",

    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const path = (req.url || "").split("?")[0];

        if (!path.startsWith("/api/")) return next();

        const send = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify(body));
        };

        const readBody = async () => {
          let raw = "";
          for await (const chunk of req) {
            raw += chunk.toString();
            if (raw.length > 30000) throw new Error("Request too large");
          }
          return raw ? JSON.parse(raw) : {};
        };

        const validSession = () => {
          const match = (req.headers.cookie || "").match(
            /(?:^|;\s*)tb_admin_session=([^;]+)/
          );
          if (!match || !env.SESSION_SECRET || !env.ADMIN_USERNAME) return false;

          try {
            const [payload, signature] = match[1].split(".");
            if (!payload || !signature) return false;

            const expected = crypto.createHmac("sha256", env.SESSION_SECRET)
              .update(payload).digest("base64url");

            const a = Buffer.from(signature);
            const b = Buffer.from(expected);
            if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

            const session = JSON.parse(Buffer.from(payload, "base64url").toString());
            return session.sub === env.ADMIN_USERNAME &&
              Number.isFinite(session.exp) &&
              session.exp > Math.floor(Date.now() / 1000);
          } catch {
            return false;
          }
        };

        try {
          if (path === "/api/auth/login" && req.method === "POST") {
            const { ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_SECRET } = env;
            if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !SESSION_SECRET ||
                SESSION_SECRET.length < 32) {
              return send(500, { error: "Local authentication is not configured." });
            }

            const body = await readBody();
            const equal = (a: string, b: string) => {
              const x = Buffer.from(a);
              const y = Buffer.from(b);
              return x.length === y.length && crypto.timingSafeEqual(x, y);
            };

            if (typeof body.username !== "string" ||
                typeof body.password !== "string" ||
                !equal(body.username, ADMIN_USERNAME) ||
                !equal(body.password, ADMIN_PASSWORD)) {
              return send(401, { error: "Invalid username or password." });
            }

            const payload = Buffer.from(JSON.stringify({
              sub: ADMIN_USERNAME,
              exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60
            })).toString("base64url");

            const signature = crypto.createHmac("sha256", SESSION_SECRET)
              .update(payload).digest("base64url");

            res.setHeader("Set-Cookie",
              `tb_admin_session=${payload}.${signature}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`
            );
            return send(200, { authenticated: true });
          }

          if (path === "/api/auth/me" && req.method === "GET") {
            const authenticated = validSession();
            return send(authenticated ? 200 : 401, { authenticated });
          }

          if (path === "/api/auth/logout" && req.method === "POST") {
            res.setHeader("Set-Cookie",
              "tb_admin_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"
            );
            return send(200, { authenticated: false });
          }

          if (path === "/api/ai/chat" && req.method === "POST") {
            if (!validSession()) {
              return send(401, { error: "Please sign in again." });
            }

            const body = await readBody();
            const { question, context, history } = body;

            if (typeof question !== "string" || !question.trim() ||
                question.length > 2000 || typeof context !== "string" ||
                context.length > 12000 || !Array.isArray(history) ||
                history.length > 8 ||
                !history.every((m: any) =>
                  m && ["user", "assistant"].includes(m.role) &&
                  typeof m.content === "string" && m.content.length <= 2000
                )) {
              return send(400, { error: "Invalid chat request." });
            }

            const messages = [
              {
                role: "system",
               content:
  "You are TalentBridge Search's read-only recruitment assistant. " +
  "Use only the CRM snapshot supplied below. " +
  "For questions asking how many records match a condition, count the matching records in the snapshot before answering. " +
  "List only records present in the snapshot. Never invent or continue a list with guessed records. " +
  "If the data is incomplete or truncated, explicitly say the answer may be incomplete. " +
  "You may draft messages but must not claim to send them or modify CRM records.\n" +
  "CRM snapshot:\n" + context
              },
              ...history.map((m: any) => ({ role: m.role, content: m.content })),
              { role: "user", content: question.trim() }
            ];

            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 300000);

            try {
              const response = await fetch(
                `${env.OLLAMA_BASE_URL || "http://127.0.0.1:11434"}/api/chat`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    model: env.OLLAMA_MODEL || "qwen2.5:7b",
                    messages,
                    stream: false,
                    options: {
  temperature: 0.2,
  num_predict: 300,
  num_ctx: 2048
}
                  }),
                  signal: controller.signal
                }
              );

              if (!response.ok) {
                return send(502, { error: "Ollama could not answer. Check that Ollama is running." });
              }

const result: { message?: { content?: string } } =
  await response.json() as { message?: { content?: string } };
              const answer = result.message?.content;
              if (typeof answer !== "string" || !answer.trim()) {
                return send(502, { error: "Ollama returned an empty response." });
              }

              return send(200, { answer: answer.trim() });
            } finally {
              clearTimeout(timer);
            }
          }

          return send(404, { error: "API route not found." });
        } catch (error) {
          console.error("Local API error:", error);
          return send(500, { error: "Local API failed. Check the terminal output." });
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return { plugins: [react(), localApi(env)] };
});
