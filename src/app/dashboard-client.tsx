"use client";

import {
  ArrowRight,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  Link2,
  MapPin,
  Menu,
  MessageSquareText,
  Moon,
  Sun,
  MoreHorizontal,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SignInButton, SignUpButton, Show, UserButton, useUser } from "@clerk/nextjs";
import { NotificationSettings, PortalConnections, type WorkspaceName } from "./integration-workspaces";
import { CoreWorkspace } from "./core-workspaces";
import { getLocationSuggestions, matchesStrictLocation, normalizeLocation } from "@/lib/location-search";

type Job = {
  id: number;
  company: string;
  initials: string;
  logoClass: string;
  role: string;
  location: string;
  mode: string;
  salary: string;
  type: string;
  posted: string;
  match: number;
  tags: string[];
  featured?: boolean;
};

const jobs: Job[] = [
  {
    id: 1,
    company: "Linear",
    initials: "L",
    logoClass: "logo-linear",
    role: "Product Design Intern",
    location: "Bengaluru, India",
    mode: "Hybrid",
    salary: "₹25K–35K/mo",
    type: "Internship",
    posted: "2h ago",
    match: 96,
    tags: ["Figma", "Prototyping", "Design systems"],
    featured: true,
  },
  {
    id: 2,
    company: "CRED",
    initials: "C",
    logoClass: "logo-cred",
    role: "UX Research Intern",
    location: "Bengaluru, India",
    mode: "On-site",
    salary: "₹30K–40K/mo",
    type: "Internship",
    posted: "5h ago",
    match: 91,
    tags: ["Research", "User testing", "Analytics"],
  },
  {
    id: 3,
    company: "Razorpay",
    initials: "R",
    logoClass: "logo-razor",
    role: "Associate Product Designer",
    location: "Hyderabad, India",
    mode: "Remote",
    salary: "₹7L–10L/yr",
    type: "Full-time",
    posted: "1d ago",
    match: 88,
    tags: ["UI/UX", "Fintech", "Interaction"],
  },
  {
    id: 4,
    company: "Zomato",
    initials: "Z",
    logoClass: "logo-zomato",
    role: "Visual Design Intern",
    location: "Gurugram, India",
    mode: "Hybrid",
    salary: "₹22K–30K/mo",
    type: "Internship",
    posted: "1d ago",
    match: 84,
    tags: ["Visual design", "Branding", "Adobe CC"],
  },
];

const nav: { label: WorkspaceName; icon: typeof Search; count?: number }[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Job search", icon: Search, count: 24 },
  { label: "Resume builder", icon: FileText },
  { label: "Applications", icon: BriefcaseBusiness, count: 6 },
  { label: "Career tools", icon: WandSparkles },
  { label: "Insights", icon: TrendingUp },
  { label: "Portal connections", icon: Link2 },
];

function NavButton({ item, active, onClick }: { item: (typeof nav)[number]; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick}>
      <Icon size={18} strokeWidth={active ? 2.4 : 1.9} />
      <span>{item.label}</span>
      {item.count ? <b>{item.count}</b> : null}
    </button>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
}

export default function DashboardClient() {
  const { user } = useUser();
  const firstName = user?.firstName || user?.username || "there";
  const fullName = user?.fullName || user?.username || "User";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const greeting = getGreeting();
  const formattedDate = getFormattedDate();

  const [activeNav, setActiveNav] = useState<WorkspaceName>("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [locationFocused, setLocationFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All roles");
  const [saved, setSaved] = useState<number[]>([3]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [toast, setToast] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("pathwise-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = savedTheme ? savedTheme === "dark" : prefersDark;
    setDarkMode(shouldUseDark);
    document.documentElement.dataset.theme = shouldUseDark ? "dark" : "light";
  }, []);

  function toggleTheme() {
    setDarkMode((current) => {
      const next = !current;
      document.documentElement.dataset.theme = next ? "dark" : "light";
      window.localStorage.setItem("pathwise-theme", next ? "dark" : "light");
      return next;
    });
  }

  const locationSuggestions = useMemo(() => getLocationSuggestions(location), [location]);
  const normalizedLocation = normalizeLocation(location);
  const filteredJobs = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesKeyword = !keyword || `${job.role} ${job.company} ${job.tags.join(" ")}`.toLowerCase().includes(keyword);
      const matchesLocation = matchesStrictLocation(job.location, location);
      const matchesFilter =
        activeFilter === "All roles" ||
        (activeFilter === "Internships" && job.type === "Internship") ||
        (activeFilter === "Remote" && job.mode === "Remote") ||
        activeFilter === "Design";
      return matchesKeyword && matchesLocation && matchesFilter;
    });
  }, [query, location, activeFilter]);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }, []);

  function toggleSave(id: number) {
    setSaved((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
    notify(saved.includes(id) ? "Removed from saved jobs" : "Job saved to your shortlist");
  }

  function changeNav(label: WorkspaceName) {
    setActiveNav(label);
    setSidebarOpen(false);
  }

  return (
    <div className="app-shell">
      {sidebarOpen ? <button className="mobile-scrim" aria-label="Close menu" onClick={() => setSidebarOpen(false)} /> : null}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><Sparkles size={19} fill="currentColor" /></div>
          <span>Pathwise</span>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar"><X size={20} /></button>
        </div>

        <Show when="signed-in">
          <div className="profile-mini" style={{ cursor: "default" }}>
            <UserButton showName />
          </div>
        </Show>
        <Show when="signed-out">
          <div className="profile-mini" style={{ padding: "0.5rem" }}>
            <SignInButton mode="modal">
              <button className="premium-action" style={{ width: "100%", justifyContent: "center" }}>
                Sign in to Pathwise
              </button>
            </SignInButton>
          </div>
        </Show>

        <nav className="main-nav" aria-label="Main navigation">
          <p>Workspace</p>
          {nav.map((item) => <NavButton key={item.label} item={item} active={activeNav === item.label} onClick={() => changeNav(item.label)} />)}
        </nav>

        <div className="sidebar-grow" />
        <div className="weekly-card">
          <div className="weekly-icon"><Trophy size={17} /></div>
          <div><strong>Weekly goal</strong><span>4 of 5 applications</span></div>
          <div className="goal-track"><i /></div>
          <p>One more to earn the <b>On a roll</b> badge!</p>
        </div>
        <button className={`nav-button settings-button ${activeNav === "Settings" ? "active" : ""}`} onClick={() => changeNav("Settings")}><Settings size={18} /><span>Settings</span></button>
        <div className="sidebar-foot"><span className="online-dot" /> AI assistant is online</div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <button className="menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={21} /></button>
          <div className="mobile-brand"><div className="brand-mark"><Sparkles size={17} fill="currentColor" /></div>Pathwise</div>
          <div className="topbar-context"><span>Pathwise</span><ChevronRight size={13} /><b>{activeNav}</b></div>
          <button className="global-command" onClick={() => { changeNav("Job search"); notify("Global search opened"); }}><Search size={15} /><span>Search jobs, tools, or applications...</span><kbd>⌘ K</kbd></button>
          <div className="topbar-spacer" />
          <div className="topbar-actions">
            <button className="theme-button" aria-label={darkMode ? "Switch to day mode" : "Switch to night mode"} title={darkMode ? "Day mode" : "Night mode"} onClick={toggleTheme}>
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}<span>{darkMode ? "Day" : "Night"}</span>
            </button>
            <button className="icon-button" aria-label="Notifications" onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}>
              <Bell size={18} /><span className="notification-dot" />
            </button>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="theme-button" style={{ fontWeight: 600, cursor: "pointer" }}>Sign in</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="premium-action" style={{ fontWeight: 600, cursor: "pointer" }}>Sign up</button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton showName appearance={{ elements: { userButtonBox: { flexDirection: "row-reverse", gap: "8px" } } }} />
            </Show>
          </div>
          {showNotifications ? (
            <div className="popover notifications-popover">
              <div className="popover-head"><strong>Notifications</strong><span>3 new</span></div>
              <div className="notice"><div className="notice-icon purple"><BriefcaseBusiness size={16} /></div><div><b>8 new jobs match your profile</b><span>Based on Product Design · 12 min ago</span></div></div>
              <div className="notice"><div className="notice-icon green"><CalendarDays size={16} /></div><div><b>Interview tomorrow at 11:00 AM</b><span>BrightLabs · UX Design Intern</span></div></div>
              <div className="notice"><div className="notice-icon amber"><Zap size={16} /></div><div><b>Your resume score improved</b><span>You’re now in the top 18%</span></div></div>
              <button className="popover-action" onClick={() => { setShowNotifications(false); notify("All notifications marked as read"); }}>Mark all as read</button>
            </div>
          ) : null}
          {showProfile ? (
            <div className="popover profile-popover">
              <strong>{fullName}</strong><span>{userEmail}</span>
              <button onClick={() => { setShowProfile(false); changeNav("Settings"); }}><UserRound size={16} /> View profile</button>
              <button onClick={() => { setShowProfile(false); changeNav("Settings"); }}><Settings size={16} /> Preferences</button>
            </div>
          ) : null}
        </header>

        {activeNav === "Portal connections" ? (
          <PortalConnections notify={notify} />
        ) : activeNav === "Settings" ? (
          <NotificationSettings notify={notify} />
        ) : activeNav !== "Overview" ? (
          <CoreWorkspace active={activeNav} notify={notify} />
        ) : (
        <div className="dashboard-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow"><span /> {formattedDate}</p>
              <h1>{greeting}, {firstName} <span>👋</span></h1>
              <p className="welcome-copy">Your next opportunity is closer than you think. Let&apos;s make today count.</p>
            </div>
            <button className="ask-ai-button" onClick={() => notify("Pathwise AI is ready to help") }><Sparkles size={16} fill="currentColor" /> Ask Pathwise AI</button>
          </section>

          <section className="search-card">
            <div className="search-main">
              <Search size={20} />
              <input aria-label="Search jobs" placeholder="Job title, skill, or company" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="search-location location-field">
              <MapPin size={18} />
              <input aria-label="Exact job location" autoComplete="off" placeholder="Type Hyd, Bengaluru, or remote" value={location} onFocus={() => setLocationFocused(true)} onBlur={() => window.setTimeout(() => setLocationFocused(false), 120)} onChange={(e) => { setLocation(e.target.value); setLocationFocused(true); }} />
              {locationFocused && location.trim() && locationSuggestions.length > 0 ? <div className="location-suggestions overview-suggestions">{locationSuggestions.map((option) => <button key={option.label} onMouseDown={() => { setLocation(option.label); setLocationFocused(false); }}><MapPin size={13} /><span><b>{option.city}</b><small>{option.country || "Work from anywhere"}</small></span>{option.label === normalizedLocation ? <Check size={13} /> : null}</button>)}</div> : null}
            </div>
            <button className="search-button" onClick={() => location.trim() && !normalizedLocation ? notify("Select an exact city from the suggestions") : notify(`${filteredJobs.length} ${normalizedLocation ? `jobs in ${normalizedLocation}` : "matching opportunities"} found`)}>Search jobs <ArrowRight size={17} /></button>
          </section>
          {location.trim() ? <div className={`location-resolution overview-resolution ${normalizedLocation ? "resolved" : "unresolved"}`}>{normalizedLocation ? <><Check size={12} />Strict location: <b>{normalizedLocation}</b></> : <><MapPin size={12} />Select an exact location to see results</>}</div> : null}

          <div className="filter-line">
            <div className="filter-chips">
              {["All roles", "Internships", "Design", "Remote"].map((filter) => (
                <button key={filter} className={activeFilter === filter ? "selected" : ""} onClick={() => setActiveFilter(filter)}>{filter}</button>
              ))}
              <button onClick={() => notify("Advanced filters are ready")}><SlidersHorizontal size={14} /> More filters</button>
            </div>
            <span>Updated 8 min ago</span>
          </div>

          <div className="content-grid">
            <div className="primary-column">
              <section className="section-card jobs-section">
                <div className="section-heading">
                  <div><h2>Top matches for you</h2><p>Personalized using your skills and preferences</p></div>
                  <button onClick={() => { setActiveNav("Job search"); notify("Showing all 24 job matches"); }}>View all 24 <ArrowRight size={15} /></button>
                </div>
                <div className="job-list">
                  {filteredJobs.length ? filteredJobs.map((job) => (
                    <article className="job-card" key={job.id} onClick={() => setSelectedJob(job)}>
                      <div className={`company-logo ${job.logoClass}`}>{job.initials}</div>
                      <div className="job-info">
                        <div className="job-title-line"><h3>{job.role}</h3>{job.featured ? <span className="fast-badge"><Zap size={11} fill="currentColor" /> Fast response</span> : null}</div>
                        <p className="company-name">{job.company}</p>
                        <div className="job-meta"><span><MapPin size={13} />{job.location}</span><i /><span>{job.mode}</span><i /><span>{job.type}</span></div>
                        <div className="job-tags">{job.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                      </div>
                      <div className="job-side">
                        <button className={`save-button ${saved.includes(job.id) ? "saved" : ""}`} aria-label="Save job" onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }}><Bookmark size={17} fill={saved.includes(job.id) ? "currentColor" : "none"} /></button>
                        <div className="match-score"><b>{job.match}%</b><span>match</span></div>
                        <strong className="salary">{job.salary}</strong>
                        <span className="posted"><Clock3 size={12} />{job.posted}</span>
                      </div>
                    </article>
                  )) : <div className="empty-state"><MapPin size={30} /><h3>{normalizedLocation ? `No jobs found in ${normalizedLocation}` : "Select an exact location"}</h3><p>{normalizedLocation ? "Try another role or explicitly choose a different city." : "Choose a suggested city to prevent broad results."}</p><button onClick={() => { setQuery(""); setLocation(""); setActiveFilter("All roles"); }}>Clear filters</button></div>}
                </div>
              </section>

              <section className="section-card applications-section">
                <div className="section-heading compact">
                  <div><h2>Your applications</h2><p>Keep your momentum going</p></div>
                  <button onClick={() => changeNav("Applications")}>Open tracker <ArrowRight size={15} /></button>
                </div>
                <div className="pipeline">
                  <div className="pipeline-cell"><span className="pipe-icon blue"><FileCheck2 size={17} /></span><div><b>6</b><small>Applied</small></div></div>
                  <ChevronRight className="pipe-arrow" size={17} />
                  <div className="pipeline-cell"><span className="pipe-icon purple"><Target size={17} /></span><div><b>3</b><small>Shortlisted</small></div></div>
                  <ChevronRight className="pipe-arrow" size={17} />
                  <div className="pipeline-cell"><span className="pipe-icon amber"><MessageSquareText size={17} /></span><div><b>2</b><small>Interviews</small></div></div>
                  <ChevronRight className="pipe-arrow" size={17} />
                  <div className="pipeline-cell"><span className="pipe-icon green"><Trophy size={17} /></span><div><b>0</b><small>Offers</small></div></div>
                </div>
                <div className="interview-strip">
                  <div className="calendar-tile"><b>25</b><span>APR</span></div>
                  <div className="interview-copy"><span>UPCOMING INTERVIEW</span><strong>BrightLabs · UX Design Intern</strong><p>Tomorrow at 11:00 AM · Google Meet</p></div>
                  <button onClick={() => notify("Mock interview session prepared")}><Sparkles size={14} /> Practice with AI</button>
                </div>
              </section>
            </div>

            <aside className="right-column">
              <section className="section-card resume-card">
                <div className="card-top"><div><span className="card-kicker">RESUME HEALTH</span><h2>You&apos;re almost there!</h2></div><div className="resume-file-icon"><FileText size={20} /></div></div>
                <div className="score-row">
                  <div className="score-ring" style={{ "--score": "82%" } as React.CSSProperties}><div><b>82</b><span>ATS score</span></div></div>
                  <div className="score-notes"><strong>Strong foundation</strong><p>Top 18% among design students</p><div className="mini-track"><i /></div></div>
                </div>
                <div className="resume-tip"><Lightbulb size={15} /><p><b>Quick win:</b> Add measurable outcomes to 2 project descriptions.</p></div>
                <button className="full-outline-button" onClick={() => { setActiveNav("Resume builder"); notify("Resume optimizer opened"); }}>Improve my resume <ArrowRight size={15} /></button>
              </section>

              <section className="section-card insight-card">
                <div className="section-heading compact"><div><span className="card-kicker">MARKET PULSE</span><h2>Product design is trending</h2></div><TrendingUp size={20} /></div>
                <p>Internship demand is up <b>18%</b> this month in Bengaluru.</p>
                <div className="salary-box"><div><CircleDollarSign size={17} /><span>Typical intern stipend</span></div><strong>₹28K–38K <small>/ month</small></strong></div>
                <button className="text-link" onClick={() => changeNav("Insights")}>Explore salary insights <ArrowRight size={14} /></button>
              </section>

              <section className="section-card lifecycle-card">
                <div className="section-heading compact"><div><span className="card-kicker">YOUR JOURNEY</span><h2>Career lifecycle</h2></div><span className="stage-label">Stage 3 of 5</span></div>
                <div className="lifecycle-track"><i /><i /><i className="active" /><i /><i /></div>
                <div className="lifecycle-labels"><span>Set up</span><span>Discover</span><span className="active">Apply</span><span>Grow</span><span>Land</span></div>
                <p>Keep applying and use feedback to sharpen your profile.</p>
              </section>
            </aside>
          </div>
        </div>
        )}
      </main>

      {selectedJob ? (
        <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Job details">
          <button className="modal-scrim" aria-label="Close job details" onClick={() => setSelectedJob(null)} />
          <section className="job-modal">
            <button className="modal-close" onClick={() => setSelectedJob(null)}><X size={20} /></button>
            <div className="modal-company"><div className={`company-logo large ${selectedJob.logoClass}`}>{selectedJob.initials}</div><div><p>{selectedJob.company}</p><h2>{selectedJob.role}</h2></div></div>
            <div className="modal-match"><Sparkles size={16} /><b>{selectedJob.match}% profile match</b><span>Your portfolio and 7 skills align with this role.</span></div>
            <div className="modal-facts"><span><MapPin size={15} />{selectedJob.location}</span><span><BriefcaseBusiness size={15} />{selectedJob.type} · {selectedJob.mode}</span><span><CircleDollarSign size={15} />{selectedJob.salary}</span></div>
            <h3>Why you&apos;re a great fit</h3>
            <ul><li><Check size={15} />Your Figma and prototyping experience matches the role.</li><li><Check size={15} />Your preferred work location is a match.</li><li><Check size={15} />Your latest resume meets the core ATS criteria.</li></ul>
            <div className="modal-actions"><button className="secondary-button" onClick={() => toggleSave(selectedJob.id)}><Bookmark size={16} fill={saved.includes(selectedJob.id) ? "currentColor" : "none"} />{saved.includes(selectedJob.id) ? "Saved" : "Save"}</button><button className="primary-button" onClick={() => { notify("Application started — resume auto-fill is ready"); setSelectedJob(null); }}>Quick apply <ArrowRight size={16} /></button></div>
          </section>
        </div>
      ) : null}

      {toast ? <div className="toast"><Check size={16} />{toast}</div> : null}
    </div>
  );
}
