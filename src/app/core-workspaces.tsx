"use client";

import {
  ArrowRight,
  BarChart3,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  FileText,
  GraduationCap,
  Languages,
  MapPin,
  MessageSquareText,
  Mic2,
  Palette,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  WandSparkles,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { WorkspaceName } from "./integration-workspaces";
import { getLocationSuggestions, matchesStrictLocation, normalizeLocation } from "@/lib/location-search";

const searchJobs = [
  { id: 1, logo: "L", company: "Linear", role: "Product Design Intern", location: "Bengaluru, India", mode: "Hybrid", salary: "₹25K–35K/mo", source: "LinkedIn", match: 96, age: "2h" },
  { id: 2, logo: "C", company: "CRED", role: "UX Research Intern", location: "Bengaluru, India", mode: "On-site", salary: "₹30K–40K/mo", source: "Indeed", match: 91, age: "5h" },
  { id: 3, logo: "R", company: "Razorpay", role: "Associate Product Designer", location: "Hyderabad, India", mode: "Remote", salary: "₹7L–10L/yr", source: "Naukri", match: 88, age: "1d" },
  { id: 4, logo: "Z", company: "Zomato", role: "Visual Design Intern", location: "Gurugram, India", mode: "Hybrid", salary: "₹22K–30K/mo", source: "LinkedIn", match: 84, age: "1d" },
  { id: 5, logo: "A", company: "Atlassian", role: "Product Design Graduate", location: "Remote", mode: "Remote", salary: "₹9L–12L/yr", source: "Indeed", match: 81, age: "2d" },
  { id: 6, logo: "M", company: "Microsoft", role: "UX Design Intern", location: "Hyderabad, India", mode: "Hybrid", salary: "₹35K–45K/mo", source: "LinkedIn", match: 86, age: "6h" },
];

const applications = [
  { company: "BrightLabs", role: "UX Design Intern", source: "LinkedIn", stage: "Interview", date: "22 Apr", color: "#6759d5" },
  { company: "Razorpay", role: "Associate Product Designer", source: "Naukri", stage: "Shortlisted", date: "20 Apr", color: "#3478d4" },
  { company: "CRED", role: "UX Research Intern", source: "Indeed", stage: "Applied", date: "18 Apr", color: "#e2a144" },
  { company: "Linear", role: "Product Design Intern", source: "LinkedIn", stage: "Applied", date: "17 Apr", color: "#20222a" },
  { company: "Meesho", role: "Visual Design Intern", source: "Naukri", stage: "Shortlisted", date: "14 Apr", color: "#d44a82" },
];

const tools = [
  { icon: Target, title: "ATS score checker", copy: "Compare your resume against any job description.", badge: "Most used", tone: "violet" },
  { icon: Mic2, title: "Mock interview", copy: "Practice role-specific questions with live AI feedback.", badge: "12 min", tone: "blue" },
  { icon: Zap, title: "Skill gap analyzer", copy: "Find missing skills and a focused learning path.", badge: "New", tone: "amber" },
  { icon: FileText, title: "Cover letter studio", copy: "Generate a tailored, authentic cover letter.", badge: "AI", tone: "green" },
  { icon: MessageSquareText, title: "Resume feedback", copy: "Turn vague bullets into measurable achievements.", badge: "82 score", tone: "rose" },
  { icon: Languages, title: "Translate profile", copy: "Adapt your resume for international opportunities.", badge: "8 languages", tone: "cyan" },
];

function Header({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: React.ReactNode }) {
  return <header className="core-header"><div><span>{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>{action}</header>;
}

function JobSearchWorkspace({ notify }: { notify: (message: string) => void }) {
  const [term, setTerm] = useState("");
  const [location, setLocation] = useState("");
  const [locationFocused, setLocationFocused] = useState(false);
  const [source, setSource] = useState("All portals");
  const [saved, setSaved] = useState<number[]>([3]);
  const suggestions = useMemo(() => getLocationSuggestions(location), [location]);
  const canonicalLocation = normalizeLocation(location);
  const results = useMemo(() => searchJobs.filter((job) => {
    const keyword = term.trim().toLowerCase();
    const matchesKeyword = !keyword || `${job.role} ${job.company}`.toLowerCase().includes(keyword);
    const matchesSource = source === "All portals" || job.source === source;
    return matchesKeyword && matchesSource && matchesStrictLocation(job.location, location);
  }), [term, location, source]);

  function runSearch() {
    if (location.trim() && !canonicalLocation) {
      notify("Select an exact city from the location suggestions");
      return;
    }
    notify(`${results.length} verified ${canonicalLocation ? `jobs in ${canonicalLocation}` : "matches"} found`);
  }

  return <div className="core-page"><Header eyebrow="Unified discovery" title="Find your next opportunity" copy="Search every connected portal in one place. Location filters are exact and never fall back to all cities." action={<button className="premium-action" onClick={() => notify(`Job alert created${canonicalLocation ? ` for ${canonicalLocation}` : ""}`)}><Plus size={15} />Create alert</button>} />
    <section className="discovery-search"><div><Search size={18} /><input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Role, skill, or company" /></div><div className="location-field"><MapPin size={17} /><input aria-label="Exact job location" autoComplete="off" value={location} onFocus={() => setLocationFocused(true)} onBlur={() => window.setTimeout(() => setLocationFocused(false), 120)} onChange={(e) => { setLocation(e.target.value); setLocationFocused(true); }} placeholder="Type Hyd, Bengaluru, or remote" />{locationFocused && location.trim() && suggestions.length > 0 ? <div className="location-suggestions">{suggestions.map((option) => <button key={option.label} onMouseDown={() => { setLocation(option.label); setLocationFocused(false); }}><MapPin size={13} /><span><b>{option.city}</b><small>{option.country || "Work from anywhere"}</small></span>{option.label === canonicalLocation ? <Check size={13} /> : null}</button>)}</div> : null}</div><button onClick={runSearch}>Search <ArrowRight size={15} /></button></section>
    {location.trim() ? <div className={`location-resolution ${canonicalLocation ? "resolved" : "unresolved"}`}>{canonicalLocation ? <><Check size={12} /><span>Location resolved to <b>{canonicalLocation}</b> · strict filtering active</span></> : <><MapPin size={12} /><span>Choose an exact location. Results will remain empty until the city is confirmed.</span></>}</div> : null}
    <div className="results-toolbar"><div className="portal-tabs">{["All portals", "LinkedIn", "Indeed", "Naukri"].map((item) => <button className={source === item ? "active" : ""} onClick={() => setSource(item)} key={item}>{item}{item === "All portals" && <b>{searchJobs.length}</b>}</button>)}</div><button className="filter-control" onClick={() => notify("Advanced filters opened")}><SlidersHorizontal size={14} />Filters</button><button className="sort-control">Best match <ChevronDown size={13} /></button></div>
    <div className="results-layout"><section className="results-card"><div className="results-head"><div><b>{results.length} curated matches</b><span>{canonicalLocation ? `Showing only ${canonicalLocation}` : "Synced across connected portals"}</span></div><span className="live-label"><i />Strict results</span></div>{results.map((job) => <article className="result-row" key={job.id}><div className={`result-logo logo-${job.id}`}>{job.logo}</div><div className="result-main"><div><h3>{job.role}</h3><span className="source-badge">{job.source}</span></div><b>{job.company}</b><p><MapPin size={12} />{job.location} · {job.mode}<i />{job.salary}</p></div><div className="result-match"><strong>{job.match}%</strong><span>ATS match</span></div><div className="result-actions"><button aria-label="Save job" className={saved.includes(job.id) ? "saved" : ""} onClick={() => setSaved((current) => current.includes(job.id) ? current.filter((id) => id !== job.id) : [...current, job.id])}><Bookmark size={15} fill={saved.includes(job.id) ? "currentColor" : "none"} /></button><button onClick={() => notify(`Application flow opened for ${job.company}`)}>View job</button><small><Clock3 size={11} />{job.age} ago</small></div></article>)}{!results.length && <div className="workspace-empty"><MapPin size={28} /><b>{canonicalLocation ? `No jobs found in ${canonicalLocation}` : "Select an exact location"}</b><span>{canonicalLocation ? "Try another role or explicitly expand your location." : "Choose a city from the suggestions to prevent broad results."}</span><button onClick={() => { setTerm(""); setLocation(""); setSource("All portals"); }}>Clear search</button></div>}</section>
    <aside className="search-aside"><div className="ai-match-card"><Sparkles size={20} /><span>PATHWISE INTELLIGENCE</span><h3>{canonicalLocation ? `${canonicalLocation.split(",")[0]} search active` : "Add a location for precision"}</h3><p>{canonicalLocation ? `Every visible role is explicitly tagged ${canonicalLocation}. No nearby or unrelated cities are included.` : "Choose a city to prevent broad results and improve notification relevance."}</p><button onClick={() => { setLocation("Hyderabad, India"); notify("Hyderabad, India applied"); }}>Search Hyderabad</button></div><div className="source-health"><h3>Portal coverage</h3>{[["LinkedIn", 12], ["Indeed", 8], ["Naukri", 4]].map(([name, count]) => <div key={name}><span><i />{name}</span><b>{count} matches</b></div>)}</div></aside></div>
  </div>;
}

function ResumeWorkspace({ notify }: { notify: (message: string) => void }) {
  const [template, setTemplate] = useState("Classic Professional");
  const [completion, setCompletion] = useState(82);
  return <div className="core-page"><Header eyebrow="Resume studio" title="Build a resume that gets read" copy="Create, optimize, and export an ATS-ready resume with guided AI support." action={<><button className="outline-action" onClick={() => notify("Resume PDF downloaded")}><Download size={15} />Export</button><button className="premium-action" onClick={() => notify("Resume version saved")}><Check size={15} />Save version</button></>} />
    <div className="resume-workspace"><section className="resume-editor"><div className="editor-toolbar"><div><span className="green-status"><i />All changes saved</span><b>Arjun Kumar — Product Designer</b></div><button onClick={() => notify("Profile import started")}><Upload size={14} />Import profile</button></div><div className="resume-form"><div className="form-section"><span>01</span><div><h3>Professional summary</h3><p>Tell recruiters what makes you distinctive.</p></div><button onClick={() => notify("AI summary suggestions generated")}><Sparkles size={13} />Improve with AI</button></div><textarea defaultValue="Product design student focused on accessible, research-led digital experiences. Skilled in turning complex user needs into clear product flows and polished prototypes." /><div className="form-grid"><label>Target role<input defaultValue="Product Designer" /></label><label>Experience level<select defaultValue="Student"><option>Student</option><option>Entry level</option></select></label></div><div className="form-section compact"><span>02</span><div><h3>Experience & projects</h3><p>3 entries · Last updated today</p></div><button onClick={() => { setCompletion(90); notify("New project section added"); }}><Plus size={13} />Add entry</button></div><div className="experience-entry"><div className="entry-icon"><Palette size={17} /></div><div><b>Campus navigation redesign</b><span>Lead Product Designer · Jan–Mar 2024</span><p>Improved task completion by 32% through usability testing and iterative prototyping.</p></div><button>•••</button></div><div className="form-section compact"><span>03</span><div><h3>Skills</h3><p>9 skills matched to your target roles</p></div><button onClick={() => notify("Skill recommendations loaded")}><Plus size={13} />Add skill</button></div><div className="skill-editor">{["Figma", "Prototyping", "User research", "Design systems", "Accessibility", "Interaction design"].map((skill) => <span key={skill}>{skill}<button>×</button></span>)}</div></div></section>
    <aside className="resume-preview-panel"><div className="preview-top"><div><span>LIVE PREVIEW</span><b>{template}</b></div><button onClick={() => notify("Full preview opened")}><Eye size={15} /></button></div><div className={`resume-paper ${template === "Modern Creative" ? "modern" : ""}`}><header><h2>ARJUN KUMAR</h2><p>PRODUCT DESIGNER</p></header><section><b>PROFILE</b><p>Research-led designer creating clear, inclusive digital experiences.</p></section><section><b>EXPERIENCE</b><h4>Campus Navigation Redesign</h4><small>Lead Product Designer · 2024</small><p>Improved task completion by 32% through usability testing.</p></section><section><b>EDUCATION</b><h4>B.Des Interaction Design</h4><small>National Institute of Design · 2025</small></section></div><div className="template-picker"><button className={template === "Classic Professional" ? "active" : ""} onClick={() => setTemplate("Classic Professional")}><span className="template-mini classic" /><b>Classic</b><small>100% ATS</small></button><button className={template === "Modern Creative" ? "active" : ""} onClick={() => setTemplate("Modern Creative")}><span className="template-mini modern" /><b>Modern</b><small>Creative roles</small></button></div><div className="completion-row"><span>Profile strength</span><b>{completion}%</b><i><em style={{ width: `${completion}%` }} /></i></div></aside></div>
  </div>;
}

function ApplicationsWorkspace({ notify }: { notify: (message: string) => void }) {
  const [view, setView] = useState("Pipeline");
  return <div className="core-page"><Header eyebrow="Unified tracker" title="Applications" copy="Every application, interview, and portal update in one reliable timeline." action={<button className="premium-action" onClick={() => notify("Manual application form opened")}><Plus size={15} />Add application</button>} />
    <div className="application-stats">{[["Total applications", "6", "+2 this week"], ["Response rate", "50%", "Top 22% of peers"], ["Interviews", "2", "1 tomorrow"], ["Avg. response", "4.2d", "1.3d faster"]].map(([label, value, detail]) => <div key={label}><span>{label}</span><b>{value}</b><small>{detail}</small></div>)}</div>
    <section className="tracker-card"><div className="tracker-toolbar"><div className="view-switch">{["Pipeline", "List"].map((item) => <button className={view === item ? "active" : ""} onClick={() => setView(item)} key={item}>{item}</button>)}</div><div><button><Search size={14} />Search</button><button><SlidersHorizontal size={14} />Filter</button></div></div>{view === "Pipeline" ? <div className="kanban">{["Applied", "Shortlisted", "Interview"].map((stage) => <div className="kanban-column" key={stage}><header><span className={`stage-dot ${stage.toLowerCase()}`} />{stage}<b>{applications.filter((app) => app.stage === stage).length}</b></header>{applications.filter((app) => app.stage === stage).map((app) => <article key={app.company}><div className="app-company" style={{ background: app.color }}>{app.company[0]}</div><div><h3>{app.role}</h3><b>{app.company}</b></div><span className="app-source">{app.source}</span><p><Clock3 size={11} />Applied {app.date}</p><button onClick={() => notify(`${app.company} application details opened`)}>View details <ArrowRight size={12} /></button></article>)}</div>)}</div> : <div className="application-list">{applications.map((app) => <div key={app.company}><span className="app-company" style={{ background: app.color }}>{app.company[0]}</span><b>{app.role}</b><span>{app.company}</span><em>{app.source}</em><strong>{app.stage}</strong><button onClick={() => notify(`${app.company} application opened`)}>View</button></div>)}</div>}</section>
  </div>;
}

function ToolsWorkspace({ notify }: { notify: (message: string) => void }) {
  return <div className="core-page"><Header eyebrow="AI career lab" title="Tools to sharpen your edge" copy="Practice, improve, and prepare with focused tools built for your next move." /><div className="featured-tool"><div><span><Sparkles size={13} />RECOMMENDED FOR YOU</span><h2>Prepare for tomorrow&apos;s UX interview</h2><p>Run a realistic 12-minute mock interview based on the BrightLabs role. Get feedback on clarity, confidence, and answer structure.</p><button onClick={() => notify("Mock interview room is ready")}><Mic2 size={15} />Start practice interview</button></div><div className="orb"><span>AI</span><i /><i /></div></div><div className="tool-grid">{tools.map(({ icon: Icon, title, copy, badge, tone }) => <article key={title}><div className={`tool-icon ${tone}`}><Icon size={20} /></div><span>{badge}</span><h3>{title}</h3><p>{copy}</p><button onClick={() => notify(`${title} opened`)}>Launch tool <ArrowRight size={13} /></button></article>)}</div>
  </div>;
}

function InsightsWorkspace({ notify }: { notify: (message: string) => void }) {
  const [period, setPeriod] = useState("6 months");
  return <div className="core-page"><Header eyebrow="Career intelligence" title="Insights" copy="Understand your progress, the market, and where your effort performs best." action={<div className="period-select"><span>{period}</span><ChevronDown size={13} /><select value={period} onChange={(e) => setPeriod(e.target.value)}><option>30 days</option><option>3 months</option><option>6 months</option></select></div>} /><div className="insight-stats">{[["Profile views", "148", "+18%", TrendingUp], ["Application rate", "8.4%", "+2.1%", Send], ["Average match", "86%", "+4%", Target], ["Market position", "Top 18%", "+3 places", GraduationCap]].map(([label, value, change, Icon]) => <article key={String(label)}><div><span>{label as string}</span><b>{value as string}</b><small>{change as string} this period</small></div><span className="metric-icon"><Icon size={18} /></span></article>)}</div><div className="analytics-layout"><section className="analytics-card"><header><div><h2>Application performance</h2><p>Applications and employer responses over {period.toLowerCase()}</p></div><span><i />Applications</span><span><i />Responses</span></header><div className="chart"><div className="chart-y"><span>12</span><span>8</span><span>4</span><span>0</span></div><div className="bars">{[[42,18], [58,24], [38,20], [72,38], [62,31], [88,46]].map(([a,b], index) => <div key={index}><span style={{ height: `${a}%` }} /><i style={{ height: `${b}%` }} /><small>{["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"][index]}</small></div>)}</div></div></section><aside className="portal-performance"><h2>Best performing portals</h2><p>Based on interview conversion</p>{[["LinkedIn", "18 applications", 68], ["Indeed", "11 applications", 46], ["Naukri", "8 applications", 34]].map(([name, detail, score], index) => <div className="portal-rank" key={String(name)}><b>{index + 1}</b><div><strong>{name}</strong><span>{detail}</span><i><em style={{ width: `${score}%` }} /></i></div><small>{score}%</small></div>)}<button onClick={() => notify("Full portal analytics opened")}>View detailed report <ArrowRight size={13} /></button></aside></div><section className="market-banner"><div className="market-icon"><BarChart3 size={21} /></div><div><span>MARKET SIGNAL</span><h3>Product design demand is accelerating</h3><p>Internship listings are up 18% in Bengaluru. Fintech and SaaS companies are hiring most actively.</p></div><button onClick={() => notify("Market report opened")}>Explore market report</button></section>
  </div>;
}

export function CoreWorkspace({ active, notify }: { active: WorkspaceName; notify: (message: string) => void }) {
  if (active === "Job search") return <JobSearchWorkspace notify={notify} />;
  if (active === "Resume builder") return <ResumeWorkspace notify={notify} />;
  if (active === "Applications") return <ApplicationsWorkspace notify={notify} />;
  if (active === "Career tools") return <ToolsWorkspace notify={notify} />;
  if (active === "Insights") return <InsightsWorkspace notify={notify} />;
  return null;
}
