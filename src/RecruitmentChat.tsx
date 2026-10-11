
import { useState, type FormEvent } from "react";
import {
  Bot,
  Send,
  Sparkles,
  X,
  MapPin,
  BriefcaseBusiness,
  CalendarClock,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./recruitment-chat.css";

type CandidateProfile = {
  name: string;
  skills: string[];
  experience: string;
  location: string;
  currentCtc: string;
  expectedCtc: string;
  notice: string;
  availability: string;
  suitability: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  candidates?: CandidateProfile[];
};

type ChatResponse = {
  answer?: string;
  candidates?: CandidateProfile[];
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
        } else if (
          Array.isArray(fieldValue) &&
          fieldValue.every((entry) => typeof entry === "string")
        ) {
          result[field] = fieldValue.join(", ").slice(0, 500);
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
      "id",
      "name",
      "skills",
      "experience",
      "location",
      "expectedCtc",
      "currentCtc",
      "notice",
      "source",
      "status",
      "availability",
      "email",
      "phone",
    ]),
    jobs: pick("jobs", [
      "id",
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

function CandidateCard({
  candidate,
}: {
  candidate: CandidateProfile;
}) {
  const name = candidate.name || "Unnamed candidate";
  const skills = Array.isArray(candidate.skills)
    ? candidate.skills.filter(
        (skill): skill is string =>
          typeof skill === "string" && skill.trim().length > 0,
      )
    : [];

  const availability = candidate.availability || "Not specified";

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();

  return (
    <article className="tb-candidate-card">
      <div className="tb-candidate-top">
        <div className="tb-candidate-avatar">{initials}</div>

        <div className="tb-candidate-identity">
          <h3>{name}</h3>
          <p>Candidate profile</p>

          <span className="tb-candidate-location">
            <MapPin size={12} />
            {candidate.location || "Not available"}
          </span>
        </div>

        <span
          className={`tb-candidate-status ${
            /unavailable/i.test(availability) ? "unavailable" : ""
          }`}
        >
          {availability}
        </span>
      </div>

      <div className="tb-candidate-metrics">
        <div className="tb-candidate-metric">
          <span>Experience</span>
          <strong>
            <BriefcaseBusiness size={13} />
            {candidate.experience || "Not available"}
          </strong>
        </div>

        <div className="tb-candidate-metric">
          <span>Notice period</span>
          <strong>
            <CalendarClock size={13} />
            {candidate.notice || "Not available"}
          </strong>
        </div>

        <div className="tb-candidate-metric">
          <span>Current CTC</span>
          <strong>{candidate.currentCtc || "Not available"}</strong>
        </div>

        <div className="tb-candidate-metric">
          <span>Expected CTC</span>
          <strong>{candidate.expectedCtc || "Not available"}</strong>
        </div>
      </div>

      {skills.length > 0 && (
        <section className="tb-candidate-section">
          <h4>Technical skills</h4>

          <div className="tb-candidate-skills">
            {skills.map((skill, index) => (
              <span key={`${skill}-${index}`}>{skill}</span>
            ))}
          </div>
        </section>
      )}

      {candidate.suitability &&
        candidate.suitability !== "Not available" && (
          <section className="tb-candidate-suitability">
            <h4>Suitability</h4>
            <p>{candidate.suitability}</p>
          </section>
        )}
    </article>
  );
}

export default function RecruitmentChat({ crmData }: Props) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(text: string) {
    const prompt = text.trim();

    if (!prompt || busy) return;

    // Only send previous conversation messages, not the new prompt twice.
    const previous = messages.slice(-6).map(({ role, content }) => ({
      role,
      content,
    }));

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

      const responseText = await response.text();
      let result: ChatResponse;

      try {
        result = responseText
          ? (JSON.parse(responseText) as ChatResponse)
          : { error: "The AI server returned an empty response." };
      } catch {
        throw new Error(
          "The AI server returned an invalid response. Please try again.",
        );
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
            `The assistant request failed (HTTP ${response.status}).`,
        );
      }

      if (typeof result.answer !== "string" || !result.answer.trim()) {
        throw new Error(
          result.error || "The assistant returned no answer.",
        );
      }

      const candidates: CandidateProfile[] = Array.isArray(
        result.candidates,
      )
        ? result.candidates.filter(
            (candidate): candidate is CandidateProfile =>
              Boolean(
                candidate &&
                  typeof candidate.name === "string" &&
                  candidate.name.trim(),
              ),
          )
        : [];

      setMessages((old) => [
        ...old,
        {
          role: "assistant",
          content: result.answer!.trim(),
          candidates,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not reach the assistant.",
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
              <span>Recruitment intelligence · AI powered</span>
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
              Selected CRM data is sent to the configured AI service
              to answer your question. Avoid including unnecessary
              confidential information.
            </span>
          </div>

          <div className="tb-ai-messages" aria-live="polite">
            {messages.length === 0 && (
              <div className="tb-ai-welcome">
                <h3>How can I help with recruitment?</h3>
                <p>
                  Ask about your current jobs, candidates or
                  follow-ups.
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
                <div className="tb-ai-markdown">
                  {message.role === "assistant" ? (
                    <>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>

                      {message.candidates?.map(
                        (candidate, candidateIndex) => (
                          <CandidateCard
                            key={`${candidate.name}-${candidateIndex}`}
                            candidate={candidate}
                          />
                        ),
                      )}
                    </>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}

            {busy && (
              <div className="tb-ai-thinking" role="status">
                <Sparkles size={14} />
                Thinking…
              </div>
            )}
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
            AI suggestions only · CRM records are not changed
          </div>
        </section>
      )}

      <button
        type="button"
        className="tb-ai-launcher"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
      >
        {open ? <X size={22} /> : <Bot size={23} />}
        {!open && <span>AI Assistant</span>}
      </button>
    </div>
  );
}
