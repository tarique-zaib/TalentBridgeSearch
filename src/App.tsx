import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  Globe2,
  Layers3,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";

type Job = {
  id: number;
  title: string;
  department: string;
  location: string;
  workMode: string;
  employmentType: string;
  experience: string;
  summary: string;
  skills: string[];
};
const API = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5080"
).replace(/\/$/, "");
const samples: Job[] = [
  {
    id: 1,
    title: "Senior .NET Developer",
    department: "Engineering",
    location: "Noida, India",
    workMode: "Hybrid",
    employmentType: "Full-time",
    experience: "6–10 years",
    summary:
      "Build reliable APIs and enterprise applications with modern .NET and cloud services.",
    skills: ["C#", ".NET", "Azure", "SQL Server"],
  },
  {
    id: 2,
    title: "React Frontend Engineer",
    department: "Engineering",
    location: "Gurugram, India",
    workMode: "Hybrid",
    employmentType: "Full-time",
    experience: "4–8 years",
    summary:
      "Create accessible, high-performance interfaces for products used by real customers.",
    skills: ["React", "TypeScript", "JavaScript", "CSS"],
  },
  {
    id: 3,
    title: "Azure Cloud Engineer",
    department: "Cloud & DevOps",
    location: "Remote, India",
    workMode: "Remote",
    employmentType: "Full-time",
    experience: "5–9 years",
    summary:
      "Help teams build secure cloud foundations, delivery pipelines and resilient services.",
    skills: ["Azure", "DevOps", "CI/CD", "Terraform"],
  },
  {
    id: 4,
    title: "QA Automation Engineer",
    department: "Quality Engineering",
    location: "Bengaluru, India",
    workMode: "Hybrid",
    employmentType: "Full-time",
    experience: "3–7 years",
    summary:
      "Improve release confidence through automation, test strategy and quality engineering.",
    skills: ["Playwright", "API Testing", "Selenium", "CI/CD"],
  },
  {
    id: 5,
    title: "Technical Lead — Full Stack",
    department: "Engineering Leadership",
    location: "Hyderabad, India",
    workMode: "On-site",
    employmentType: "Full-time",
    experience: "9–14 years",
    summary:
      "Guide architecture and delivery across backend services and modern web experiences.",
    skills: ["C#", "React", "Microservices", "Architecture"],
  },
  {
    id: 6,
    title: "Data Engineer",
    department: "Data & Analytics",
    location: "Remote, India",
    workMode: "Remote",
    employmentType: "Contract",
    experience: "4–8 years",
    summary:
      "Design dependable data pipelines and help teams make better use of their data.",
    skills: ["Python", "SQL", "ETL", "Cloud"],
  },
];
export default function App() {
  const [jobs, setJobs] = useState<Job[]>(samples),
    [q, setQ] = useState(""),
    [loc, setLoc] = useState("All locations"),
    [mode, setMode] = useState("All work modes");
  const [modal, setModal] = useState<"apply" | "employer" | null>(null),
    [, setJob] = useState<Job | null>(null),
    [menu, setMenu] = useState(false),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const [app, setApp] = useState({
      name: "",
      email: "",
      phone: "",
      jobTitle: "",
      message: "",
    }),
    [enq, setEnq] = useState({
      companyName: "",
      name: "",
      email: "",
      hiringNeed: "",
    });
  useEffect(() => {
    fetch(`${API}/api/jobs`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Job[]) => {
        if (Array.isArray(data) && data.length) setJobs(data);
      })
      .catch(() => {});
  }, []);
  const filtered = useMemo(
    () =>
      jobs.filter(
        (j) =>
          (!q ||
            `${j.title} ${j.department} ${j.summary} ${j.skills.join(" ")}`
              .toLowerCase()
              .includes(q.toLowerCase())) &&
          (loc === "All locations" ||
            j.location.toLowerCase().includes(loc.toLowerCase())) &&
          (mode === "All work modes" || j.workMode === mode),
      ),
    [jobs, q, loc, mode],
  );
  const openApply = (j?: Job) => {
    setJob(j || null);
    setApp({
      name: "",
      email: "",
      phone: "",
      jobTitle: j?.title || "",
      message: "",
    });
    setNotice("");
    setModal("apply");
  };

  async function submit(e: FormEvent, kind: "apply" | "employer") {
    e.preventDefault();
    setBusy(true);
    setNotice("");

    try {
      const url =
        kind === "employer"
          ? "https://formsubmit.co/ajax/naushabaparveen85@gmail.com"
          : `${API}/api/applications`;

      const payload =
        kind === "employer"
          ? {
              ...enq,
              _subject: "New TalentBridge Search Hiring Enquiry",
              _template: "table",
            }
          : app;

      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await r.text();

      console.log("FormSubmit HTTP status:", r.status);
      console.log("FormSubmit response:", responseText);

      if (!r.ok) {
        throw new Error(
          `Email service returned HTTP ${r.status}: ${responseText}`,
        );
      }

      let data: { success?: string | boolean; message?: string };

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(`Unexpected email service response: ${responseText}`);
      }

      if (
        data.success === false ||
        data.success === "false" ||
        data.success === "error"
      ) {
        throw new Error(data.message || "Email service rejected the enquiry");
      }      

      setNotice(
        kind === "employer"
          ? "Thank you! Your hiring enquiry has been submitted."
          : "Thank you — your details have been submitted.",
      );

      if (kind === "apply") {
        setApp({
          name: "",
          email: "",
          phone: "",
          jobTitle: "",
          message: "",
        });
      } else {
        setEnq({
          companyName: "",
          name: "",
          email: "",
          hiringNeed: "",
        });
      }
    } catch (error) {
      console.error("Hiring enquiry failed:", error);
      setNotice(
        error instanceof Error
          ? `Enquiry failed: ${error.message}`
          : "Enquiry failed. Check the browser console.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shell">
      <header className="header">
        <a className="brand" href="#home">
          <span className="mark">
            <Layers3 size={23} />
          </span>
          <span>
            <b>TalentBridge</b>
            <small>SEARCH & TALENT SOLUTIONS</small>
          </span>
        </a>
        <button
          className="mobile"
          onClick={() => setMenu(!menu)}
          aria-label="Toggle navigation"
        >
          {menu ? <X /> : <Menu />}
        </button>
        <nav className={menu ? "nav nav-open" : "nav"}>
          <a href="#services" onClick={() => setMenu(false)}>
            Our expertise
          </a>
          <a href="#jobs" onClick={() => setMenu(false)}>
            Find a job
          </a>
          <a href="#about" onClick={() => setMenu(false)}>
            About us
          </a>
          <button
            className="btn dark small"
            onClick={() => {
              setModal("employer");
              setNotice("");
              setMenu(false);
            }}
          >
            Hire talent <ArrowUpRight size={16} />
          </button>
        </nav>
      </header>
      <main>
        <section className="hero" id="home">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <i /> PEOPLE. POTENTIAL. PROGRESS.
              </div>
              <h1>
                Great people build <em>exceptional</em> businesses.
              </h1>
              <p>
                We connect ambitious companies with exceptional technology
                talent — thoughtfully, efficiently, and with a human touch.
              </p>
              <div className="actions">
                <button
                  className="btn lime"
                  onClick={() => setModal("employer")}
                >
                  Build your team <ArrowRight size={17} />
                </button>
                <a className="btn outline" href="#jobs">
                  Explore opportunities <ArrowRight size={17} />
                </a>
              </div>
              <div className="hero-note">
                <ShieldCheck size={17} /> Specialist IT recruitment.
                Relationships built on trust.
              </div>
            </div>
            <div className="visual">
              <div className="visual-card">
                <div className="visual-top">
                  <span>TALENT, CONNECTED</span>
                  <Sparkles size={18} />
                </div>
                <div className="orbit o1" />
                <div className="orbit o2" />
                <div className="core">
                  <Layers3 size={36} />
                </div>
                <div className="person p1">
                  <span className="avatar a1">A</span>
                  <span>
                    <b>Engineering</b>
                    <small>Building what's next</small>
                  </span>
                  <i />
                </div>
                <div className="person p2">
                  <span className="avatar a2">T</span>
                  <span>
                    <b>Technology</b>
                    <small>Ideas into impact</small>
                  </span>
                  <i />
                </div>
                <div className="person p3">
                  <span className="avatar a3">P</span>
                  <span>
                    <b>People</b>
                    <small>Potential unlocked</small>
                  </span>
                  <i />
                </div>
                <div className="visual-caption">
                  — THE RIGHT CONNECTION CHANGES EVERYTHING.
                </div>
              </div>
              <div className="float-pill">
                <CheckCircle2 size={22} />
                <span>
                  <b>Quality over quantity</b>
                  <small>Every introduction matters</small>
                </span>
              </div>
              <div className="stamp">
                <b>TB</b>
                <small>
                  YOUR NEXT CHAPTER
                  <br />
                  STARTS HERE
                </small>
              </div>
            </div>
          </div>
          <div className="hero-bottom">
            <span>TECHNOLOGY & DIGITAL TALENT</span>
            <i />
            <span>INDIA-WIDE SEARCH</span>
            <i />
            <span>PEOPLE-FIRST APPROACH</span>
          </div>
        </section>
        <section className="trust">
          <div>
            <Code2 />
            <span>
              <b>Technology-first</b>
              <small>We understand the skills</small>
            </span>
          </div>
          <div>
            <Users />
            <span>
              <b>People-first</b>
              <small>We value every conversation</small>
            </span>
          </div>
          <div>
            <Globe2 />
            <span>
              <b>India-wide reach</b>
              <small>Talent without borders</small>
            </span>
          </div>
        </section>
        <section className="section" id="services">
          <div className="section-head">
            <div>
              <div className="eyebrow light">WHAT WE DO</div>
              <h2>
                Talent solutions for
                <br />
                <em>what comes next.</em>
              </h2>
            </div>
            <p>
              Hiring is more than filling a vacancy. It is finding the right
              person to move your business forward.
            </p>
          </div>
          <div className="services">
            <article>
              <span className="num">01</span>
              <span className="service-icon">
                <Code2 />
              </span>
              <h3>IT & engineering recruitment</h3>
              <p>
                Specialist hiring across software engineering, cloud, data, QA,
                DevOps and technical leadership.
              </p>
              <a href="#jobs">
                Explore opportunities <ArrowRight size={16} />
              </a>
            </article>
            <article className="featured">
              <span className="num">02</span>
              <span className="service-icon">
                <BriefcaseBusiness />
              </span>
              <h3>Permanent hiring</h3>
              <p>
                Focused candidate search and thoughtful shortlists for full-time
                roles, from individual contributors to senior specialists.
              </p>
              <button onClick={() => setModal("employer")}>
                Discuss a role <ArrowRight size={16} />
              </button>
            </article>
            <article>
              <span className="num">03</span>
              <span className="service-icon">
                <Users />
              </span>
              <h3>Recruitment partnership</h3>
              <p>
                Flexible sourcing support for teams with ongoing hiring needs
                and hard-to-find skill requirements.
              </p>
              <button onClick={() => setModal("employer")}>
                Start a conversation <ArrowRight size={16} />
              </button>
            </article>
          </div>
        </section>
        <section className="jobs" id="jobs">
          <div className="section-head">
            <div>
              <div className="eyebrow light">CAREER OPPORTUNITIES</div>
              <h2>
                Find work that
                <br />
                <em>moves you forward.</em>
              </h2>
            </div>
            <p>
              Explore roles with teams building products, platforms and
              services. Your next chapter could start here.
            </p>
          </div>
          <div className="toolbar">
            <label className="search">
              <Search />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search role, skill or keyword"
              />
            </label>
            <label className="select">
              <MapPin />
              <select value={loc} onChange={(e) => setLoc(e.target.value)}>
                <option>All locations</option>
                <option>Noida</option>
                <option>Gurugram</option>
                <option>Bengaluru</option>
                <option>Hyderabad</option>
                <option>Remote</option>
              </select>
            </label>
            <label className="select">
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option>All work modes</option>
                <option>Remote</option>
                <option>Hybrid</option>
                <option>On-site</option>
              </select>
            </label>
          </div>
          <div className="job-meta">
            <span>
              <b>{filtered.length}</b> opportunities to explore
            </span>
            <span className="demo">
              ● Illustrative sample roles — replace before launch
            </span>
          </div>
          <div className="job-grid">
            {filtered.map((j) => (
              <article className="job-card" key={j.id}>
                <div className="job-top">
                  <span>{j.department}</span>
                  <ArrowUpRight size={18} />
                </div>
                <h3>{j.title}</h3>
                <div className="job-location">
                  <span>
                    <MapPin size={14} />
                    {j.location}
                  </span>
                  <span>{j.workMode}</span>
                </div>
                <p>{j.summary}</p>
                <div className="skills">
                  {j.skills.slice(0, 4).map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
                <div className="job-bottom">
                  <span>
                    {j.experience}
                    <small>Experience</small>
                  </span>
                  <button onClick={() => openApply(j)}>
                    Apply now <ArrowRight size={16} />
                  </button>
                </div>
              </article>
            ))}
            {!filtered.length && (
              <div className="empty">
                <Search />
                <h3>No matching roles found</h3>
                <p>Try another keyword or reset your filters.</p>
                <button
                  className="btn dark"
                  onClick={() => {
                    setQ("");
                    setLoc("All locations");
                    setMode("All work modes");
                  }}
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
          <p className="disclaimer">
            Sample listings are for website demonstration only and are not
            verified vacancies. Replace them with current, authorized job
            openings before publishing.
          </p>
        </section>
        <section className="about" id="about">
          <div className="about-art">
            <div className="about-panel">
              <Layers3 size={32} />
              <strong>
                People
                <br />
                <em>first.</em>
              </strong>
              <p>A better way to connect talent and opportunity.</p>
              <small>TALENTBRIDGE SEARCH · INDIA</small>
            </div>
          </div>
          <div className="about-copy">
            <div className="eyebrow light">A MORE HUMAN APPROACH</div>
            <h2>
              Hiring is personal.
              <br />
              <em>We treat it that way.</em>
            </h2>
            <p>
              TalentBridge Search is built around a simple idea: the right match
              creates lasting value for both people and businesses.
            </p>
            <p>
              We focus on understanding the role, communicating clearly and
              respecting every candidate's time. Our aim is to make recruitment
              more considered, transparent and effective.
            </p>
            <div className="points">
              <span>
                <CheckCircle2 /> Clear communication
              </span>
              <span>
                <CheckCircle2 /> Relevant, skills-led search
              </span>
              <span>
                <CheckCircle2 /> Respectful candidate experience
              </span>
            </div>
            <button className="btn lime" onClick={() => setModal("employer")}>
              Let's work together <ArrowRight size={17} />
            </button>
          </div>
        </section>
        <section className="cta">
          <div className="eyebrow">YOUR NEXT GREAT CONNECTION</div>
          <h2>
            Let's find your
            <br />
            <em>next great hire.</em>
          </h2>
          <p>Tell us what your team needs. We'll start with a conversation.</p>
          <button className="btn lime" onClick={() => setModal("employer")}>
            Talk to our team <ArrowRight size={17} />
          </button>
        </section>
      </main>
      <footer>
        <div className="footer-main">
          <a className="brand" href="#home">
            <span className="mark">
              <Layers3 />
            </span>
            <span>
              <b>TalentBridge</b>
              <small>SEARCH & TALENT SOLUTIONS</small>
            </span>
          </a>
          <p>
            Connecting exceptional talent
            <br />
            with ambitious businesses.
          </p>
          <div className="footer-links">
            <a href="#services">Our expertise</a>
            <a href="#jobs">Find a job</a>
            <a href="#about">About us</a>
            <button onClick={() => setModal("employer")}>Contact</button>
          </div>
          <div className="footer-contact">
            <small>BUSINESS ENQUIRIES</small>
            <a href="mailto:hello@yourdomain.in">hello@yourdomain.in</a>
            <em>Replace with your verified business email.</em>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} TalentBridge Search. All rights
            reserved.
          </span>
          <span>Built on trust. Focused on people.</span>
        </div>
      </footer>
      {modal && (
        <div
          className="backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className="modal" role="dialog" aria-modal="true">
            <button
              className="close"
              onClick={() => setModal(null)}
              aria-label="Close"
            >
              <X />
            </button>
            <div className="eyebrow light">
              {modal === "apply" ? "YOUR NEXT CHAPTER" : "LET’S CONNECT"}
            </div>
            <h2>
              {modal === "apply"
                ? "Introduce yourself."
                : "Tell us what you need."}
            </h2>
            <p>
              {modal === "apply"
                ? "Share a few details and our team can follow up about relevant opportunities."
                : "Tell us a little about your hiring needs and we’ll get back to you."}
            </p>
            {notice && <div className="notice">{notice}</div>}
            {modal === "apply" ? (
              <form onSubmit={(e) => submit(e, "apply")}>
                <label>
                  Full name
                  <input
                    required
                    value={app.name}
                    onChange={(e) => setApp({ ...app, name: e.target.value })}
                    placeholder="Your full name"
                  />
                </label>
                <div className="form-row">
                  <label>
                    Email address
                    <input
                      required
                      type="email"
                      value={app.email}
                      onChange={(e) =>
                        setApp({ ...app, email: e.target.value })
                      }
                      placeholder="you@example.com"
                    />
                  </label>
                  <label>
                    Phone number
                    <input
                      value={app.phone}
                      onChange={(e) =>
                        setApp({ ...app, phone: e.target.value })
                      }
                      placeholder="+91"
                    />
                  </label>
                </div>
                <label>
                  Role of interest
                  <input
                    required
                    value={app.jobTitle}
                    onChange={(e) =>
                      setApp({ ...app, jobTitle: e.target.value })
                    }
                    placeholder="e.g. Senior .NET Developer"
                  />
                </label>
                <label>
                  Brief introduction
                  <textarea
                    rows={3}
                    value={app.message}
                    onChange={(e) =>
                      setApp({ ...app, message: e.target.value })
                    }
                    placeholder="Experience, skills, preferred location…"
                  />
                </label>
                <small className="consent">
                  By submitting, you consent to being contacted about
                  recruitment opportunities. Add a full privacy notice before
                  launch.
                </small>
                <button className="btn dark full" disabled={busy}>
                  {busy ? "Submitting…" : "Submit interest"}{" "}
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={(e) => submit(e, "employer")}>
                <label>
                  Company name
                  <input
                    required
                    value={enq.companyName}
                    onChange={(e) =>
                      setEnq({ ...enq, companyName: e.target.value })
                    }
                    placeholder="Your company"
                  />
                </label>
                <label>
                  Your name
                  <input
                    required
                    value={enq.name}
                    onChange={(e) => setEnq({ ...enq, name: e.target.value })}
                    placeholder="Full name"
                  />
                </label>
                <label>
                  Work email
                  <input
                    required
                    type="email"
                    value={enq.email}
                    onChange={(e) => setEnq({ ...enq, email: e.target.value })}
                    placeholder="you@company.com"
                  />
                </label>
                <label>
                  What roles are you hiring for?
                  <textarea
                    required
                    rows={3}
                    value={enq.hiringNeed}
                    onChange={(e) =>
                      setEnq({ ...enq, hiringNeed: e.target.value })
                    }
                    placeholder="Roles, skills, location, timeline…"
                  />
                </label>
                <button className="btn dark full" disabled={busy}>
                  {busy ? "Submitting…" : "Send hiring enquiry"}{" "}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
