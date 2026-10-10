import { useEffect, useMemo, useState, type FormEvent } from "react";
import RecruitmentChat from "./RecruitmentChat";
import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Download,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings,
  Users,
  X,
  GitBranch,
  ClipboardList,
  Trash2,
  Pencil,
  RotateCcw,
} from "lucide-react";

import "./crm.css";

type Client = {
  id: string;

  company: string;

  industry: string;

  contact: string;

  email: string;

  phone: string;

  location: string;

  status: string;

  followUp: string;

  notes: string;
};

type Candidate = {
  id: string;

  name: string;

  email: string;

  phone: string;

  skills: string;

  experience: string;

  location: string;

  currentCtc: string;

  expectedCtc: string;

  notice: string;

  source: string;

  status: string;

  notes: string;
};

type Job = {
  id: string;

  title: string;

  clientId: string;

  location: string;

  workMode: string;

  openings: string;

  experience: string;

  skills: string;

  salary: string;

  priority: string;

  status: string;

  created: string;
};

type Interview = {
  id: string;

  candidateId: string;

  jobId: string;

  date: string;

  time: string;

  round: string;

  interviewer: string;

  mode: string;

  outcome: string;

  feedback: string;
};

type Placement = {
  id: string;

  candidateId: string;

  jobId: string;

  stage: string;

  submitted: string;

  offeredCtc: string;

  joiningDate: string;

  notes: string;
};

type ActivityItem = {
  id: string;

  title: string;

  detail: string;

  date: string;

  type: string;
};

type CRMData = {
  clients: Client[];

  candidates: Candidate[];

  jobs: Job[];

  interviews: Interview[];

  placements: Placement[];

  activities: ActivityItem[];
};

type Section =
  | "Dashboard"
  | "Clients"
  | "Candidates"
  | "Jobs"
  | "Interviews"
  | "Placements"
  | "Activities"
  | "Settings";

const STORAGE_KEY = "talentbridge-crm-v1";

const initialData: CRMData = {
  clients: [
    {
      id: "CL-1001",

      company: "Northstar Digital",

      industry: "IT Services",

      contact: "Priya Sharma",

      email: "priya@northstar.example",

      phone: "+91 98765 12001",

      location: "Noida",

      status: "Active",

      followUp: "2026-10-14",

      notes: "Hiring for .NET and Azure roles.",
    },

    {
      id: "CL-1002",

      company: "Orbit FinTech",

      industry: "Financial Technology",

      contact: "Rahul Mehta",

      email: "rahul@orbit.example",

      phone: "+91 98765 12002",

      location: "Gurugram",

      status: "Prospect",

      followUp: "2026-10-13",

      notes: "Introductory discussion completed.",
    },

    {
      id: "CL-1003",

      company: "BluePeak Systems",

      industry: "Product Engineering",

      contact: "Ananya Rao",

      email: "ananya@bluepeak.example",

      phone: "+91 98765 12003",

      location: "Hyderabad",

      status: "Active",

      followUp: "2026-10-16",

      notes: "Quarterly hiring plan to be reviewed.",
    },

    {
      id: "CL-1004",

      company: "Cedar Cloud Labs",

      industry: "Cloud & DevOps",

      contact: "Vikram Singh",

      email: "vikram@cedar.example",

      phone: "+91 98765 12004",

      location: "Remote",

      status: "On hold",

      followUp: "2026-10-20",

      notes: "Awaiting budget approval.",
    },
  ],

  candidates: [
    {
      id: "CA-2001",

      name: "Aarav Khanna",

      email: "aarav@example.com",

      phone: "+91 98100 10001",

      skills: "C#, .NET 8, Azure, SQL Server",

      experience: "8 years",

      location: "Noida",

      currentCtc: "24 LPA",

      expectedCtc: "30 LPA",

      notice: "30 days",

      source: "Referral",

      status: "Available",

      notes: "Strong backend and cloud experience.",
    },

    {
      id: "CA-2002",

      name: "Meera Iyer",

      email: "meera@example.com",

      phone: "+91 98100 10002",

      skills: "React, TypeScript, JavaScript",

      experience: "6 years",

      location: "Gurugram",

      currentCtc: "20 LPA",

      expectedCtc: "26 LPA",

      notice: "15 days",

      source: "LinkedIn",

      status: "Interviewing",

      notes: "Frontend specialist.",
    },

    {
      id: "CA-2003",

      name: "Kabir Malhotra",

      email: "kabir@example.com",

      phone: "+91 98100 10003",

      skills: "Azure, Terraform, CI/CD",

      experience: "7 years",

      location: "Bengaluru",

      currentCtc: "22 LPA",

      expectedCtc: "28 LPA",

      notice: "60 days",

      source: "Naukri",

      status: "Submitted",

      notes: "Cloud engineering profile.",
    },

    {
      id: "CA-2004",

      name: "Sana Qureshi",

      email: "sana@example.com",

      phone: "+91 98100 10004",

      skills: "QA, Playwright, API Testing",

      experience: "5 years",

      location: "Hyderabad",

      currentCtc: "15 LPA",

      expectedCtc: "19 LPA",

      notice: "Immediate",

      source: "Website",

      status: "Available",

      notes: "Can join immediately.",
    },
  ],

  jobs: [
    {
      id: "JB-3001",

      title: "Senior .NET Developer",

      clientId: "CL-1001",

      location: "Noida",

      workMode: "Hybrid",

      openings: "2",

      experience: "6–10 years",

      skills: ".NET, C#, Azure, SQL Server",

      salary: "25–32 LPA",

      priority: "High",

      status: "Open",

      created: "2026-10-01",
    },

    {
      id: "JB-3002",

      title: "React Frontend Engineer",

      clientId: "CL-1002",

      location: "Gurugram",

      workMode: "Hybrid",

      openings: "1",

      experience: "4–8 years",

      skills: "React, TypeScript, CSS",

      salary: "20–28 LPA",

      priority: "Normal",

      status: "Open",

      created: "2026-10-03",
    },

    {
      id: "JB-3003",

      title: "Azure Cloud Engineer",

      clientId: "CL-1003",

      location: "Hyderabad",

      workMode: "Remote",

      openings: "2",

      experience: "5–9 years",

      skills: "Azure, Terraform, DevOps",

      salary: "24–34 LPA",

      priority: "High",

      status: "Open",

      created: "2026-10-04",
    },

    {
      id: "JB-3004",

      title: "QA Automation Engineer",

      clientId: "CL-1001",

      location: "Noida",

      workMode: "Hybrid",

      openings: "1",

      experience: "3–7 years",

      skills: "Playwright, API Testing",

      salary: "14–20 LPA",

      priority: "Normal",

      status: "On hold",

      created: "2026-10-05",
    },
  ],

  interviews: [
    {
      id: "IN-4001",

      candidateId: "CA-2002",

      jobId: "JB-3002",

      date: "2026-10-12",

      time: "11:00",

      round: "Technical round",

      interviewer: "Engineering Manager",

      mode: "Video",

      outcome: "Scheduled",

      feedback: "",
    },

    {
      id: "IN-4002",

      candidateId: "CA-2003",

      jobId: "JB-3003",

      date: "2026-10-13",

      time: "15:30",

      round: "Client round",

      interviewer: "Cloud Lead",

      mode: "Video",

      outcome: "Scheduled",

      feedback: "",
    },

    {
      id: "IN-4003",

      candidateId: "CA-2001",

      jobId: "JB-3001",

      date: "2026-10-09",

      time: "14:00",

      round: "Recruiter screen",

      interviewer: "Recruiter",

      mode: "Phone",

      outcome: "Passed",

      feedback: "Good communication and relevant project experience.",
    },
  ],

  placements: [
    {
      id: "PL-5001",

      candidateId: "CA-2003",

      jobId: "JB-3003",

      stage: "Client submitted",

      submitted: "2026-10-08",

      offeredCtc: "",

      joiningDate: "",

      notes: "Waiting for client response.",
    },

    {
      id: "PL-5002",

      candidateId: "CA-2001",

      jobId: "JB-3001",

      stage: "Interview",

      submitted: "2026-10-06",

      offeredCtc: "",

      joiningDate: "",

      notes: "Recruiter screen passed.",
    },

    {
      id: "PL-5003",

      candidateId: "CA-2002",

      jobId: "JB-3002",

      stage: "Interview",

      submitted: "2026-10-07",

      offeredCtc: "",

      joiningDate: "",

      notes: "Technical interview scheduled.",
    },
  ],

  activities: [
    {
      id: "AC-6001",

      title: "Follow up with Orbit FinTech",

      detail: "Confirm React hiring timeline",

      date: "2026-10-13",

      type: "Follow-up",
    },

    {
      id: "AC-6002",

      title: "Review candidate profile",

      detail: "Aarav Khanna · Senior .NET Developer",

      date: "2026-10-12",

      type: "Candidate",
    },

    {
      id: "AC-6003",

      title: "Interview scheduled",

      detail: "Meera Iyer · React Frontend Engineer",

      date: "2026-10-12",

      type: "Interview",
    },
  ],
};

const sections: {
  name: Section;

  icon: typeof LayoutDashboard;

  hint: string;
}[] = [
  { name: "Dashboard", icon: LayoutDashboard, hint: "Overview and priorities" },

  { name: "Clients", icon: Building2, hint: "Company relationships" },

  { name: "Candidates", icon: Users, hint: "Talent database" },

  { name: "Jobs", icon: BriefcaseBusiness, hint: "Open requirements" },

  { name: "Interviews", icon: CalendarDays, hint: "Schedules and feedback" },

  { name: "Placements", icon: GitBranch, hint: "Recruitment pipeline" },

  { name: "Activities", icon: Activity, hint: "Follow-ups and notes" },

  { name: "Settings", icon: Settings, hint: "Data and preferences" },
];

const blank = (section: Section): Record<string, string> =>
  (
    ({
      Clients: {
        company: "",

        industry: "",

        contact: "",

        email: "",

        phone: "",

        location: "",

        status: "Prospect",

        followUp: "",

        notes: "",
      },

      Candidates: {
        name: "",

        email: "",

        phone: "",

        skills: "",

        experience: "",

        location: "",

        currentCtc: "",

        expectedCtc: "",

        notice: "",

        source: "LinkedIn",

        status: "Available",

        notes: "",
      },

      Jobs: {
        title: "",

        clientId: "",

        location: "",

        workMode: "Hybrid",

        openings: "1",

        experience: "",

        skills: "",

        salary: "",

        priority: "Normal",

        status: "Open",

        created: new Date().toISOString().slice(0, 10),
      },

      Interviews: {
        candidateId: "",

        jobId: "",

        date: "",

        time: "10:00",

        round: "Technical round",

        interviewer: "",

        mode: "Video",

        outcome: "Scheduled",

        feedback: "",
      },

      Placements: {
        candidateId: "",

        jobId: "",

        stage: "Sourced",

        submitted: new Date().toISOString().slice(0, 10),

        offeredCtc: "",

        joiningDate: "",

        notes: "",
      },

      Activities: {
        title: "",

        detail: "",

        date: new Date().toISOString().slice(0, 10),

        type: "Follow-up",
      },
    }) as Partial<Record<Section, Record<string, string>>>
  )[section] || {};

const fields: Record<
  string,
  { key: string; label: string; type?: string; options?: string[] }[]
> = {
  Clients: [
    { key: "company", label: "Company name" },

    { key: "industry", label: "Industry" },

    { key: "contact", label: "Primary contact" },

    { key: "email", label: "Contact email", type: "email" },

    { key: "phone", label: "Phone" },

    { key: "location", label: "Location" },

    {
      key: "status",

      label: "Status",

      options: ["Prospect", "Active", "On hold", "Inactive"],
    },

    { key: "followUp", label: "Next follow-up", type: "date" },

    { key: "notes", label: "Notes", type: "textarea" },
  ],

  Candidates: [
    { key: "name", label: "Full name" },

    { key: "email", label: "Email", type: "email" },

    { key: "phone", label: "Phone" },

    { key: "skills", label: "Skills (comma separated)", type: "textarea" },

    { key: "experience", label: "Experience" },

    { key: "location", label: "Location" },

    { key: "currentCtc", label: "Current CTC" },

    { key: "expectedCtc", label: "Expected CTC" },

    { key: "notice", label: "Notice period" },

    {
      key: "source",

      label: "Source",

      options: ["LinkedIn", "Naukri", "Referral", "Website", "Other"],
    },

    {
      key: "status",

      label: "Status",

      options: [
        "Available",

        "Screening",

        "Submitted",

        "Interviewing",

        "Offered",

        "Placed",

        "Not available",
      ],
    },

    { key: "notes", label: "Notes", type: "textarea" },
  ],

  Jobs: [
    { key: "title", label: "Job title" },

    { key: "clientId", label: "Client", options: [] },

    { key: "location", label: "Location" },

    {
      key: "workMode",

      label: "Work mode",

      options: ["On-site", "Hybrid", "Remote"],
    },

    { key: "openings", label: "Openings", type: "number" },

    { key: "experience", label: "Experience range" },

    { key: "skills", label: "Required skills", type: "textarea" },

    { key: "salary", label: "Salary range" },

    {
      key: "priority",

      label: "Priority",

      options: ["Low", "Normal", "High", "Urgent"],
    },

    { key: "status", label: "Status", options: ["Open", "On hold", "Closed"] },

    { key: "created", label: "Created date", type: "date" },
  ],

  Interviews: [
    { key: "candidateId", label: "Candidate", options: [] },

    { key: "jobId", label: "Job", options: [] },

    { key: "date", label: "Date", type: "date" },

    { key: "time", label: "Time", type: "time" },

    {
      key: "round",

      label: "Round",

      options: [
        "Recruiter screen",

        "Technical round",

        "Hiring manager",

        "Client round",

        "HR round",

        "Final round",
      ],
    },

    { key: "interviewer", label: "Interviewer" },

    { key: "mode", label: "Mode", options: ["Video", "Phone", "In person"] },

    {
      key: "outcome",

      label: "Outcome",

      options: ["Scheduled", "Passed", "Rejected", "Reschedule", "No show"],
    },

    { key: "feedback", label: "Feedback", type: "textarea" },
  ],

  Placements: [
    { key: "candidateId", label: "Candidate", options: [] },

    { key: "jobId", label: "Job", options: [] },

    {
      key: "stage",

      label: "Pipeline stage",

      options: [
        "Sourced",

        "Screening",

        "Ready to submit",

        "Client submitted",

        "Interview",

        "Offer",

        "Hired",

        "Rejected",

        "Withdrawn",
      ],
    },

    { key: "submitted", label: "Submitted date", type: "date" },

    { key: "offeredCtc", label: "Offered CTC" },

    { key: "joiningDate", label: "Joining date", type: "date" },

    { key: "notes", label: "Notes", type: "textarea" },
  ],

  Activities: [
    { key: "title", label: "Activity title" },

    { key: "detail", label: "Details", type: "textarea" },

    { key: "date", label: "Date", type: "date" },

    {
      key: "type",

      label: "Type",

      options: ["Follow-up", "Candidate", "Client", "Interview", "Admin"],
    },
  ],
};

function readData(): CRMData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) return { ...initialData, ...JSON.parse(raw) } as CRMData;
  } catch {}

  return initialData;
}

const idFor = (prefix: string, items: Record<string, string>[]) =>
  `${prefix}-${(Math.max(0, ...items.map((x) => Number(x.id.split("-").pop()) || 0)) + 1).toString()}`;

function labelFor(section: Section) {
  return (
    (
      {
        Clients: "client",

        Candidates: "candidate",

        Jobs: "job",

        Interviews: "interview",

        Placements: "placement",

        Activities: "activity",
      } as Record<string, string>
    )[section] || section.toLowerCase()
  );
}

export default function CrmApp() {
  const [data, setData] = useState<CRMData>(readData);

  const [section, setSection] = useState<Section>("Dashboard");

  const [query, setQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [modal, setModal] = useState(false);

  const [editing, setEditing] = useState<string | null>(null);

  const [form, setForm] = useState<Record<string, string>>({});

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      setToast(
        "Browser storage is full. Export your CRM data before continuing.",
      );
    }
  }, [data]);

  const updateForm = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const tableData = useMemo(() => {
    const items =
      (data[section.toLowerCase() as keyof CRMData] as unknown as
        | Record<string, string>[]
        | undefined) || [];

    return items.filter((item) => {
      const all = Object.values(item).join(" ").toLowerCase();

      const queryOk = !query || all.includes(query.toLowerCase());

      const status = String(item.status || item.stage || item.outcome || "");

      const statusOk =
        statusFilter === "All statuses" || status === statusFilter;

      return queryOk && statusOk;
    });
  }, [data, section, query, statusFilter]);

  const startAdd = () => {
    setEditing(null);

    setForm(blank(section));

    setModal(true);
  };

  const startEdit = (record: Record<string, string>) => {
    setEditing(record.id);

    setForm({ ...record });

    setModal(true);
  };

  const saveRecord = (e: FormEvent) => {
    e.preventDefault();

    const prefix = (
      {
        Clients: "CL",

        Candidates: "CA",

        Jobs: "JB",

        Interviews: "IN",

        Placements: "PL",

        Activities: "AC",
      } as Record<string, string>
    )[section];

    if (!prefix) return;

    const key = section.toLowerCase() as keyof CRMData;

    const list = data[key] as unknown as Record<string, string>[];

    const record = { ...form, id: editing || idFor(prefix, list) };

    const next = list.some((x) => x.id === editing)
      ? list.map((x) => (x.id === editing ? record : x))
      : [record, ...list];

    setData({ ...data, [key]: next } as CRMData);

    setModal(false);

    setToast(
      `${labelFor(section)} ${editing ? "updated" : "added"} successfully.`,
    );

    setTimeout(() => setToast(""), 2800);
  };

  const removeRecord = (id: string) => {
    if (
      !window.confirm(
        "Archive/delete this sample record? Related records may still reference it.",
      )
    )
      return;

    const key = section.toLowerCase() as keyof CRMData;

    setData({
      ...data,

      [key]: (data[key] as unknown as { id: string }[]).filter(
        (x) => x.id !== id,
      ),
    } as CRMData);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "talentbridge-crm-export.json";

    a.click();

    URL.revokeObjectURL(url);
  };

  const resetData = () => {
    if (
      window.confirm(
        "Reset all CRM changes in this browser to the original sample data?",
      )
    ) {
      setData(initialData);

      setQuery("");

      setStatusFilter("All statuses");
    }
  };

  const clientName = (id: string) =>
    data.clients.find((x) => x.id === id)?.company || "Unknown client";

  const candidateName = (id: string) =>
    data.candidates.find((x) => x.id === id)?.name || "Unknown candidate";

  const jobName = (id: string) =>
    data.jobs.find((x) => x.id === id)?.title || "Unknown job";

  const statusOptions =
    section === "Clients"
      ? ["Prospect", "Active", "On hold", "Inactive"]
      : section === "Candidates"
        ? [
            "Available",

            "Screening",

            "Submitted",

            "Interviewing",

            "Offered",

            "Placed",

            "Not available",
          ]
        : section === "Jobs"
          ? ["Open", "On hold", "Closed"]
          : section === "Interviews"
            ? ["Scheduled", "Passed", "Rejected", "Reschedule", "No show"]
            : section === "Placements"
              ? [
                  "Sourced",

                  "Screening",

                  "Ready to submit",

                  "Client submitted",

                  "Interview",

                  "Offer",

                  "Hired",

                  "Rejected",

                  "Withdrawn",
                ]
              : [];

  const columns: Record<string, { key: string; label: string }[]> = {
    Clients: [
      { key: "company", label: "Company" },

      { key: "industry", label: "Industry" },

      { key: "contact", label: "Primary contact" },

      { key: "location", label: "Location" },

      { key: "status", label: "Status" },

      { key: "followUp", label: "Follow-up" },
    ],

    Candidates: [
      { key: "name", label: "Candidate" },

      { key: "skills", label: "Skills" },

      { key: "experience", label: "Experience" },

      { key: "location", label: "Location" },

      { key: "expectedCtc", label: "Expected CTC" },

      { key: "status", label: "Status" },
    ],

    Jobs: [
      { key: "title", label: "Job title" },

      { key: "clientId", label: "Client" },

      { key: "location", label: "Location" },

      { key: "experience", label: "Experience" },

      { key: "priority", label: "Priority" },

      { key: "status", label: "Status" },
    ],

    Interviews: [
      { key: "candidateId", label: "Candidate" },

      { key: "jobId", label: "Job" },

      { key: "date", label: "Date" },

      { key: "time", label: "Time" },

      { key: "round", label: "Round" },

      { key: "outcome", label: "Outcome" },
    ],

    Placements: [
      { key: "candidateId", label: "Candidate" },

      { key: "jobId", label: "Job" },

      { key: "stage", label: "Stage" },

      { key: "submitted", label: "Submitted" },

      { key: "offeredCtc", label: "Offered CTC" },

      { key: "joiningDate", label: "Joining" },
    ],

    Activities: [
      { key: "title", label: "Activity" },

      { key: "detail", label: "Details" },

      { key: "date", label: "Date" },

      { key: "type", label: "Type" },
    ],
  };

  const display = (row: Record<string, string>, key: string) =>
    key === "clientId"
      ? clientName(row[key])
      : key === "candidateId"
        ? candidateName(row[key])
        : key === "jobId"
          ? jobName(row[key])
          : row[key] || "—";

  return (
    <div className="crm-shell">
      <aside className={`crm-sidebar ${sidebarOpen ? "open" : ""}`}>
        <a className="crm-brand" href="/">
          <span className="crm-logo">
            <GitBranch size={21} />
          </span>

          <span>
            <b>TalentBridge</b>

            <small>SEARCH CRM</small>
          </span>
        </a>

        <div className="crm-workspace">
          <div className="crm-avatar">TB</div>

          <span>
            <b>TalentBridge Search</b>

            <small>Recruitment workspace</small>
          </span>

          <ChevronDown size={15} />
        </div>

        <div className="crm-nav-label">WORKSPACE</div>

        <nav className="crm-nav">
          {sections.map((item) => (
            <button
              key={item.name}
              className={section === item.name ? "active" : ""}
              onClick={() => {
                setSection(item.name);

                setQuery("");

                setStatusFilter("All statuses");

                setSidebarOpen(false);
              }}
            >
              <item.icon size={18} />

              <span>{item.name}</span>

              {item.name === "Interviews" && (
                <i>
                  {
                    data.interviews.filter((x) => x.outcome === "Scheduled")
                      .length
                  }
                </i>
              )}
            </button>
          ))}
        </nav>

        <div className="crm-sidebar-bottom">
          <div className="crm-demo-note">
            <span className="dot" />

            <div>
              <b>Demo workspace</b>

              <small>Saved in this browser only</small>
            </div>
          </div>

          <a href="/" className="crm-back">
            ← Back to public website
          </a>
        </div>
      </aside>

      <main className="crm-main">
        <header className="crm-topbar">
          <button
            className="crm-menu"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <Menu />
          </button>

          <div className="crm-breadcrumb">
            Workspace <span>/</span> <b>{section}</b>
          </div>

          <div className="crm-top-actions">
            <span className="crm-local-badge">
              <span className="dot" /> Local demo
            </span>

            <div className="crm-user">
              <div className="crm-user-avatar">TZ</div>

              <span>
                <b>Administrator</b>

                <small>Recruiter</small>
              </span>
            </div>
          </div>
        </header>

        {section === "Dashboard" ? (
          <div className="crm-page">
            <div className="crm-page-head">
              <div>
                <div className="crm-eyebrow">MONDAY, 12 OCTOBER 2026</div>

                <h1>
                  Good morning, Recruiter <span>✦</span>
                </h1>

                <p>Here's what's happening across your recruitment desk.</p>
              </div>

              <button
                className="crm-primary"
                onClick={() => {
                  setSection("Clients");

                  setForm(blank("Clients"));

                  setEditing(null);

                  setModal(true);
                }}
              >
                <Plus size={17} /> Add new client
              </button>
            </div>

            <div className="crm-stat-grid">
              {[
                {
                  title: "Active clients",

                  value: data.clients.filter((x) => x.status === "Active")
                    .length,

                  detail: `${data.clients.filter((x) => x.status === "Prospect").length} prospects in pipeline`,

                  icon: Building2,

                  tone: "green",
                },

                {
                  title: "Candidates",

                  value: data.candidates.length,

                  detail: `${data.candidates.filter((x) => x.status === "Available").length} currently available`,

                  icon: Users,

                  tone: "blue",
                },

                {
                  title: "Open jobs",

                  value: data.jobs.filter((x) => x.status === "Open").length,

                  detail: `${data.jobs.reduce((n, j) => n + Number(j.openings || 0), 0)} total openings`,

                  icon: BriefcaseBusiness,

                  tone: "purple",
                },

                {
                  title: "Interviews upcoming",

                  value: data.interviews.filter(
                    (x) => x.outcome === "Scheduled",
                  ).length,

                  detail: "Across active requisitions",

                  icon: CalendarDays,

                  tone: "orange",
                },
              ].map((card) => (
                <div className="crm-stat" key={card.title}>
                  <div className={`crm-stat-icon ${card.tone}`}>
                    <card.icon size={19} />
                  </div>

                  <span>{card.title}</span>

                  <strong>{card.value}</strong>

                  <small>
                    <ArrowUpRight size={13} />

                    {card.detail}
                  </small>
                </div>
              ))}
            </div>

            <div className="crm-dashboard-grid">
              <section className="crm-panel crm-pipeline-panel">
                <div className="crm-panel-head">
                  <div>
                    <h2>Recruitment pipeline</h2>

                    <p>Candidate progress across all active jobs</p>
                  </div>

                  <button
                    className="crm-text-btn"
                    onClick={() => setSection("Placements")}
                  >
                    View pipeline <ArrowUpRight size={15} />
                  </button>
                </div>

                <div className="crm-pipeline">
                  {[
                    { name: "Sourced", color: "#a7b9ac" },

                    { name: "Screening", color: "#8db2d3" },

                    { name: "Client submitted", color: "#a99bdd" },

                    { name: "Interview", color: "#e7b77b" },

                    { name: "Offer", color: "#7eb6a1" },

                    { name: "Hired", color: "#4c8769" },
                  ].map((stage) => {
                    const count = data.placements.filter(
                      (x) => x.stage === stage.name,
                    ).length;

                    return (
                      <button
                        className="crm-stage"
                        key={stage.name}
                        onClick={() => {
                          setSection("Placements");

                          setStatusFilter(stage.name);
                        }}
                      >
                        <span className="crm-stage-label">
                          <i style={{ background: stage.color }} />

                          {stage.name}
                        </span>

                        <strong>{count}</strong>

                        <span className="crm-stage-bar">
                          <i
                            style={{
                              background: stage.color,

                              width: `${Math.max(count ? 12 : 0, Math.min(100, (count / Math.max(1, data.placements.length)) * 100))}%`,
                            }}
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="crm-panel-foot">
                  <span>
                    <GitBranch size={14} /> {data.placements.length} candidate
                    submissions tracked
                  </span>

                  <span>Sample data</span>
                </div>
              </section>

              <section className="crm-panel">
                <div className="crm-panel-head">
                  <div>
                    <h2>Upcoming interviews</h2>

                    <p>Prepare for the next conversations</p>
                  </div>

                  <button
                    className="crm-icon-btn"
                    onClick={() => setSection("Interviews")}
                    aria-label="View interviews"
                  >
                    <ArrowUpRight size={17} />
                  </button>
                </div>

                <div className="crm-interview-list">
                  {data.interviews

                    .filter((x) => x.outcome === "Scheduled")

                    .sort((a, b) => a.date.localeCompare(b.date))

                    .slice(0, 4)

                    .map((item) => (
                      <div className="crm-interview-item" key={item.id}>
                        <div className="crm-date-tile">
                          <b>{new Date(`${item.date}T00:00:00`).getDate()}</b>

                          <small>
                            {new Date(
                              `${item.date}T00:00:00`,
                            ).toLocaleDateString("en-IN", { month: "short" })}
                          </small>
                        </div>

                        <div className="crm-interview-info">
                          <b>{candidateName(item.candidateId)}</b>

                          <span>{jobName(item.jobId)}</span>

                          <small>
                            {item.time} · {item.round}
                          </small>
                        </div>

                        <span className="crm-status scheduled">Scheduled</span>
                      </div>
                    ))}

                  {!data.interviews.some((x) => x.outcome === "Scheduled") && (
                    <p className="crm-empty-inline">
                      No upcoming interviews scheduled.
                    </p>
                  )}
                </div>
              </section>

              <section className="crm-panel crm-wide">
                <div className="crm-panel-head">
                  <div>
                    <h2>Recent candidate activity</h2>

                    <p>Latest activity across your talent database</p>
                  </div>

                  <button
                    className="crm-text-btn"
                    onClick={() => setSection("Candidates")}
                  >
                    All candidates <ArrowUpRight size={15} />
                  </button>
                </div>

                <div className="crm-table-wrap">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Candidate</th>

                        <th>Skills</th>

                        <th>Experience</th>

                        <th>Location</th>

                        <th>Status</th>

                        <th />
                      </tr>
                    </thead>

                    <tbody>
                      {data.candidates.slice(0, 4).map((c) => (
                        <tr key={c.id}>
                          <td>
                            <div className="crm-person-cell">
                              <span className="crm-person-avatar">
                                {c.name

                                  .split(" ")

                                  .map((x) => x[0])

                                  .join("")

                                  .slice(0, 2)}
                              </span>

                              <span>
                                <b>{c.name}</b>

                                <small>{c.email}</small>
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className="crm-truncate">{c.skills}</span>
                          </td>

                          <td>{c.experience}</td>

                          <td>{c.location}</td>

                          <td>
                            <span
                              className={`crm-status ${c.status.toLowerCase().replace(/ /g, "-")}`}
                            >
                              {c.status}
                            </span>
                          </td>

                          <td>
                            <button
                              className="crm-icon-btn"
                              onClick={() => {
                                setSection("Candidates");

                                startEdit(
                                  c as unknown as Record<string, string>,
                                );
                              }}
                              aria-label="Edit candidate"
                            >
                              <ArrowUpRight size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="crm-panel">
                <div className="crm-panel-head">
                  <div>
                    <h2>Client follow-ups</h2>

                    <p>Keep relationships moving</p>
                  </div>

                  <button
                    className="crm-icon-btn"
                    onClick={() => setSection("Clients")}
                    aria-label="View clients"
                  >
                    <ArrowUpRight size={17} />
                  </button>
                </div>

                <div className="crm-follow-list">
                  {data.clients

                    .slice()

                    .sort((a, b) => a.followUp.localeCompare(b.followUp))

                    .slice(0, 4)

                    .map((c) => (
                      <div className="crm-follow-item" key={c.id}>
                        <div className="crm-follow-icon">
                          <Building2 size={16} />
                        </div>

                        <div>
                          <b>{c.company}</b>

                          <small>
                            {c.contact} · {c.followUp || "No date set"}
                          </small>
                        </div>

                        <span
                          className={`crm-status ${c.status.toLowerCase().replace(/ /g, "-")}`}
                        >
                          {c.status}
                        </span>
                      </div>
                    ))}
                </div>
              </section>
            </div>

            <div className="crm-footnote">
              <span>
                <Activity size={14} /> Dashboard metrics update from your
                records.
              </span>

              <span>Demo records · Not connected to a shared database</span>
            </div>
          </div>
        ) : section === "Settings" ? (
          <div className="crm-page">
            <div className="crm-page-head">
              <div>
                <div className="crm-eyebrow">PREFERENCES & DATA</div>

                <h1>Settings</h1>

                <p>Manage this browser's demo data.</p>
              </div>
            </div>

            <div className="crm-settings-grid">
              <div className="crm-panel">
                <div className="crm-panel-head">
                  <div>
                    <h2>Data management</h2>

                    <p>Export a backup or reset the sample workspace.</p>
                  </div>

                  <ClipboardList />
                </div>

                <p className="crm-settings-copy">
                  Records are stored in this browser using localStorage. They
                  are not synced to another device or protected by a login.
                </p>

                <div className="crm-settings-actions">
                  <button className="crm-secondary" onClick={exportData}>
                    <Download size={16} /> Export CRM data (JSON)
                  </button>

                  <button className="crm-danger" onClick={resetData}>
                    <RotateCcw size={16} /> Reset sample data
                  </button>
                </div>
              </div>

              <div className="crm-panel">
                <div className="crm-panel-head">
                  <div>
                    <h2>Production readiness</h2>

                    <p>Before using real candidate information</p>
                  </div>

                  <Settings />
                </div>

                <ul className="crm-checklist">
                  <li>
                    <Check size={16} /> CRM modules and demo workflows
                  </li>

                  <li>
                    <Check size={16} /> Browser-local persistence
                  </li>

                  <li>
                    <X size={16} /> Secure authentication and roles
                  </li>

                  <li>
                    <X size={16} /> Shared database and backups
                  </li>

                  <li>
                    <X size={16} /> Secure resume storage
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="crm-page">
            <div className="crm-page-head">
              <div>
                <div className="crm-eyebrow">RECRUITMENT WORKSPACE</div>

                <h1>{section}</h1>

                <p>
                  {sections.find((s) => s.name === section)?.hint}. Manage
                  records and keep your workflow moving.
                </p>
              </div>

              <button className="crm-primary" onClick={startAdd}>
                <Plus size={17} /> Add {labelFor(section)}
              </button>
            </div>

            <div className="crm-toolbar">
              <label className="crm-search">
                <Search size={17} />

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${section.toLowerCase()}...`}
                />
              </label>

              {statusOptions.length > 0 && (
                <select
                  className="crm-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All statuses</option>

                  {statusOptions.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              )}

              <span className="crm-result-count">
                {tableData.length} records
              </span>
            </div>

            <div className="crm-panel crm-list-panel">
              <div className="crm-table-wrap">
                <table className="crm-table">
                  <thead>
                    <tr>
                      {(columns[section] || []).map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}

                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tableData.map((row) => (
                      <tr key={row.id}>
                        {(columns[section] || []).map((col) => (
                          <td key={col.key}>
                            {["status", "stage", "outcome"].includes(
                              col.key,
                            ) ? (
                              <span
                                className={`crm-status ${display(row, col.key).toLowerCase().replace(/ /g, "-")}`}
                              >
                                {display(row, col.key)}
                              </span>
                            ) : col.key === "skills" ? (
                              <span className="crm-truncate">
                                {display(row, col.key)}
                              </span>
                            ) : (
                              display(row, col.key)
                            )}
                          </td>
                        ))}

                        <td>
                          <div className="crm-row-actions">
                            <button
                              className="crm-icon-btn"
                              onClick={() => startEdit(row)}
                              aria-label="Edit record"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              className="crm-icon-btn danger"
                              onClick={() => removeRecord(row.id)}
                              aria-label="Delete record"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {tableData.length === 0 && (
                  <div className="crm-empty">
                    <Search size={25} />

                    <b>No matching records</b>

                    <span>
                      Try changing your search or filters, or add a new record.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="crm-footnote">
              <span>
                <CircleDollarSign size={14} /> All records are illustrative
                sample data.
              </span>

              <span>Changes are saved in this browser</span>
            </div>
          </div>
        )}

        {modal && (
          <div
            className="crm-modal-backdrop"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setModal(false);
            }}
          >
            <div className="crm-modal" role="dialog" aria-modal="true">
              <div className="crm-modal-head">
                <div>
                  <div className="crm-eyebrow">
                    {editing ? "UPDATE RECORD" : "NEW RECORD"}
                  </div>

                  <h2>
                    {editing ? "Edit" : "Add"} {labelFor(section)}
                  </h2>

                  <p>Fields are saved to your local demo workspace.</p>
                </div>

                <button
                  className="crm-icon-btn"
                  onClick={() => setModal(false)}
                  aria-label="Close"
                >
                  <X />
                </button>
              </div>

              <form onSubmit={saveRecord}>
                <div className="crm-form-grid">
                  {(fields[section] || []).map((field) => (
                    <label
                      key={field.key}
                      className={field.type === "textarea" ? "span-two" : ""}
                    >
                      {field.label}

                      {field.options !== undefined ? (
                        <select
                          required={!["notes", "feedback"].includes(field.key)}
                          value={form[field.key] || ""}
                          onChange={(e) =>
                            updateForm(field.key, e.target.value)
                          }
                        >
                          {field.key === "clientId" && (
                            <option value="">Select client</option>
                          )}

                          {field.key === "candidateId" && (
                            <option value="">Select candidate</option>
                          )}

                          {field.key === "jobId" && (
                            <option value="">Select job</option>
                          )}

                          {(field.key === "clientId"
                            ? data.clients.map((x) => ({
                                value: x.id,

                                label: x.company,
                              }))
                            : field.key === "candidateId"
                              ? data.candidates.map((x) => ({
                                  value: x.id,

                                  label: x.name,
                                }))
                              : field.key === "jobId"
                                ? data.jobs.map((x) => ({
                                    value: x.id,

                                    label: x.title,
                                  }))
                                : field.options.map((x) => ({
                                    value: x,

                                    label: x,
                                  }))
                          ).map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "textarea" ? (
                        <textarea
                          rows={3}
                          value={form[field.key] || ""}
                          onChange={(e) =>
                            updateForm(field.key, e.target.value)
                          }
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      ) : (
                        <input
                          required={
                            ![
                              "phone",

                              "currentCtc",

                              "expectedCtc",

                              "joiningDate",

                              "offeredCtc",

                              "interviewer",
                            ].includes(field.key)
                          }
                          type={field.type || "text"}
                          min={field.type === "number" ? "1" : undefined}
                          value={form[field.key] || ""}
                          onChange={(e) =>
                            updateForm(field.key, e.target.value)
                          }
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      )}
                    </label>
                  ))}
                </div>

                <div className="crm-form-actions">
                  <button
                    type="button"
                    className="crm-secondary"
                    onClick={() => setModal(false)}
                  >
                    Cancel
                  </button>

                  <button className="crm-primary" type="submit">
                    <Check size={16} /> Save record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {toast && (
          <div className="crm-toast">
            <Check size={16} />

            {toast}
          </div>
        )}
      </main>
      <RecruitmentChat crmData={data} />
    </div>
  );
}
