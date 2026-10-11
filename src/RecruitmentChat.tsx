
import { useState, type FormEvent } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import "./recruitment-chat.css";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatResponse = {
  answer?: string;
  error?: string;
};

type Props = {
  crmData: unknown;
};

function makeSafeContext(value: unknown): string {
  const data = (value || {}) as Record<string, unknown>;

  const pick = (key: string, fields: string[]) => {
    const rows = data[key];
    if (!Array.isArray(rows)) return [];

    return rows.slice(0, 100).map((item) => {
      const row = item as Record<string, unknown>;
      const result: Record<string, string | number> = {};

      for (const field of fields) {
        const fieldValue = row[field];

        if (typeof fieldValue === "string") {
          result[field] = fieldValue.slice(0, 250);
        } else if (typeof fieldValue === "number") {
          result[field] = fieldValue;
        }
      }

      return result;
    });
  };

  return JSON.stringify({
    clients: pick("clients", [
      "company",
      "industry",
      "location",
      "status",
      "followUp",
    ]),
    candidates: pick("candidates", [
      "name",
      "skills",
      "experience",
      "location",
      "expectedCtc",
      "currentCtc",
      "notice",
      "source",
      "status",
    ]),
    jobs: pick("jobs", [
      "title",
      "clientId",
      "location",
      "workMode",
      "openings",
      "experience",
      "skills",
      "salary",
      "priority",
      "status",
    ]),
    interviews: pick("interviews", [
      "candidateId",
      "jobId",
      "date",
      "time",
      "round",
      "interviewer",
      "mode",
      "outcome",
    ]),
    placements: pick("placements", [
      "candidateId",
      "jobId",
      "stage",
      "submitted",
      "offeredCtc",
      "joiningDate",
    ]),
    activities: pick("activities", ["title", "date", "type"]),
  });
}

const suggestions = [
  "Show all open jobs.",
  "Find candidates with .NET and Azure skills.",
  "Which client follow-ups are due soon?",
  "Draft a candidate outreach message.",
];

export default function RecruitmentChat({ crmData }: Props) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(text: string) {
    const prompt = text.trim();

    if (!prompt || busy) return;

    const previous = messages.slice(-6);

    setMessages((old) => [
      ...old,
      { role: "user", content: prompt },
    ]);

    setQuestion("");
    setError("");
    setBusy(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          question: prompt,
          context: makeSafeContext(crmData),
          history: previous,
        }),
      });

      // Read the response as text first so an empty response
      // does not cause "Unexpected end of JSON input".
      const responseText = await response.text();

      let result: ChatResponse;

      try {
        result = responseText
          ? (JSON.parse(responseText) as ChatResponse)
          : {
              error:
                "The AI server returned an empty response. Check that Ollama is running.",
            };
      } catch {
        throw new Error(
          "The AI server returned an invalid response. Check the local API configuration."
        );
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
            `The assistant request failed (HTTP ${response.status}).`
        );
      }

      if (
        typeof result.answer !== "string" ||
        !result.answer.trim()
      ) {
        throw new Error(
          result.error || "The assistant returned no answer."
        );
      }

      setMessages((old) => [
        ...old,
        {
          role: "assistant",
          content: result.answer!.trim(),
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not reach the assistant."
      );
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(question);
  }

  return (
    <div className="tb-ai-root">
      {open && (
        <section
          className="tb-ai-panel"
          aria-label="AI recruitment assistant"
        >
          <header className="tb-ai-header">
            <div className="tb-ai-avatar">
              <Bot size={21} />
            </div>

            <div className="tb-ai-heading">
              <strong>TalentBridge AI</strong>
              <span>Recruitment assistant · Ollama</span>
            </div>

            <button
              type="button"
              className="tb-ai-close"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
            >
              <X size={19} />
            </button>
          </header>

          <div className="tb-ai-privacy">
            <Sparkles size={14} />
            <span>
              Selected CRM data is processed by Ollama on this computer
              during local development. Avoid including unnecessary
              confidential information.
            </span>
          </div>

          <div className="tb-ai-messages" aria-live="polite">
            {messages.length === 0 && (
              <div className="tb-ai-welcome">
                <h3>How can I help with recruitment?</h3>
                <p>
                  Ask about your current jobs, candidates or follow-ups.
                </p>

                <div className="tb-ai-suggestions">
                  {suggestions.map((item) => (
                    <button
                      type="button"
                      key={item}
                      disabled={busy}
                      onClick={() => void sendMessage(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                className={`tb-ai-message ${message.role}`}
              >
                <div>{message.content}</div>
              </div>
            ))}

            {busy && (
              <div className="tb-ai-thinking" role="status">
                Thinking…
              </div>
            )}

            <div />
          </div>

          {error && (
            <p className="tb-ai-error" role="alert">
              {error}
            </p>
          )}

          <form className="tb-ai-compose" onSubmit={submit}>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask your recruitment assistant…"
              rows={2}
              maxLength={2000}
              disabled={busy}
            />

            <button
              type="submit"
              disabled={busy || !question.trim()}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>

          <div className="tb-ai-footer">
            Suggestions only · CRM records are not changed
          </div>
        </section>
      )}

      <button
        type="button"
        className="tb-ai-launcher"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={
          open ? "Close AI assistant" : "Open AI assistant"
        }
      >
        {open ? <X size={22} /> : <Bot size={23} />}
        {!open && <span>AI Assistant</span>}
      </button>
    </div>
  );
}
