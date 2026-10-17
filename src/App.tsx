import {
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

type Portal = "login" | "bhw" | "resident"
type Resident = {
  id: string
  firstName: string
  middleName: string
  lastName: string
  birthDate: string
  sex: string
  civilStatus: string
  sitio: string
  house: string
  street: string
  mobile: string
  email: string
  classification: string
  username: string
  password: string
  status: "Active" | "Inactive" | "Password Reset Required"
  createdAt: string
  photo?: string
}
type Consultation = {
  id: string
  residentId: string
  date: string
  consultationType: string
  encounterType: string
  assignedBhw: string
  personnel: string
  location: string
  chiefComplaint: string
  onset: string
  severity: string
  symptoms: string
  history: string
  findings: string
  assessment: string
  diagnosis: string
  treatment: string
  homeCare: string
  advice: string
  warningSigns: string
  followUpDate: string
  followUpType: string
  referral: string
  referralStatus: string
  status: "Draft" | "Finalized"
  updatedAt: string
}
type MedicineLine = {
  id: string
  name: string
  strength: string
  dose: string
  frequency: string
  route: string
  duration: string
  quantity: string
  instructions: string
}
type Prescription = {
  id: string
  residentId: string
  date: string
  diagnosis: string
  prescriber: string
  designation: string
  followUpDate: string
  notes: string
  medicines: MedicineLine[]
  status: "Draft" | "Active" | "Completed" | "Cancelled"
  updatedAt: string
}
type Medicine = {
  id: string
  name: string
  generic: string
  brand: string
  strength: string
  form: string
  unit: string
  minimum: number
  stock: number
  expiration: string
  batch: string
  notes: string
}
type Message = {
  id: string
  residentId: string
  sender: "bhw" | "resident"
  text: string
  at: string
  image?: string
}
type Announcement = {
  id: string
  title: string
  content: string
  date: string
  status: "Draft" | "Published"
  image?: string
}
type HealthRecord = {
  id: string
  residentId: string
  date: string
  bloodPressure: string
  pulse: string
  respiratory: string
  temperature: string
  oxygen: string
  height: string
  weight: string
  history: string
  conditions: string
  allergies: string
  notes: string
}
type AppData = {
  residents: Resident[]
  consultations: Consultation[]
  prescriptions: Prescription[]
  medicines: Medicine[]
  messages: Message[]
  announcements: Announcement[]
  healthRecords: HealthRecord[]
  bhw: { name: string; contact: string; username: string; photo?: string }
  center: {
    overview: string
    mission: string
    hours: string
    contact: string
    services: string[]
    image?: string
  }
}

const SITIOS = [
  "Dahlia",
  "Calachuchi",
  "Camia",
  "Everlasting",
  "Sampaguita",
  "Caballero",
  "Ilang-Ilang",
]
const CLASSES = [
  "Infant / Child",
  "PWD",
  "Normal Resident",
  "Senior Citizen",
  "Pregnant",
  "4Ps Beneficiary",
]
const today = () => new Date().toISOString().slice(0, 10)
const now = () => new Date().toISOString()
const initialData: AppData = {
  residents: [],
  consultations: [],
  prescriptions: [],
  medicines: [],
  messages: [],
  announcements: [],
  healthRecords: [],
  bhw: { name: "Barangay Health Worker", contact: "", username: "bhw2026" },
  center: {
    overview:
      "The Barangay San Pedro Health Center coordinates preventive care, health monitoring, consultations and essential medicine support through MEDNEXUS.",
    mission:
      "To provide accessible, organized and compassionate primary health services to every resident of Barangay San Pedro.",
    hours: "Monday–Friday, 8:00 AM–5:00 PM",
    contact: "Barangay San Pedro Health Center",
    services: [
      "Resident Health Records",
      "Maternal & Infant Care",
      "Consultations & Follow-ups",
      "Medicine Dispensing",
      "Health Education",
      "Community Announcements",
    ],
  },
}

function loadData(): AppData {
  try {
    const saved = localStorage.getItem("mednexus-data-v3")
    return saved ? { ...initialData, ...JSON.parse(saved) } : initialData
  } catch {
    return initialData
  }
}
const ageOf = (date: string) => {
  if (!date) return ""
  const d = new Date(date)
  const n = new Date()
  let age = n.getFullYear() - d.getFullYear()
  if (
    n.getMonth() < d.getMonth() ||
    (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())
  )
    age--
  return Math.max(age, 0)
}
const fullName = (r?: Resident) =>
  r
    ? [r.firstName, r.middleName, r.lastName].filter(Boolean).join(" ")
    : "Unknown resident"
const nextId = (prefix: string, length: number) =>
  `${prefix}-${String(length + 1).padStart(6, "0")}`
const medicineLine = (): MedicineLine => ({
  id: crypto.randomUUID(),
  name: "",
  strength: "",
  dose: "",
  frequency: "",
  route: "",
  duration: "",
  quantity: "",
  instructions: "",
})
const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase() || "HC"

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    health: (
      <>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
        <path d="M8 12h2l1-3 2 6 1-3h2" />
      </>
    ),
    consult: (
      <>
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </>
    ),
    rx: (
      <>
        <path d="M5 4h9a4 4 0 0 1 0 8H5z" />
        <path d="m12 12 7 8M5 4v16" />
      </>
    ),
    box: (
      <>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="M3.3 7 12 12l8.7-5M12 22V12" />
      </>
    ),
    message: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    report: (
      <>
        <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7h.01" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    menu: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
      </>
    ),
    arrow: (
      <>
        <path d="m9 18 6-6-6-6" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6" />
      </>
    ),
    print: (
      <>
        <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <path d="M6 14h12v8H6z" />
      </>
    ),
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.info}
    </svg>
  )
}

function Button({
  children,
  variant = "primary",
  icon,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  icon?: string
}) {
  return (
    <button className={`btn btn-${variant}`} {...props}>
      {icon && <Icon name={icon} size={17} />}
      <span>{children}</span>
    </button>
  )
}
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <label className={`field ${error ? "has-error" : ""}`}>
      <span>
        {label}
        {required && <b aria-label="required"> *</b>}
      </span>
      {children}
      {error && <small>{error}</small>}
    </label>
  )
}
function Avatar({
  name,
  src,
  size = "md",
  onClick,
}: {
  name: string
  src?: string
  size?: "sm" | "md" | "lg" | "xl"
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      className={`avatar avatar-${size}`}
      onClick={onClick}
      aria-label={`View ${name}'s photo`}
    >
      {src ? <img src={src} alt={name} /> : <span>{initials(name)}</span>}
    </button>
  )
}
function Empty({
  icon,
  title,
  text,
  action,
}: {
  icon: string
  title: string
  text: string
  action?: ReactNode
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name={icon} size={28} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  )
}
function Modal({
  title,
  subtitle,
  children,
  onClose,
  wide = false,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  onClose: () => void
  wide?: boolean
}) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", f)
    return () => window.removeEventListener("keydown", f)
  }, [onClose])
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className={`modal ${wide ? "modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <Button
            variant="ghost"
            icon="close"
            onClick={onClose}
            aria-label="Close"
          >
            Close
          </Button>
        </div>
        {children}
      </section>
    </div>
  )
}
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="toast">
      <span>✓</span>
      {message}
    </div>
  )
}

const BHW_NAV = [
  ["dashboard", "Dashboard", "dashboard"],
  ["residents", "Resident Registration", "users"],
  ["health", "Health Records", "health"],
  ["consultations", "Consultations", "consult"],
  ["prescriptions", "Prescriptions", "rx"],
  ["inventory", "Medicine Inventory", "box"],
  ["messages", "Messages", "message"],
  ["announcements", "Announcements", "bell"],
  ["about", "About Health Center", "info"],
  ["reports", "Reports", "report"],
  ["notifications", "Notifications", "bell"],
]
const RES_NAV = [
  ["dashboard", "Dashboard", "dashboard"],
  ["health", "My Health Records", "health"],
  ["consultations", "My Consultations", "consult"],
  ["prescriptions", "My Prescriptions", "rx"],
  ["medications", "My Medication History", "box"],
  ["availability", "Medicine Availability", "box"],
  ["messages", "Messages", "message"],
  ["announcements", "Announcements", "bell"],
  ["about", "About Health Center", "info"],
  ["notifications", "Notifications", "bell"],
]

export default function App() {
  const [data, setData] = useState<AppData>(loadData)
  const [portal, setPortal] = useState<Portal>("login")
  const [residentId, setResidentId] = useState("")
  const [page, setPage] = useState("dashboard")
  const [sidebar, setSidebar] = useState(false)
  const [toast, setToast] = useState("")
  const [photo, setPhoto] = useState<string>()
  useEffect(() => {
    localStorage.setItem("mednexus-data-v3", JSON.stringify(data))
  }, [data])
  const currentResident = data.residents.find((r) => r.id === residentId)
  const login = (role: Portal, id = "") => {
    setPortal(role)
    setResidentId(id)
    setPage("dashboard")
  }
  const logout = () => {
    setPortal("login")
    setResidentId("")
    setPage("dashboard")
  }
  const notify = (message: string) => setToast(message)
  if (portal === "login") return <Login data={data} onLogin={login} />
  const nav = portal === "bhw" ? BHW_NAV : RES_NAV
  const userName = portal === "bhw" ? data.bhw.name : fullName(currentResident)
  const userPhoto = portal === "bhw" ? data.bhw.photo : currentResident?.photo
  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebar ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            M<span>+</span>
          </div>
          <div>
            <strong>MEDNEXUS</strong>
            <small>San Pedro Health Center</small>
          </div>
        </div>
        <div className="sidebar-user">
          <Avatar name={userName} src={userPhoto} />
          <div>
            <strong>{userName}</strong>
            <span>
              {portal === "bhw"
                ? "Barangay Health Worker"
                : currentResident?.id}
            </span>
          </div>
        </div>
        <nav>
          {nav.map(([id, label, icon]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => {
                setPage(id)
                setSidebar(false)
              }}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {page === id && <i />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className={page === "profile" ? "active" : ""}
            onClick={() => {
              setPage("profile")
              setSidebar(false)
            }}
          >
            <Icon name="profile" />
            <span>My Profile</span>
            {page === "profile" && <i />}
          </button>
          <button onClick={logout}>
            <Icon name="logout" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setSidebar(!sidebar)}>
            <Icon name="menu" />
          </button>
          <div className="top-context">
            <span>Barangay San Pedro</span>
            <strong>
              {nav.find((n) => n[0] === page)?.[1] || "My Profile"}
            </strong>
          </div>
          <div className="top-actions">
            <button
              onClick={() => setPage("notifications")}
              aria-label="Notifications"
            >
              <Icon name="bell" />
              {portal === "bhw" &&
                data.messages.filter((m) => m.sender === "resident").length >
                  0 && <b />}
            </button>
            <Avatar
              name={userName}
              src={userPhoto}
              size="sm"
              onClick={() => setPage("profile")}
            />
          </div>
        </header>
        <main>
          {portal === "bhw" ? (
            <BhwPage
              page={page}
              data={data}
              setData={setData}
              go={setPage}
              notify={notify}
              viewPhoto={setPhoto}
            />
          ) : (
            <ResidentPage
              page={page}
              data={data}
              resident={currentResident!}
              setData={setData}
              go={setPage}
              notify={notify}
              viewPhoto={setPhoto}
            />
          )}
        </main>
        <footer className="site-footer">
          <span>
            MEDNEXUS 2026 · Barangay San Pedro, Naujan, Oriental Mindoro
          </span>
          <span>Created by De Castro et al.</span>
        </footer>
      </div>
      {sidebar && (
        <button
          className="scrim"
          onClick={() => setSidebar(false)}
          aria-label="Close menu"
        />
      )}
      {toast && <Toast message={toast} onDone={() => setToast("")} />}
      {photo && (
        <div className="lightbox" onClick={() => setPhoto(undefined)}>
          <button aria-label="Close">
            <Icon name="close" />
          </button>
          <img src={photo} alt="Enlarged preview" />
        </div>
      )}
    </div>
  )
}

function Login({
  data,
  onLogin,
}: {
  data: AppData
  onLogin: (p: Portal, id?: string) => void
}) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setTimeout(() => {
      if (username === "bhw2026" && password === "bhwofsanpedro") onLogin("bhw")
      else {
        const r = data.residents.find(
          (x) =>
            (x.username.toLowerCase() === username.toLowerCase() ||
              x.id === username) &&
            x.password === password &&
            x.status === "Active",
        )
        if (r) onLogin("resident", r.id)
        else {
          setError("Invalid username or password. Please try again.")
          setLoading(false)
        }
      }
    }, 550)
  }
  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-brand">
          <div className="brand-mark large">
            M<span>+</span>
          </div>
          <span>Barangay San Pedro Health Center</span>
        </div>
        <div className="story-copy">
          <span className="eyebrow">Community health, connected</span>
          <h1>
            Care that begins
            <br />
            close to home.
          </h1>
          <p>
            Organized records, coordinated services, and trusted support for
            every registered resident of Barangay San Pedro.
          </p>
          <div className="story-features">
            <div>
              <Icon name="health" />
              <span>
                <b>Connected care</b>
                <small>One resident, one secure health record</small>
              </span>
            </div>
            <div>
              <Icon name="consult" />
              <span>
                <b>Coordinated service</b>
                <small>From consultation to follow-up</small>
              </span>
            </div>
          </div>
        </div>
        <div className="login-meta">
          <span>MEDNEXUS · 2026</span>
          <span>Created by De Castro et al.</span>
        </div>
        <div className="orb orb-one" />
        <div className="orb orb-two" />
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="secure-label">
            <span>
              <Icon name="health" size={16} />
            </span>
            Secure health center access
          </div>
          <h2>Welcome back</h2>
          <p>Sign in to continue to your MEDNEXUS portal.</p>
          {error && <div className="alert error">{error}</div>}
          <Field label="Username" required>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Enter your username"
            />
          </Field>
          <Field label="Password" required>
            <div className="password-input">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? "Hide password" : "Show password"}
              >
                <Icon name="eye" />
              </button>
            </div>
          </Field>
          <div className="login-options">
            <label>
              <input type="checkbox" /> Keep me signed in
            </label>
            <button
              type="button"
              onClick={() =>
                setError(
                  "Please contact the Barangay San Pedro Health Center to recover your account.",
                )
              }
            >
              Forgot password?
            </button>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in securely"}
          </Button>
          <div className="privacy">
            <Icon name="info" size={17} />
            <span>
              Your health information is protected and available only to
              authorized users.
            </span>
          </div>
        </form>
        <div className="login-footer">
          <span>
            Medical Network for Enhanced eXchange and Unified Services
          </span>
          <b>MEDNEXUS</b>
        </div>
      </section>
    </main>
  )
}

function BhwPage({
  page,
  data,
  setData,
  go,
  notify,
  viewPhoto,
}: {
  page: string
  data: AppData
  setData: React.Dispatch<React.SetStateAction<AppData>>
  go: (p: string) => void
  notify: (m: string) => void
  viewPhoto: (s: string) => void
}) {
  if (page === "dashboard") return <Dashboard data={data} go={go} />
  if (page === "residents")
    return (
      <Residents
        data={data}
        setData={setData}
        notify={notify}
        go={go}
        viewPhoto={viewPhoto}
      />
    )
  if (page === "health")
    return <HealthRecords data={data} setData={setData} notify={notify} />
  if (page === "consultations")
    return <Consultations data={data} setData={setData} notify={notify} />
  if (page === "prescriptions")
    return <Prescriptions data={data} setData={setData} notify={notify} />
  if (page === "inventory")
    return <Inventory data={data} setData={setData} notify={notify} />
  if (page === "messages")
    return (
      <Messages
        data={data}
        setData={setData}
        resident={undefined}
        notify={notify}
        viewPhoto={viewPhoto}
      />
    )
  if (page === "announcements")
    return (
      <Announcements
        data={data}
        setData={setData}
        notify={notify}
        viewPhoto={viewPhoto}
      />
    )
  if (page === "about")
    return (
      <About
        data={data}
        setData={setData}
        notify={notify}
        editable
        viewPhoto={viewPhoto}
      />
    )
  if (page === "reports") return <Reports data={data} />
  if (page === "profile")
    return (
      <Profile
        data={data}
        setData={setData}
        notify={notify}
        role="bhw"
        viewPhoto={viewPhoto}
      />
    )
  return <Notifications data={data} go={go} />
}

function PageHead({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <span>{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  )
}
function LiveGreeting({
  name,
  resident,
  birthdays = 0,
}: {
  name: string
  resident?: Resident
  birthdays?: number
}) {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(i)
  }, [])
  const h = time.getHours()
  const greeting =
    h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening"
  const birthday =
    resident &&
    resident.birthDate &&
    new Date(resident.birthDate).getMonth() === time.getMonth() &&
    new Date(resident.birthDate).getDate() === time.getDate()
  return (
    <section className={`welcome-banner ${birthday ? "birthday" : ""}`}>
      <div>
        <span className="eyebrow">
          {birthday
            ? "A special day in your health journey"
            : "MEDNEXUS operations center"}
        </span>
        <h1>
          {birthday
            ? `Happy Birthday, ${name}!`
            : `${greeting}, ${
                name === "Barangay Health Worker" ? "BHW" : name
              }!`}
        </h1>
        <p>
          {birthday
            ? "Wishing you a wonderful day filled with happiness, good health, and beautiful memories."
            : "Here is today’s community health overview for Barangay San Pedro."}
        </p>
        {birthdays > 0 && (
          <span className="birthday-pill">
            {birthdays} resident {birthdays === 1 ? "birthday" : "birthdays"}{" "}
            today
          </span>
        )}
      </div>
      <div className="clock">
        <strong>
          {time.toLocaleTimeString("en-PH", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </strong>
        <span>
          {time.toLocaleDateString("en-PH", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
      <div className="banner-shape" />
    </section>
  )
}
function Dashboard({ data, go }: { data: AppData; go: (p: string) => void }) {
  const day = new Date()
  const birthdayResidents = data.residents.filter((r) => {
    const d = new Date(r.birthDate)
    return (
      r.birthDate &&
      d.getMonth() === day.getMonth() &&
      d.getDate() === day.getDate()
    )
  })
  const low = data.medicines.filter((m) => m.stock > 0 && m.stock <= 50).length
  const out = data.medicines.filter((m) => m.stock === 0).length
  const metrics = [
    ["Total Residents", data.residents.length, "users", "residents"],
    ["Health Records", data.healthRecords.length, "health", "health"],
    [
      "Consultations",
      data.consultations.filter((c) => c.status === "Finalized").length,
      "consult",
      "consultations",
    ],
    [
      "Prescriptions",
      data.prescriptions.filter((p) => p.status !== "Draft").length,
      "rx",
      "prescriptions",
    ],
    [
      "Available Medicines",
      data.medicines.filter((m) => m.stock > 50).length,
      "box",
      "inventory",
    ],
    ["Low / Out of Stock", low + out, "bell", "inventory"],
    [
      "Pending Drafts",
      data.consultations.filter((c) => c.status === "Draft").length +
        data.prescriptions.filter((p) => p.status === "Draft").length,
      "edit",
      "consultations",
    ],
    [
      "Unread Messages",
      data.messages.filter((m) => m.sender === "resident").length,
      "message",
      "messages",
    ],
  ]
  return (
    <div>
      <LiveGreeting name={data.bhw.name} birthdays={birthdayResidents.length} />
      <div className="metric-grid">
        {metrics.map(([label, value, icon, target]) => (
          <button
            className="metric-card"
            key={String(label)}
            onClick={() => go(String(target))}
          >
            <span className="metric-icon">
              <Icon name={String(icon)} />
            </span>
            <div>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
            <Icon name="arrow" size={17} />
          </button>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="card quick-card">
          <div className="card-title">
            <div>
              <h2>Quick actions</h2>
              <p>Start common health center workflows.</p>
            </div>
          </div>
          <div className="quick-grid">
            {[
              ["Register Resident", "residents", "users"],
              ["Add Health Record", "health", "health"],
              ["New Consultation", "consultations", "consult"],
              ["Create Prescription", "prescriptions", "rx"],
              ["Medicine Inventory", "inventory", "box"],
              ["Open Messages", "messages", "message"],
              ["Add Announcement", "announcements", "bell"],
              ["View Reports", "reports", "report"],
            ].map(([l, p, i]) => (
              <button key={l} onClick={() => go(p)}>
                <span>
                  <Icon name={i} />
                </span>
                {l}
                <Icon name="arrow" size={16} />
              </button>
            ))}
          </div>
        </section>
        <section className="card">
          <div className="card-title">
            <div>
              <h2>Today’s birthdays</h2>
              <p>Residents celebrating today.</p>
            </div>
            <span className="count-badge">{birthdayResidents.length}</span>
          </div>
          {birthdayResidents.length ? (
            <div className="simple-list">
              {birthdayResidents.map((r) => (
                <div key={r.id}>
                  <Avatar name={fullName(r)} src={r.photo} />
                  <span>
                    <b>{fullName(r)}</b>
                    <small>
                      {r.id} · Turning {ageOf(r.birthDate)}
                    </small>
                  </span>
                  <Button variant="ghost" onClick={() => go("residents")}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              icon="users"
              title="No birthdays today"
              text="Resident birthdays will appear here automatically."
            />
          )}
        </section>
        <section className="card span-two">
          <div className="card-title">
            <div>
              <h2>Recent clinical activity</h2>
              <p>Latest finalized records from connected resident profiles.</p>
            </div>
          </div>
          {data.consultations.filter((c) => c.status === "Finalized").length ? (
            <div className="activity-list">
              {data.consultations
                .filter((c) => c.status === "Finalized")
                .slice(-5)
                .reverse()
                .map((c) => (
                  <div key={c.id}>
                    <span className="activity-dot" />
                    <div>
                      <b>
                        {fullName(
                          data.residents.find((r) => r.id === c.residentId),
                        )}
                      </b>
                      <p>
                        Consultation {c.id} · <strong>{c.diagnosis}</strong>
                      </p>
                    </div>
                    <time>{new Date(c.updatedAt).toLocaleDateString()}</time>
                  </div>
                ))}
            </div>
          ) : (
            <Empty
              icon="consult"
              title="No clinical activity yet"
              text="Finalized consultations and records will appear here."
            />
          )}
        </section>
        <section className="card">
          <div className="card-title">
            <div>
              <h2>Inventory alerts</h2>
              <p>Items needing attention.</p>
            </div>
          </div>
          {low + out ? (
            <div className="simple-list">
              {data.medicines
                .filter((m) => m.stock <= 50)
                .map((m) => (
                  <div key={m.id}>
                    <span
                      className={`status-dot ${m.stock ? "warning" : "danger"}`}
                    />
                    <span>
                      <b>{m.name}</b>
                      <small>
                        {m.stock} {m.unit} remaining
                      </small>
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <Empty
              icon="box"
              title="No inventory alerts"
              text="Low-stock and out-of-stock medicines will appear here."
            />
          )}
        </section>
      </div>
    </div>
  )
}

function Residents({
  data,
  setData,
  notify,
  go,
  viewPhoto,
}: {
  data: AppData
  setData: React.Dispatch<React.SetStateAction<AppData>>
  notify: (m: string) => void
  go: (p: string) => void
  viewPhoto: (s: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<Resident>()
  const [search, setSearch] = useState("")
  const [sitio, setSitio] = useState("")
  const [classification, setClassification] = useState("")
  const list = data.residents.filter(
    (r) =>
      (!search ||
        `${r.id} ${fullName(r)} ${r.username} ${r.mobile}`
          .toLowerCase()
          .includes(search.toLowerCase())) &&
      (!sitio || r.sitio === sitio) &&
      (!classification || r.classification === classification),
  )
  return (
    <div>
      <PageHead
        eyebrow="Residents"
        title="Resident Registration"
        description="Create and manage one connected identity for every registered resident."
        actions={
          <Button icon="plus" onClick={() => setOpen(true)}>
            Register Resident
          </Button>
        }
      />
      <div className="toolbar">
        <div className="search-box">
          <Icon name="search" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ID, name, username or contact"
          />
        </div>
        <select value={sitio} onChange={(e) => setSitio(e.target.value)}>
          <option value="">All Sitios</option>
          {SITIOS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          value={classification}
          onChange={(e) => setClassification(e.target.value)}
        >
          <option value="">All Types</option>
          {CLASSES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        {(search || sitio || classification) && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("")
              setSitio("")
              setClassification("")
            }}
          >
            Clear filters
          </Button>
        )}
      </div>
      <div className="card table-card">
        <div className="result-count">
          {list.length} resident{list.length !== 1 ? "s" : ""}
        </div>
        {list.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Resident ID</th>
                  <th>Classification</th>
                  <th>Sitio</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="person-cell">
                        <Avatar
                          name={fullName(r)}
                          src={r.photo}
                          size="sm"
                          onClick={() => r.photo && viewPhoto(r.photo)}
                        />
                        <span>
                          <b>{fullName(r)}</b>
                          <small>
                            {ageOf(r.birthDate)} years · {r.sex}
                          </small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <code>{r.id}</code>
                    </td>
                    <td>
                      <span className="chip neutral">{r.classification}</span>
                    </td>
                    <td>{r.sitio}</td>
                    <td>{r.mobile || "—"}</td>
                    <td>
                      <span className="chip success">{r.status}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <Button
                          variant="ghost"
                          icon="eye"
                          onClick={() => setView(r)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          icon="consult"
                          onClick={() => go("consultations")}
                        >
                          Consult
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            icon="users"
            title={
              data.residents.length
                ? "No matching records found"
                : "No residents registered yet"
            }
            text={
              data.residents.length
                ? "Try changing or clearing the selected filters."
                : "Residents registered by the health center will appear here."
            }
            action={
              <Button icon="plus" onClick={() => setOpen(true)}>
                Register Resident
              </Button>
            }
          />
        )}
      </div>
      {open && (
        <ResidentForm
          data={data}
          onClose={() => setOpen(false)}
          onSave={(r) => {
            setData((d) => ({ ...d, residents: [...d.residents, r] }))
            setOpen(false)
            notify("Resident registered successfully.")
            setView(r)
          }}
        />
      )}
      {view && (
        <ResidentDetail
          resident={view}
          data={data}
          onClose={() => setView(undefined)}
        />
      )}
    </div>
  )
}
function ResidentForm({
  data,
  onClose,
  onSave,
}: {
  data: AppData
  onClose: () => void
  onSave: (r: Resident) => void
}) {
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState<Resident>({
    id: nextId("SP", data.residents.length),
    firstName: "",
    middleName: "",
    lastName: "",
    birthDate: "",
    sex: "",
    civilStatus: "",
    sitio: "",
    house: "",
    street: "",
    mobile: "",
    email: "",
    classification: "Normal Resident",
    username: "",
    password: "",
    status: "Active",
    createdAt: now(),
  })
  const [confirm, setConfirm] = useState("")
  const update = (k: keyof Resident, v: string) =>
    setForm((f) => ({ ...f, [k]: v }))
  const next = () => {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (!form.firstName) e.firstName = "First name is required."
      if (!form.lastName) e.lastName = "Last name is required."
      if (!form.birthDate) e.birthDate = "Date of birth is required."
      if (!form.sex) e.sex = "Please select sex."
    }
    if (step === 1 && !form.sitio) e.sitio = "Please select a Sitio."
    if (step === 2) {
      if (!form.username) e.username = "Username is required."
      if (
        data.residents.some(
          (r) => r.username.toLowerCase() === form.username.toLowerCase(),
        )
      )
        e.username = "This username is already in use."
      if (form.password.length < 8) e.password = "Use at least 8 characters."
      if (form.password !== confirm)
        e.confirm = "Password confirmation does not match."
    }
    setErrors(e)
    if (!Object.keys(e).length) setStep((s) => s + 1)
  }
  return (
    <Modal
      title="Register Resident"
      subtitle={`${form.id} · One connected resident record`}
      onClose={onClose}
      wide
    >
      <div className="progress">
        {["Personal", "Address & classification", "Account", "Review"].map(
          (s, i) => (
            <div className={i <= step ? "active" : ""} key={s}>
              <span>{i + 1}</span>
              <b>{s}</b>
            </div>
          ),
        )}
      </div>
      <div className="modal-body form-body">
        {step === 0 && (
          <FormSection
            title="Personal information"
            text="Record the resident's verified identity."
          >
            <div className="form-grid">
              <Field label="Resident ID">
                <input value={form.id} readOnly />
              </Field>
              <Field label="First name" required error={errors.firstName}>
                <input
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                />
              </Field>
              <Field label="Middle name">
                <input
                  value={form.middleName}
                  onChange={(e) => update("middleName", e.target.value)}
                />
              </Field>
              <Field label="Last name" required error={errors.lastName}>
                <input
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                />
              </Field>
              <Field label="Date of birth" required error={errors.birthDate}>
                <input
                  type="date"
                  max={today()}
                  value={form.birthDate}
                  onChange={(e) => update("birthDate", e.target.value)}
                />
              </Field>
              <Field label="Age">
                <input
                  value={ageOf(form.birthDate)}
                  readOnly
                  placeholder="Calculated automatically"
                />
              </Field>
              <Field label="Sex" required error={errors.sex}>
                <select
                  value={form.sex}
                  onChange={(e) => update("sex", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Prefer not to say</option>
                </select>
              </Field>
              <Field label="Civil status">
                <select
                  value={form.civilStatus}
                  onChange={(e) => update("civilStatus", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Widowed</option>
                  <option>Separated</option>
                </select>
              </Field>
              <Field label="Mobile number">
                <input
                  value={form.mobile}
                  onChange={(e) => update("mobile", e.target.value)}
                  placeholder="09XX XXX XXXX"
                />
              </Field>
              <Field label="Email address">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </Field>
            </div>
          </FormSection>
        )}
        {step === 1 && (
          <FormSection
            title="Address & classification"
            text="Barangay, municipality and province are fixed for this community."
          >
            <div className="form-grid">
              <Field label="House / Block / Lot">
                <input
                  value={form.house}
                  onChange={(e) => update("house", e.target.value)}
                />
              </Field>
              <Field label="Street">
                <input
                  value={form.street}
                  onChange={(e) => update("street", e.target.value)}
                />
              </Field>
              <Field label="Sitio" required error={errors.sitio}>
                <select
                  value={form.sitio}
                  onChange={(e) => update("sitio", e.target.value)}
                >
                  <option value="">Select Sitio</option>
                  {SITIOS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Barangay">
                <input value="San Pedro" readOnly />
              </Field>
              <Field label="Municipality">
                <input value="Naujan" readOnly />
              </Field>
              <Field label="Province">
                <input value="Oriental Mindoro" readOnly />
              </Field>
              <Field label="Resident classification" required>
                <select
                  value={form.classification}
                  onChange={(e) => update("classification", e.target.value)}
                >
                  {CLASSES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
          </FormSection>
        )}
        {step === 2 && (
          <FormSection
            title="Account creation"
            text="Credentials create the resident's private portal access. Existing passwords are never shown later."
          >
            <div className="form-grid">
              <Field label="Resident ID">
                <input value={form.id} readOnly />
              </Field>
              <Field label="Username" required error={errors.username}>
                <input
                  value={form.username}
                  onChange={(e) => update("username", e.target.value)}
                />
              </Field>
              <Field label="Password" required error={errors.password}>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Confirm password" required error={errors.confirm}>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Account status">
                <select
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Password Reset Required</option>
                </select>
              </Field>
            </div>
          </FormSection>
        )}
        {step === 3 && (
          <div className="review">
            <FormSection
              title="Review resident registration"
              text="Confirm all information before creating the connected account."
            >
              <Review
                title="Personal information"
                values={[
                  ["Full name", fullName(form)],
                  ["Resident ID", form.id],
                  ["Date of birth", form.birthDate],
                  ["Sex", form.sex],
                  ["Contact", form.mobile || "Not provided"],
                ]}
              />
              <Review
                title="Address & classification"
                values={[
                  [
                    "Address",
                    [
                      form.house,
                      form.street,
                      form.sitio,
                      "San Pedro, Naujan, Oriental Mindoro",
                    ]
                      .filter(Boolean)
                      .join(", "),
                  ],
                  ["Classification", form.classification],
                ]}
              />
              <Review
                title="Account"
                values={[
                  ["Username", form.username],
                  ["Status", form.status],
                  ["Password", "Securely set and hidden"],
                ]}
              />
            </FormSection>
          </div>
        )}
      </div>
      <div className="modal-foot">
        <Button
          variant="secondary"
          onClick={step === 0 ? onClose : () => setStep((s) => s - 1)}
        >
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        {step < 3 ? (
          <Button onClick={next}>Continue</Button>
        ) : (
          <Button onClick={() => onSave(form)}>Create Resident Account</Button>
        )}
      </div>
    </Modal>
  )
}
function FormSection({
  title,
  text,
  children,
}: {
  title: string
  text: string
  children: ReactNode
}) {
  return (
    <section className="form-section">
      <div className="section-title">
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      {children}
    </section>
  )
}
function Review({
  title,
  values,
}: {
  title: string
  values: [string, string][]
}) {
  return (
    <div className="review-block">
      <h4>{title}</h4>
      <dl>
        {values.map(([a, b]) => (
          <div key={a}>
            <dt>{a}</dt>
            <dd>{b}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
function ResidentDetail({
  resident,
  data,
  onClose,
}: {
  resident: Resident
  data: AppData
  onClose: () => void
}) {
  const [tab, setTab] = useState("Personal")
  const tabs = [
    "Personal",
    "Health Records",
    "Consultations",
    "Prescriptions",
    "Medication History",
    "Account",
  ]
  return (
    <Modal
      title={fullName(resident)}
      subtitle={`${resident.id} · ${resident.classification} · ${resident.sitio}`}
      onClose={onClose}
      wide
    >
      <div className="resident-header">
        <Avatar name={fullName(resident)} src={resident.photo} size="lg" />
        <div>
          <span className="chip success">{resident.status}</span>
          <p>One connected resident profile across MEDNEXUS.</p>
        </div>
      </div>
      <div className="tabs">
        {tabs.map((t) => (
          <button
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
            key={t}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="modal-body details-body">
        {tab === "Personal" && (
          <Review
            title="Personal & registration information"
            values={[
              ["Resident ID", resident.id],
              ["Full name", fullName(resident)],
              ["Date of birth", resident.birthDate],
              ["Age", `${ageOf(resident.birthDate)} years`],
              ["Sex", resident.sex],
              ["Civil status", resident.civilStatus || "Not recorded"],
              ["Contact", resident.mobile || "Not recorded"],
              ["Email", resident.email || "Not recorded"],
              [
                "Complete address",
                [
                  resident.house,
                  resident.street,
                  resident.sitio,
                  "San Pedro, Naujan, Oriental Mindoro",
                ]
                  .filter(Boolean)
                  .join(", "),
              ],
              ["Classification", resident.classification],
              [
                "Registration date",
                new Date(resident.createdAt).toLocaleDateString(),
              ],
            ]}
          />
        )}
        {tab === "Health Records" && (
          <ConnectedList
            items={data.healthRecords.filter(
              (x) => x.residentId === resident.id,
            )}
            empty="No health records available."
            render={(x: HealthRecord) => (
              <div>
                <b>
                  {x.id} · {x.date}
                </b>
                <p>
                  Blood pressure: {x.bloodPressure || "Not recorded"} ·
                  Allergies: {x.allergies || "Not assessed"}
                </p>
                <small>{x.notes}</small>
              </div>
            )}
          />
        )}
        {tab === "Consultations" && (
          <ConnectedList
            items={data.consultations.filter(
              (x) => x.residentId === resident.id && x.status === "Finalized",
            )}
            empty="No consultation records available."
            render={(x: Consultation) => (
              <div>
                <b>
                  {x.id} · {x.date}
                </b>
                <p>{x.chiefComplaint}</p>
                <strong className="diagnosis">Diagnosis: {x.diagnosis}</strong>
              </div>
            )}
          />
        )}
        {tab === "Prescriptions" && (
          <ConnectedList
            items={data.prescriptions.filter(
              (x) => x.residentId === resident.id && x.status !== "Draft",
            )}
            empty="No prescription records available."
            render={(x: Prescription) => (
              <div>
                <b>
                  {x.id} · {x.date}
                </b>
                <p>{x.medicines.map((m) => m.name).join(", ")}</p>
                <span className="chip success">{x.status}</span>
              </div>
            )}
          />
        )}
        {tab === "Medication History" && (
          <ConnectedList
            items={data.prescriptions
              .filter(
                (x) => x.residentId === resident.id && x.status !== "Draft",
              )
              .flatMap((x) =>
                x.medicines.map((m) => ({
                  ...m,
                  prescription: x.id,
                  date: x.date,
                })),
              )}
            empty="No medication history available."
            render={(x: any) => (
              <div>
                <b>
                  {x.name} {x.strength}
                </b>
                <p>
                  {x.dose} · {x.frequency} · {x.duration}
                </p>
                <small>
                  {x.prescription} · {x.date}
                </small>
              </div>
            )}
          />
        )}
        {tab === "Account" && (
          <Review
            title="Account details"
            values={[
              ["Linked Resident ID", resident.id],
              ["Username", resident.username],
              ["Account status", resident.status],
              ["Created", new Date(resident.createdAt).toLocaleString()],
              ["Password", "Never displayed"],
            ]}
          />
        )}
      </div>
    </Modal>
  )
}
function ConnectedList({
  items,
  empty,
  render,
}: {
  items: any[]
  empty: string
  render: (x: any) => ReactNode
}) {
  return items.length ? (
    <div className="connected-list">
      {items.map((x, i) => (
        <article key={x.id || i}>{render(x)}</article>
      ))}
    </div>
  ) : (
    <Empty
      icon="health"
      title={empty}
      text="Connected records created by authorized personnel will appear here."
    />
  )
}

function ClinicalFilters({
  data,
  search,
  setSearch,
  sitio,
  setSitio,
  type,
  setType,
}: any) {
  return (
    <div className="toolbar">
      <div className="search-box">
        <Icon name="search" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search records or resident"
        />
      </div>
      <select value={sitio} onChange={(e) => setSitio(e.target.value)}>
        <option value="">All Sitios</option>
        {SITIOS.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">All Types</option>
        {CLASSES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
    </div>
  )
}
function HealthRecords({ data, setData, notify }: any) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [sitio, setSitio] = useState("")
  const [type, setType] = useState("")
  const records = data.healthRecords.filter((h: HealthRecord) => {
    const r = data.residents.find((x: Resident) => x.id === h.residentId)
    return (
      r &&
      (!search ||
        `${h.id} ${fullName(r)}`
          .toLowerCase()
          .includes(search.toLowerCase())) &&
      (!sitio || r.sitio === sitio) &&
      (!type || r.classification === type)
    )
  })
  return (
    <div>
      <PageHead
        eyebrow="Clinical records"
        title="Health Records"
        description="Resident-specific measurements and community health information."
        actions={
          <>
            <Button variant="secondary" icon="edit">
              Drafts
            </Button>
            <Button icon="plus" onClick={() => setOpen(true)}>
              Add Health Record
            </Button>
          </>
        }
      />
      <ClinicalFilters
        data={data}
        search={search}
        setSearch={setSearch}
        sitio={sitio}
        setSitio={setSitio}
        type={type}
        setType={setType}
      />
      <RecordCards records={records} data={data} kind="health" />
      {open && (
        <HealthForm
          data={data}
          onClose={() => setOpen(false)}
          onSave={(h: HealthRecord) => {
            setData((d: AppData) => ({
              ...d,
              healthRecords: [...d.healthRecords, h],
            }))
            setOpen(false)
            notify("Health record saved successfully.")
          }}
        />
      )}
    </div>
  )
}
function HealthForm({ data, onClose, onSave }: any) {
  const [f, setF] = useState<HealthRecord>({
    id: nextId("HR", data.healthRecords.length),
    residentId: "",
    date: today(),
    bloodPressure: "",
    pulse: "",
    respiratory: "",
    temperature: "",
    oxygen: "",
    height: "",
    weight: "",
    history: "",
    conditions: "",
    allergies: "",
    notes: "",
  })
  const [error, setError] = useState("")
  const u = (k: keyof HealthRecord, v: string) =>
    setF((x) => ({ ...x, [k]: v }))
  const bmi = useMemo(() => {
    const h = Number(f.height) / 100,
      w = Number(f.weight)
    return h > 0 && w > 0 ? (w / (h * h)).toFixed(2) : ""
  }, [f.height, f.weight])
  return (
    <Modal
      title="Add Health Record"
      subtitle="Create a resident-connected clinical record"
      onClose={onClose}
      wide
    >
      <div className="modal-body form-body">
        {error && <div className="alert error">{error}</div>}
        <FormSection
          title="Resident & record"
          text="Select an existing registered resident."
        >
          <div className="form-grid">
            <Field label="Resident" required>
              <select
                value={f.residentId}
                onChange={(e) => u("residentId", e.target.value)}
              >
                <option value="">Select resident</option>
                {data.residents.map((r: Resident) => (
                  <option key={r.id} value={r.id}>
                    {r.id} · {fullName(r)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Record ID">
              <input value={f.id} readOnly />
            </Field>
            <Field label="Record date">
              <input
                type="date"
                value={f.date}
                onChange={(e) => u("date", e.target.value)}
              />
            </Field>
          </div>
        </FormSection>
        <FormSection
          title="Vital signs & measurements"
          text="BMI is calculated automatically from valid height and weight."
        >
          <div className="form-grid">
            <Field label="Blood pressure (mmHg)">
              <input
                value={f.bloodPressure}
                onChange={(e) => u("bloodPressure", e.target.value)}
                placeholder="120/80"
              />
            </Field>
            <Field label="Heart rate / pulse (bpm)">
              <input
                type="number"
                value={f.pulse}
                onChange={(e) => u("pulse", e.target.value)}
              />
            </Field>
            <Field label="Respiratory rate">
              <input
                type="number"
                value={f.respiratory}
                onChange={(e) => u("respiratory", e.target.value)}
              />
            </Field>
            <Field label="Temperature (°C)">
              <input
                type="number"
                step=".1"
                value={f.temperature}
                onChange={(e) => u("temperature", e.target.value)}
              />
            </Field>
            <Field label="Oxygen saturation (%)">
              <input
                type="number"
                value={f.oxygen}
                onChange={(e) => u("oxygen", e.target.value)}
              />
            </Field>
            <Field label="Height (cm)">
              <input
                type="number"
                value={f.height}
                onChange={(e) => u("height", e.target.value)}
              />
            </Field>
            <Field label="Weight (kg)">
              <input
                type="number"
                value={f.weight}
                onChange={(e) => u("weight", e.target.value)}
              />
            </Field>
            <Field label="BMI (automatic)">
              <input value={bmi || "Enter valid height and weight"} readOnly />
            </Field>
          </div>
        </FormSection>
        <FormSection
          title="Medical information"
          text="Structured health history and safety information."
        >
          <div className="form-grid">
            <Field label="Medical history">
              <textarea
                value={f.history}
                onChange={(e) => u("history", e.target.value)}
              />
            </Field>
            <Field label="Current conditions">
              <textarea
                value={f.conditions}
                onChange={(e) => u("conditions", e.target.value)}
              />
            </Field>
            <Field label="Allergies">
              <textarea
                value={f.allergies}
                onChange={(e) => u("allergies", e.target.value)}
                placeholder="Known, unknown, or not assessed"
              />
            </Field>
            <Field label="Other health notes">
              <textarea
                value={f.notes}
                onChange={(e) => u("notes", e.target.value)}
              />
            </Field>
          </div>
        </FormSection>
      </div>
      <div className="modal-foot">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={() => notify}>
          Save as Draft
        </Button>
        <Button
          onClick={() => {
            if (!f.residentId) {
              setError("Select a registered resident before saving.")
              return
            }
            onSave(f)
          }}
        >
          Save Health Record
        </Button>
      </div>
    </Modal>
  )
}
function RecordCards({ records, data, kind }: any) {
  return (
    <div className="record-grid">
      {records.length ? (
        records.map((x: any) => {
          const r = data.residents.find((a: Resident) => a.id === x.residentId)
          return (
            <article className="record-card" key={x.id}>
              <div className="record-top">
                <span className="record-icon">
                  <Icon
                    name={
                      kind === "consult"
                        ? "consult"
                        : kind === "rx"
                          ? "rx"
                          : "health"
                    }
                  />
                </span>
                <span>
                  <b>{x.id}</b>
                  <small>{x.date}</small>
                </span>
                <span className="chip success">{x.status || "Active"}</span>
              </div>
              <div className="record-person">
                <Avatar name={fullName(r)} src={r?.photo} size="sm" />
                <span>
                  <b>{fullName(r)}</b>
                  <small>
                    {r?.id} · {r?.sitio} · {r?.classification}
                  </small>
                </span>
              </div>
              {kind === "consult" && (
                <>
                  <p>{x.chiefComplaint}</p>
                  <strong className="diagnosis">
                    Diagnosis: {x.diagnosis}
                  </strong>
                </>
              )}
              {kind === "health" && (
                <p>{x.notes || "Clinical measurements recorded."}</p>
              )}
              {kind === "rx" && (
                <p>
                  {x.medicines.length} medicine
                  {x.medicines.length !== 1 ? "s" : ""} · {x.diagnosis}
                </p>
              )}
              <div className="record-actions">
                <Button variant="ghost" icon="eye">
                  View
                </Button>
                <Button variant="ghost" icon="edit">
                  Edit
                </Button>
                {kind === "rx" && (
                  <Button
                    variant="ghost"
                    icon="print"
                    onClick={() => window.print()}
                  >
                    Print
                  </Button>
                )}
              </div>
            </article>
          )
        })
      ) : (
        <div className="card empty-records">
          <Empty
            icon={
              kind === "rx" ? "rx" : kind === "consult" ? "consult" : "health"
            }
            title={`No ${
              kind === "rx"
                ? "prescriptions"
                : kind === "consult"
                  ? "consultations"
                  : "health records"
            } yet`}
            text="New connected records will appear here after they are saved."
          />
        </div>
      )}
    </div>
  )
}

function Consultations({ data, setData, notify }: any) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Consultation>()
  const [drafts, setDrafts] = useState(false)
  const [search, setSearch] = useState("")
  const [sitio, setSitio] = useState("")
  const [type, setType] = useState("")
  const list = data.consultations
    .filter((c: Consultation) => c.status === "Finalized")
    .filter((c: Consultation) => {
      const r = data.residents.find((x: Resident) => x.id === c.residentId)
      return (
        r &&
        (!search ||
          `${c.id} ${fullName(r)} ${c.diagnosis}`
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (!sitio || r.sitio === sitio) &&
        (!type || r.classification === type)
      )
    })
  const save = (c: Consultation, final: boolean) => {
    setData((d: AppData) => ({
      ...d,
      consultations: [
        ...d.consultations.filter((x) => x.id !== c.id),
        { ...c, status: final ? "Finalized" : "Draft", updatedAt: now() },
      ],
    }))
    setOpen(false)
    setEditing(undefined)
    notify(
      final
        ? "Consultation saved and posted successfully."
        : "Consultation draft saved.",
    )
  }
  return (
    <div>
      <PageHead
        eyebrow="Clinical encounters"
        title="Consultations"
        description="Document structured resident encounters, follow-ups and referrals."
        actions={
          <>
            <Button
              variant="secondary"
              icon="edit"
              onClick={() => setDrafts(true)}
            >
              Drafts (
              {
                data.consultations.filter(
                  (c: Consultation) => c.status === "Draft",
                ).length
              }
              )
            </Button>
            <Button
              icon="plus"
              onClick={() => {
                setEditing(undefined)
                setOpen(true)
              }}
            >
              Add New Consultation
            </Button>
          </>
        }
      />
      <ClinicalFilters
        data={data}
        search={search}
        setSearch={setSearch}
        sitio={sitio}
        setSitio={setSitio}
        type={type}
        setType={setType}
      />
      <RecordCards records={list} data={data} kind="consult" />
      {open && (
        <ConsultForm
          data={data}
          existing={editing}
          onClose={() => setOpen(false)}
          onSave={save}
        />
      )}
      {drafts && (
        <Modal
          title="Consultation Drafts"
          subtitle="Persistent unfinished consultations"
          onClose={() => setDrafts(false)}
        >
          <div className="modal-body">
            {data.consultations.filter(
              (c: Consultation) => c.status === "Draft",
            ).length ? (
              <div className="draft-list">
                {data.consultations
                  .filter((c: Consultation) => c.status === "Draft")
                  .map((c: Consultation) => (
                    <article key={c.id}>
                      <div>
                        <b>{c.id}</b>
                        <p>
                          {fullName(
                            data.residents.find(
                              (r: Resident) => r.id === c.residentId,
                            ),
                          )}
                        </p>
                        <small>
                          Last saved {new Date(c.updatedAt).toLocaleString()}
                        </small>
                      </div>
                      <Button
                        onClick={() => {
                          setEditing(c)
                          setDrafts(false)
                          setOpen(true)
                        }}
                      >
                        Continue Editing
                      </Button>
                      <Button
                        variant="danger"
                        icon="trash"
                        onClick={() => {
                          if (confirm("Delete this consultation draft?"))
                            setData((d: AppData) => ({
                              ...d,
                              consultations: d.consultations.filter(
                                (x) => x.id !== c.id,
                              ),
                            }))
                        }}
                      >
                        Delete
                      </Button>
                    </article>
                  ))}
              </div>
            ) : (
              <Empty
                icon="edit"
                title="No consultation drafts"
                text="Saved unfinished consultations will appear here."
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
function ConsultForm({ data, existing, onClose, onSave }: any) {
  const blank: Consultation = {
    id: nextId("CON", data.consultations.length),
    residentId: "",
    date: today(),
    consultationType: "Walk-in",
    encounterType: "New",
    assignedBhw: data.bhw.name,
    personnel: "",
    location: "Barangay San Pedro Health Center",
    chiefComplaint: "",
    onset: "",
    severity: "",
    symptoms: "",
    history: "",
    findings: "",
    assessment: "",
    diagnosis: "",
    treatment: "",
    homeCare: "",
    advice: "",
    warningSigns: "",
    followUpDate: "",
    followUpType: "Not required",
    referral: "",
    referralStatus: "Not referred",
    status: "Draft",
    updatedAt: now(),
  }
  const [f, setF] = useState<Consultation>(existing || blank)
  const [error, setError] = useState("")
  const u = (k: keyof Consultation, v: string) =>
    setF((x) => ({ ...x, [k]: v }))
  const finalize = () => {
    if (!f.residentId || !f.chiefComplaint.trim() || !f.diagnosis.trim()) {
      setError(
        "Resident, Chief Complaint, and Diagnosis are required before posting.",
      )
      return
    }
    onSave(f, true)
  }
  return (
    <Modal
      title={existing ? "Continue Consultation Draft" : "New Consultation"}
      subtitle={`${f.id} · Structured clinical encounter`}
      onClose={onClose}
      wide
    >
      <div className="modal-body form-body">
        {error && <div className="alert error">{error}</div>}
        <FormSection
          title="1. Resident"
          text="Select an existing connected resident."
        >
          <Field label="Search / Select Resident" required>
            <select
              value={f.residentId}
              onChange={(e) => u("residentId", e.target.value)}
            >
              <option value="">Select registered resident</option>
              {data.residents.map((r: Resident) => (
                <option key={r.id} value={r.id}>
                  {r.id} · {fullName(r)} · {r.sitio}
                </option>
              ))}
            </select>
          </Field>
        </FormSection>
        <FormSection
          title="2. Consultation Details"
          text="Record the encounter identity, time, and context."
        >
          <div className="form-grid">
            <Field label="Consultation ID">
              <input value={f.id} readOnly />
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={f.date}
                onChange={(e) => u("date", e.target.value)}
              />
            </Field>
            <Field label="Consultation Type">
              <select
                value={f.consultationType}
                onChange={(e) => u("consultationType", e.target.value)}
              >
                <option>Walk-in</option>
                <option>Scheduled</option>
                <option>Home Visit</option>
              </select>
            </Field>
            <Field label="Encounter Type">
              <select
                value={f.encounterType}
                onChange={(e) => u("encounterType", e.target.value)}
              >
                <option>New</option>
                <option>Follow-up</option>
              </select>
            </Field>
            <Field label="Assigned BHW">
              <input
                value={f.assignedBhw}
                onChange={(e) => u("assignedBhw", e.target.value)}
              />
            </Field>
            <Field label="Health Personnel">
              <input
                value={f.personnel}
                onChange={(e) => u("personnel", e.target.value)}
              />
            </Field>
            <Field label="Location">
              <input
                value={f.location}
                onChange={(e) => u("location", e.target.value)}
              />
            </Field>
          </div>
        </FormSection>
        <FormSection
          title="3. Chief Complaint & History"
          text="Describe the patient's main concern or reason for consultation."
        >
          <div className="form-grid">
            <Field label="Chief Complaint" required>
              <textarea
                value={f.chiefComplaint}
                onChange={(e) => u("chiefComplaint", e.target.value)}
              />
            </Field>
            <Field label="Onset / Duration">
              <textarea
                value={f.onset}
                onChange={(e) => u("onset", e.target.value)}
              />
            </Field>
            <Field label="Severity / Frequency">
              <textarea
                value={f.severity}
                onChange={(e) => u("severity", e.target.value)}
              />
            </Field>
            <Field label="Associated Symptoms">
              <textarea
                value={f.symptoms}
                onChange={(e) => u("symptoms", e.target.value)}
              />
            </Field>
            <Field label="Patient Report & Relevant History">
              <textarea
                value={f.history}
                onChange={(e) => u("history", e.target.value)}
              />
            </Field>
          </div>
        </FormSection>
        <FormSection
          title="4. Clinical Assessment"
          text="Document findings without automatically generating a diagnosis."
        >
          <div className="form-grid">
            <Field label="General Appearance / Physical Findings">
              <textarea
                value={f.findings}
                onChange={(e) => u("findings", e.target.value)}
              />
            </Field>
            <Field label="Assessment & Possible Condition">
              <textarea
                value={f.assessment}
                onChange={(e) => u("assessment", e.target.value)}
              />
            </Field>
            <Field label="Diagnosis" required>
              <textarea
                className="diagnosis-input"
                value={f.diagnosis}
                onChange={(e) => u("diagnosis", e.target.value)}
              />
            </Field>
          </div>
        </FormSection>
        <FormSection
          title="5. Treatment & Care Advice"
          text="Document care provided and instructions given."
        >
          <div className="form-grid">
            <Field label="Treatment Provided">
              <textarea
                value={f.treatment}
                onChange={(e) => u("treatment", e.target.value)}
              />
            </Field>
            <Field label="Health Advice / Home Care">
              <textarea
                value={f.homeCare}
                onChange={(e) => u("homeCare", e.target.value)}
              />
            </Field>
            <Field label="Dietary & Activity Advice">
              <textarea
                value={f.advice}
                onChange={(e) => u("advice", e.target.value)}
              />
            </Field>
            <Field label="Warning Signs">
              <textarea
                value={f.warningSigns}
                onChange={(e) => u("warningSigns", e.target.value)}
              />
            </Field>
          </div>
        </FormSection>
        <FormSection
          title="6. Follow-up & Referral"
          text="Connect follow-up dates to operational visibility."
        >
          <div className="form-grid">
            <Field label="Follow-up Date">
              <input
                type="date"
                value={f.followUpDate}
                onChange={(e) => u("followUpDate", e.target.value)}
              />
            </Field>
            <Field label="Follow-up Type">
              <select
                value={f.followUpType}
                onChange={(e) => u("followUpType", e.target.value)}
              >
                <option>Not required</option>
                <option>Health center</option>
                <option>Home visit</option>
                <option>Phone check</option>
              </select>
            </Field>
            <Field label="Referral Facility / Reason">
              <textarea
                value={f.referral}
                onChange={(e) => u("referral", e.target.value)}
              />
            </Field>
            <Field label="Referral Status">
              <select
                value={f.referralStatus}
                onChange={(e) => u("referralStatus", e.target.value)}
              >
                <option>Not referred</option>
                <option>Pending</option>
                <option>Referred</option>
                <option>Completed</option>
              </select>
            </Field>
          </div>
        </FormSection>
      </div>
      <div className="modal-foot">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="secondary"
          icon="edit"
          onClick={() => onSave(f, false)}
        >
          {existing ? "Update Draft" : "Save Draft"}
        </Button>
        <Button onClick={finalize}>Save Consultation</Button>
      </div>
    </Modal>
  )
}

function Prescriptions({ data, setData, notify }: any) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Prescription>()
  const [drafts, setDrafts] = useState(false)
  const [print, setPrint] = useState<Prescription>()
  const [search, setSearch] = useState("")
  const [sitio, setSitio] = useState("")
  const [type, setType] = useState("")
  const list = data.prescriptions
    .filter((p: Prescription) => p.status !== "Draft")
    .filter((p: Prescription) => {
      const r = data.residents.find((x: Resident) => x.id === p.residentId)
      return (
        r &&
        (!search ||
          `${p.id} ${fullName(r)} ${p.diagnosis}`
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (!sitio || r.sitio === sitio) &&
        (!type || r.classification === type)
      )
    })
  const save = (p: Prescription, final: boolean) => {
    setData((d: AppData) => ({
      ...d,
      prescriptions: [
        ...d.prescriptions.filter((x) => x.id !== p.id),
        { ...p, status: final ? "Active" : "Draft", updatedAt: now() },
      ],
    }))
    setOpen(false)
    setEditing(undefined)
    notify(
      final
        ? "Prescription created successfully."
        : "Prescription draft saved.",
    )
  }
  return (
    <div>
      <PageHead
        eyebrow="Medication orders"
        title="Prescriptions"
        description="Create, review and print resident-connected medication orders."
        actions={
          <>
            <Button
              variant="secondary"
              icon="edit"
              onClick={() => setDrafts(true)}
            >
              Drafts (
              {
                data.prescriptions.filter(
                  (p: Prescription) => p.status === "Draft",
                ).length
              }
              )
            </Button>
            <Button
              icon="plus"
              onClick={() => {
                setEditing(undefined)
                setOpen(true)
              }}
            >
              Create Prescription
            </Button>
          </>
        }
      />
      <ClinicalFilters
        data={data}
        search={search}
        setSearch={setSearch}
        sitio={sitio}
        setSitio={setSitio}
        type={type}
        setType={setType}
      />
      <div className="record-grid">
        {list.length ? (
          list.map((p: Prescription) => {
            const r = data.residents.find(
              (x: Resident) => x.id === p.residentId,
            )
            return (
              <article className="record-card" key={p.id}>
                <div className="record-top">
                  <span className="record-icon">
                    <Icon name="rx" />
                  </span>
                  <span>
                    <b>{p.id}</b>
                    <small>{p.date}</small>
                  </span>
                  <span className="chip success">{p.status}</span>
                </div>
                <div className="record-person">
                  <Avatar name={fullName(r)} src={r?.photo} size="sm" />
                  <span>
                    <b>{fullName(r)}</b>
                    <small>
                      {r?.id} · {r?.sitio} · {r?.classification}
                    </small>
                  </span>
                </div>
                <p>
                  {p.medicines.length} medicine
                  {p.medicines.length !== 1 ? "s" : ""} · {p.diagnosis}
                </p>
                <div className="record-actions">
                  <Button
                    variant="ghost"
                    icon="eye"
                    onClick={() => setPrint(p)}
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    icon="edit"
                    onClick={() => {
                      setEditing(p)
                      setOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    icon="print"
                    onClick={() => {
                      setPrint(p)
                      setTimeout(() => window.print(), 100)
                    }}
                  >
                    Print
                  </Button>
                </div>
              </article>
            )
          })
        ) : (
          <div className="card empty-records">
            <Empty
              icon="rx"
              title="No prescriptions yet"
              text="Finalized prescriptions will appear here and in the connected resident portal."
            />
          </div>
        )}
      </div>
      {open && (
        <PrescriptionForm
          data={data}
          existing={editing}
          onClose={() => setOpen(false)}
          onSave={save}
        />
      )}
      {drafts && (
        <Modal
          title="Prescription Drafts"
          subtitle="Unpublished medication orders"
          onClose={() => setDrafts(false)}
        >
          <div className="modal-body">
            {data.prescriptions.filter(
              (p: Prescription) => p.status === "Draft",
            ).length ? (
              <div className="draft-list">
                {data.prescriptions
                  .filter((p: Prescription) => p.status === "Draft")
                  .map((p: Prescription) => (
                    <article key={p.id}>
                      <div>
                        <b>{p.id}</b>
                        <p>
                          {fullName(
                            data.residents.find(
                              (r: Resident) => r.id === p.residentId,
                            ),
                          )}
                        </p>
                        <small>
                          {p.medicines.length} medicines ·{" "}
                          {new Date(p.updatedAt).toLocaleString()}
                        </small>
                      </div>
                      <Button
                        onClick={() => {
                          setEditing(p)
                          setDrafts(false)
                          setOpen(true)
                        }}
                      >
                        Continue Editing
                      </Button>
                      <Button
                        variant="danger"
                        icon="trash"
                        onClick={() =>
                          confirm("Delete this prescription draft?") &&
                          setData((d: AppData) => ({
                            ...d,
                            prescriptions: d.prescriptions.filter(
                              (x) => x.id !== p.id,
                            ),
                          }))
                        }
                      >
                        Delete
                      </Button>
                    </article>
                  ))}
              </div>
            ) : (
              <Empty
                icon="edit"
                title="No prescription drafts"
                text="Saved drafts remain private until finalized."
              />
            )}
          </div>
        </Modal>
      )}
      {print && (
        <PrescriptionDocument
          prescription={print}
          resident={data.residents.find((r) => r.id === print.residentId)!}
          center={data.center}
          onClose={() => setPrint(undefined)}
        />
      )}
    </div>
  )
}
function PrescriptionForm({ data, existing, onClose, onSave }: any) {
  const blank: Prescription = {
    id: nextId("RX", data.prescriptions.length),
    residentId: "",
    date: today(),
    diagnosis: "",
    prescriber: data.bhw.name,
    designation: "Barangay Health Worker",
    followUpDate: "",
    notes: "",
    medicines: [medicineLine()],
    status: "Draft",
    updatedAt: now(),
  }
  const [f, setF] = useState<Prescription>(existing || blank)
  const [error, setError] = useState("")
  const u = (k: keyof Prescription, v: any) => setF((x) => ({ ...x, [k]: v }))
  const med = (id: string, k: keyof MedicineLine, v: string) =>
    u(
      "medicines",
      f.medicines.map((m) => (m.id === id ? { ...m, [k]: v } : m)),
    )
  const finalize = () => {
    if (
      !f.residentId ||
      !f.diagnosis ||
      !f.medicines.length ||
      f.medicines.some((m) => !m.name || !m.dose || !m.frequency)
    ) {
      setError(
        "Select a resident, enter a diagnosis, and complete medicine name, dose and frequency.",
      )
      return
    }
    onSave(f, true)
  }
  return (
    <Modal
      title={existing ? "Edit Prescription" : "Create Prescription"}
      subtitle={`${f.id} · Prescription remains separate from dispensing`}
      onClose={onClose}
      wide
    >
      <div className="modal-body form-body">
        {error && <div className="alert error">{error}</div>}
        <FormSection
          title="Prescription header"
          text="Resident information is drawn from the connected registration record."
        >
          <div className="form-grid">
            <Field label="Resident" required>
              <select
                value={f.residentId}
                onChange={(e) => u("residentId", e.target.value)}
              >
                <option value="">Select resident</option>
                {data.residents.map((r: Resident) => (
                  <option key={r.id} value={r.id}>
                    {r.id} · {fullName(r)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Prescription ID">
              <input value={f.id} readOnly />
            </Field>
            <Field label="Prescription date">
              <input
                type="date"
                value={f.date}
                onChange={(e) => u("date", e.target.value)}
              />
            </Field>
            <Field label="Diagnosis / indication" required>
              <input
                value={f.diagnosis}
                onChange={(e) => u("diagnosis", e.target.value)}
              />
            </Field>
            <Field label="Prescriber">
              <input
                value={f.prescriber}
                onChange={(e) => u("prescriber", e.target.value)}
              />
            </Field>
            <Field label="Designation">
              <input
                value={f.designation}
                onChange={(e) => u("designation", e.target.value)}
              />
            </Field>
            <Field label="Follow-up checkup date">
              <input
                type="date"
                value={f.followUpDate}
                onChange={(e) => u("followUpDate", e.target.value)}
              />
            </Field>
            <Field label="General instructions">
              <textarea
                value={f.notes}
                onChange={(e) => u("notes", e.target.value)}
              />
            </Field>
          </div>
        </FormSection>
        <FormSection
          title="Prescribed medicines"
          text="Add multiple medicines without overwriting previous entries."
        >
          {f.medicines.map((m, i) => (
            <div className="medicine-card" key={m.id}>
              <div className="medicine-head">
                <h4>Medicine #{i + 1}</h4>
                {f.medicines.length > 1 && (
                  <Button
                    variant="danger"
                    icon="trash"
                    onClick={() =>
                      confirm(`Remove Medicine #${i + 1}?`) &&
                      u(
                        "medicines",
                        f.medicines.filter((x) => x.id !== m.id),
                      )
                    }
                  >
                    Remove
                  </Button>
                )}
              </div>
              <div className="form-grid">
                <Field label="Medicine" required>
                  <input
                    list="medicine-catalog"
                    value={m.name}
                    onChange={(e) => med(m.id, "name", e.target.value)}
                  />
                </Field>
                <Field label="Strength">
                  <input
                    value={m.strength}
                    onChange={(e) => med(m.id, "strength", e.target.value)}
                  />
                </Field>
                <Field label="Dose" required>
                  <input
                    value={m.dose}
                    onChange={(e) => med(m.id, "dose", e.target.value)}
                  />
                </Field>
                <Field label="Frequency" required>
                  <input
                    value={m.frequency}
                    onChange={(e) => med(m.id, "frequency", e.target.value)}
                  />
                </Field>
                <Field label="Route">
                  <select
                    value={m.route}
                    onChange={(e) => med(m.id, "route", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option>Oral</option>
                    <option>Topical</option>
                    <option>Inhalation</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="Duration">
                  <input
                    value={m.duration}
                    onChange={(e) => med(m.id, "duration", e.target.value)}
                  />
                </Field>
                <Field label="Quantity">
                  <input
                    type="number"
                    min="1"
                    value={m.quantity}
                    onChange={(e) => med(m.id, "quantity", e.target.value)}
                  />
                </Field>
                <Field label="Instructions">
                  <textarea
                    value={m.instructions}
                    onChange={(e) => med(m.id, "instructions", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          ))}
          <datalist id="medicine-catalog">
            {data.medicines.map((m: Medicine) => (
              <option key={m.id} value={m.name}>
                {m.generic} · {m.strength} ·{" "}
                {m.stock > 0 ? `${m.stock} available` : "Out of Stock"}
              </option>
            ))}
          </datalist>
          <Button
            variant="secondary"
            icon="plus"
            onClick={() => u("medicines", [...f.medicines, medicineLine()])}
          >
            Add Medicine
          </Button>
        </FormSection>
      </div>
      <div className="modal-foot">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="secondary"
          icon="edit"
          onClick={() => onSave(f, false)}
        >
          Save as Draft
        </Button>
        <Button onClick={finalize}>Save Prescription</Button>
      </div>
    </Modal>
  )
}
function PrescriptionDocument({
  prescription,
  resident,
  center,
  onClose,
}: any) {
  return (
    <div className="print-overlay">
      <div className="print-controls">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button icon="print" onClick={() => window.print()}>
          Print Prescription
        </Button>
      </div>
      <article className="prescription-paper">
        <header>
          <div className="rx-logo">M+</div>
          <div>
            <span>MEDNEXUS</span>
            <h1>Barangay San Pedro Health Center</h1>
            <p>Barangay San Pedro, Naujan, Oriental Mindoro</p>
          </div>
          <div className="doc-type">
            <b>PRESCRIPTION</b>
            <span>{prescription.id}</span>
          </div>
        </header>
        <section className="patient-band">
          <dl>
            <div>
              <dt>Patient</dt>
              <dd>{fullName(resident)}</dd>
            </div>
            <div>
              <dt>Resident ID</dt>
              <dd>{resident.id}</dd>
            </div>
            <div>
              <dt>Age / Sex</dt>
              <dd>
                {ageOf(resident.birthDate)} / {resident.sex}
              </dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{prescription.date}</dd>
            </div>
            <div className="wide">
              <dt>Address</dt>
              <dd>
                {[
                  resident.house,
                  resident.street,
                  resident.sitio,
                  "San Pedro, Naujan, Oriental Mindoro",
                ]
                  .filter(Boolean)
                  .join(", ")}
              </dd>
            </div>
            <div className="wide">
              <dt>Diagnosis / Clinical impression</dt>
              <dd>{prescription.diagnosis}</dd>
            </div>
          </dl>
        </section>
        <div className="rx-mark">Rx</div>
        <section className="medication-print">
          {prescription.medicines.map((m: MedicineLine, i: number) => (
            <article key={m.id}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2>
                  {m.name} <small>{m.strength}</small>
                </h2>
                <p>
                  <b>Dose:</b> {m.dose} · <b>Frequency:</b> {m.frequency}{" "}
                  {m.route && (
                    <>
                      · <b>Route:</b> {m.route}
                    </>
                  )}{" "}
                  {m.duration && (
                    <>
                      · <b>Duration:</b> {m.duration}
                    </>
                  )}
                </p>
                <p className="sig">{m.instructions || "Use as directed."}</p>
                {m.quantity && <em>Quantity: {m.quantity}</em>}
              </div>
            </article>
          ))}
        </section>
        {prescription.notes && (
          <section className="print-notes">
            <b>General instructions</b>
            <p>{prescription.notes}</p>
          </section>
        )}
        <div className="print-bottom">
          {prescription.followUpDate && (
            <div className="followup">
              <b>Follow-up Checkup Date</b>
              <span>{prescription.followUpDate}</span>
            </div>
          )}
          <div className="signature">
            <span />
            <b>{prescription.prescriber}</b>
            <small>{prescription.designation}</small>
          </div>
        </div>
        <footer>
          <span>
            {center.contact} · {center.hours}
          </span>
          <b>Created by De Castro et al.</b>
        </footer>
      </article>
    </div>
  )
}

function Inventory({ data, setData, notify }: any) {
  const [modal, setModal] =
    useState<"medicine" | "receive" | "dispense" | null>(null)
  const [filter, setFilter] = useState("")
  const [search, setSearch] = useState("")
  const status = (m: Medicine) =>
    m.stock === 0 ? "Out of Stock" : m.stock <= 50 ? "Low Stock" : "Available"
  const list = data.medicines.filter(
    (m: Medicine) =>
      (!filter || status(m) === filter) &&
      (!search ||
        `${m.name} ${m.generic} ${m.brand} ${m.batch}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  )
  const counts = [
    ["Catalogued", data.medicines.length, ""],
    [
      "Available",
      data.medicines.filter((m: Medicine) => m.stock > 50).length,
      "Available",
    ],
    [
      "Low Stock",
      data.medicines.filter((m: Medicine) => m.stock > 0 && m.stock <= 50)
        .length,
      "Low Stock",
    ],
    [
      "Out of Stock",
      data.medicines.filter((m: Medicine) => m.stock === 0).length,
      "Out of Stock",
    ],
  ]
  return (
    <div>
      <PageHead
        eyebrow="Stock & dispensing"
        title="Medicine Inventory"
        description="Manage catalogues, batches, expiration and actual medicine distribution."
        actions={
          <>
            <Button variant="secondary" onClick={() => setModal("dispense")}>
              Record Dispensing
            </Button>
            <Button variant="secondary" onClick={() => setModal("receive")}>
              Receive Stock
            </Button>
            <Button icon="plus" onClick={() => setModal("medicine")}>
              Add Medicine
            </Button>
          </>
        }
      />
      <div className="inventory-metrics">
        {counts.map(([l, c, f]) => (
          <button
            className={filter === f ? "active" : ""}
            key={String(l)}
            onClick={() => setFilter(String(f))}
          >
            <span>{l}</span>
            <strong>{c}</strong>
            <small>Live system data</small>
          </button>
        ))}
      </div>
      <div className="toolbar">
        <div className="search-box">
          <Icon name="search" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicine, generic, brand or batch"
          />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All stock statuses</option>
          <option>Available</option>
          <option>Low Stock</option>
          <option>Out of Stock</option>
        </select>
      </div>
      <div className="card table-card">
        {list.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Strength / form</th>
                  <th>Batch</th>
                  <th>Usable stock</th>
                  <th>Expiration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((m: Medicine) => (
                  <tr key={m.id}>
                    <td>
                      <b>{m.name}</b>
                      <small className="table-sub">
                        {m.generic} {m.brand}
                      </small>
                    </td>
                    <td>
                      {m.strength} · {m.form}
                    </td>
                    <td>{m.batch || "—"}</td>
                    <td>
                      <strong>
                        {m.stock} {m.unit}
                      </strong>
                    </td>
                    <td>{m.expiration || "No batch"}</td>
                    <td>
                      <span
                        className={`chip ${
                          status(m) === "Available"
                            ? "success"
                            : status(m) === "Low Stock"
                              ? "warning"
                              : "danger"
                        }`}
                      >
                        {status(m)}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <Button variant="ghost" icon="eye">
                          View
                        </Button>
                        <Button variant="ghost" icon="edit">
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            icon="box"
            title="No medicines in inventory"
            text="Add the first medicine to begin tracking stock, batches and expiration."
            action={
              <Button icon="plus" onClick={() => setModal("medicine")}>
                Add Medicine
              </Button>
            }
          />
        )}
      </div>
      {modal && (
        <InventoryForm
          type={modal}
          data={data}
          onClose={() => setModal(null)}
          onSave={(payload: any) => {
            if (modal === "medicine")
              setData((d: AppData) => ({
                ...d,
                medicines: [...d.medicines, payload],
              }))
            else if (modal === "receive")
              setData((d: AppData) => ({
                ...d,
                medicines: d.medicines.map((m) =>
                  m.id === payload.id
                    ? {
                        ...m,
                        stock: m.stock + payload.quantity,
                        batch: payload.batch,
                        expiration: payload.expiration,
                      }
                    : m,
                ),
              }))
            else
              setData((d: AppData) => ({
                ...d,
                medicines: d.medicines.map((m) =>
                  m.id === payload.id
                    ? { ...m, stock: m.stock - payload.quantity }
                    : m,
                ),
              }))
            setModal(null)
            notify(
              modal === "medicine"
                ? "Medicine added successfully."
                : modal === "receive"
                  ? "Stock received successfully."
                  : "Dispensing recorded successfully.",
            )
          }}
        />
      )}
    </div>
  )
}
function InventoryForm({ type, data, onClose, onSave }: any) {
  const [f, setF] = useState<any>({
    name: "",
    generic: "",
    brand: "",
    strength: "",
    form: "Tablet",
    unit: "units",
    minimum: 50,
    stock: 0,
    expiration: "",
    batch: "",
    notes: "",
    id: "",
    quantity: 0,
    residentId: "",
  })
  const [error, setError] = useState("")
  const selected = data.medicines.find((m: Medicine) => m.id === f.id)
  const submit = () => {
    if (type === "medicine") {
      if (!f.name || !f.strength || !f.form || !f.unit) {
        setError("Complete all required medicine fields.")
        return
      }
      onSave({ ...f, id: nextId("MED", data.medicines.length), stock: 0 })
    } else {
      if (!f.id || Number(f.quantity) <= 0) {
        setError("Select a medicine and enter a positive quantity.")
        return
      }
      if (type === "receive" && (!f.batch || !f.expiration)) {
        setError("Batch number and expiration date are required.")
        return
      }
      if (
        type === "dispense" &&
        (!f.residentId || Number(f.quantity) > selected.stock)
      ) {
        setError(
          !f.residentId
            ? "Select a registered resident."
            : "Quantity cannot exceed available stock.",
        )
        return
      }
      onSave({ ...f, quantity: Number(f.quantity) })
    }
  }
  return (
    <Modal
      title={
        type === "medicine"
          ? "Add Medicine"
          : type === "receive"
            ? "Receive Stock"
            : "Record Dispensing"
      }
      subtitle={
        type === "medicine"
          ? "Register a catalogue item; stock begins at zero."
          : type === "receive"
            ? "Add a traceable medicine batch."
            : "Record actual distribution and deduct usable stock."
      }
      onClose={onClose}
    >
      <div className="modal-body form-body">
        {error && <div className="alert error">{error}</div>}
        <div className="form-grid single">
          {type === "medicine" ? (
            <>
              <Field label="Medicine name" required>
                <input
                  value={f.name}
                  onChange={(e) => setF({ ...f, name: e.target.value })}
                />
              </Field>
              <Field label="Generic name">
                <input
                  value={f.generic}
                  onChange={(e) => setF({ ...f, generic: e.target.value })}
                />
              </Field>
              <Field label="Brand name">
                <input
                  value={f.brand}
                  onChange={(e) => setF({ ...f, brand: e.target.value })}
                />
              </Field>
              <Field label="Strength / dosage" required>
                <input
                  value={f.strength}
                  onChange={(e) => setF({ ...f, strength: e.target.value })}
                />
              </Field>
              <Field label="Dosage form" required>
                <select
                  value={f.form}
                  onChange={(e) => setF({ ...f, form: e.target.value })}
                >
                  <option>Tablet</option>
                  <option>Capsule</option>
                  <option>Syrup</option>
                  <option>Suspension</option>
                  <option>Cream</option>
                  <option>Ointment</option>
                  <option>Other</option>
                </select>
              </Field>
              <Field label="Unit of measurement" required>
                <input
                  value={f.unit}
                  onChange={(e) => setF({ ...f, unit: e.target.value })}
                />
              </Field>
              <Field label="Minimum stock level">
                <input
                  type="number"
                  min="0"
                  value={f.minimum}
                  onChange={(e) =>
                    setF({ ...f, minimum: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Storage instructions / notes">
                <textarea
                  value={f.notes}
                  onChange={(e) => setF({ ...f, notes: e.target.value })}
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Medicine" required>
                <select
                  value={f.id}
                  onChange={(e) => setF({ ...f, id: e.target.value })}
                >
                  <option value="">Select medicine</option>
                  {data.medicines
                    .filter((m: Medicine) => type === "receive" || m.stock > 0)
                    .map((m: Medicine) => (
                      <option value={m.id} key={m.id}>
                        {m.name} · {m.stock} {m.unit}
                      </option>
                    ))}
                </select>
              </Field>
              {type === "dispense" && (
                <Field label="Resident / Patient" required>
                  <select
                    value={f.residentId}
                    onChange={(e) => setF({ ...f, residentId: e.target.value })}
                  >
                    <option value="">Select resident</option>
                    {data.residents.map((r: Resident) => (
                      <option key={r.id} value={r.id}>
                        {r.id} · {fullName(r)}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <Field
                label={
                  type === "receive"
                    ? "Quantity received"
                    : "Quantity to dispense"
                }
                required
              >
                <input
                  type="number"
                  min="1"
                  max={selected?.stock}
                  value={f.quantity || ""}
                  onChange={(e) =>
                    setF({ ...f, quantity: Number(e.target.value) })
                  }
                />
              </Field>
              {selected && (
                <div className="stock-calculation">
                  <span>
                    Stock before <b>{selected.stock}</b>
                  </span>
                  <span>
                    {type === "receive" ? "Stock after" : "Remaining stock"}{" "}
                    <b>
                      {type === "receive"
                        ? selected.stock + Number(f.quantity)
                        : selected.stock - Number(f.quantity)}
                    </b>
                  </span>
                </div>
              )}
              {type === "receive" && (
                <>
                  <Field label="Batch / Lot number" required>
                    <input
                      value={f.batch}
                      onChange={(e) => setF({ ...f, batch: e.target.value })}
                    />
                  </Field>
                  <Field label="Expiration date" required>
                    <input
                      type="date"
                      min={today()}
                      value={f.expiration}
                      onChange={(e) =>
                        setF({ ...f, expiration: e.target.value })
                      }
                    />
                  </Field>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <div className="modal-foot">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit}>
          {type === "medicine"
            ? "Add Medicine"
            : type === "receive"
              ? "Save Stock Receipt"
              : "Confirm Dispensing"}
        </Button>
      </div>
    </Modal>
  )
}

function Messages({ data, setData, resident, notify, viewPhoto }: any) {
  const [selected, setSelected] = useState(
    resident?.id || data.residents[0]?.id || "",
  )
  const [text, setText] = useState("")
  const [image, setImage] = useState<string>()
  const [search, setSearch] = useState("")
  const [sitio, setSitio] = useState("")
  const [type, setType] = useState("")
  const users = resident
    ? [resident]
    : data.residents.filter(
        (r: Resident) =>
          (!search ||
            fullName(r).toLowerCase().includes(search.toLowerCase())) &&
          (!sitio || r.sitio === sitio) &&
          (!type || r.classification === type),
      )
  const messages = data.messages.filter(
    (m: Message) => m.residentId === selected,
  )
  const send = () => {
    if (!selected || (!text.trim() && !image)) {
      notify("Enter a message or attach an image.")
      return
    }
    const m: Message = {
      id: crypto.randomUUID(),
      residentId: selected,
      sender: resident ? "resident" : "bhw",
      text: text.trim(),
      image,
      at: now(),
    }
    setData((d: AppData) => ({ ...d, messages: [...d.messages, m] }))
    setText("")
    setImage(undefined)
    notify("Message sent successfully.")
  }
  return (
    <div>
      <PageHead
        eyebrow="Private communication"
        title="Messages"
        description={
          resident
            ? "Communicate securely with Barangay San Pedro Health Center."
            : "Communicate with registered residents."
        }
      />
      <div className="message-layout">
        <aside className="conversation-list">
          {!resident && (
            <>
              <div className="search-box">
                <Icon name="search" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search resident"
                />
              </div>
              <div className="message-filters">
                <select
                  value={sitio}
                  onChange={(e) => setSitio(e.target.value)}
                >
                  <option value="">All Sitios</option>
                  {SITIOS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">All Types</option>
                  {CLASSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="conversations">
            {users.map((r: Resident) => {
              const last = data.messages
                .filter((m: Message) => m.residentId === r.id)
                .at(-1)
              return (
                <button
                  className={selected === r.id ? "active" : ""}
                  key={r.id}
                  onClick={() => setSelected(r.id)}
                >
                  <Avatar name={fullName(r)} src={r.photo} size="sm" />
                  <span>
                    <b>{resident ? data.bhw.name : fullName(r)}</b>
                    <small>
                      {resident
                        ? "Barangay Health Worker"
                        : `${r.sitio} · ${r.classification}`}
                    </small>
                    <p>{last?.text || "Start a conversation"}</p>
                  </span>
                </button>
              )
            })}
          </div>
        </aside>
        <section className="chat">
          {selected ? (
            <>
              <header>
                <Avatar
                  name={
                    resident
                      ? data.bhw.name
                      : fullName(
                          data.residents.find(
                            (r: Resident) => r.id === selected,
                          ),
                        )
                  }
                  src={
                    resident
                      ? data.bhw.photo
                      : data.residents.find((r: Resident) => r.id === selected)
                          ?.photo
                  }
                />
                <div>
                  <b>
                    {resident
                      ? data.bhw.name
                      : fullName(
                          data.residents.find(
                            (r: Resident) => r.id === selected,
                          ),
                        )}
                  </b>
                  <span>
                    {resident
                      ? "Authorized Health Center Personnel"
                      : "Registered Resident"}
                  </span>
                </div>
              </header>
              <div className="message-stream">
                {messages.length ? (
                  messages.map((m: Message) => {
                    const own = m.sender === (resident ? "resident" : "bhw")
                    const sender =
                      m.sender === "bhw"
                        ? data.bhw
                        : data.residents.find(
                            (r: Resident) => r.id === m.residentId,
                          )
                    const name =
                      m.sender === "bhw"
                        ? data.bhw.name
                        : fullName(sender as Resident)
                    const src = (sender as any)?.photo
                    return (
                      <div
                        className={`bubble-row ${own ? "own" : ""}`}
                        key={m.id}
                      >
                        <Avatar name={name} src={src} size="sm" />
                        <div className="bubble">
                          {m.image && (
                            <button
                              className="message-image"
                              onClick={() => viewPhoto(m.image)}
                            >
                              <img src={m.image} alt="Message attachment" />
                            </button>
                          )}
                          {m.text && <p>{m.text}</p>}
                          <small>
                            {name} · {new Date(m.at).toLocaleString()}
                          </small>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <Empty
                    icon="message"
                    title="Start a private conversation"
                    text="Messages and image attachments will remain in this thread."
                  />
                )}
              </div>
              {image && (
                <div className="attachment-preview">
                  <img src={image} alt="Attachment preview" />
                  <span>Image ready to send</span>
                  <Button variant="ghost" onClick={() => setImage(undefined)}>
                    Remove
                  </Button>
                </div>
              )}
              <div className="composer">
                <label className="attach-btn">
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => fileToData(e.target.files?.[0], setImage)}
                  />
                  <Icon name="plus" />
                  <span>Attach</span>
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a secure message..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                />
                <Button onClick={send}>Send</Button>
              </div>
            </>
          ) : (
            <Empty
              icon="users"
              title="No recipient selected"
              text="Choose a registered resident to start a message."
            />
          )}
        </section>
      </div>
    </div>
  )
}
function fileToData(file: File | undefined, done: (s: string) => void) {
  if (!file) return
  if (
    !["image/jpeg", "image/png"].includes(file.type) ||
    file.size > 2_000_000
  ) {
    alert("Please choose a JPG or PNG image under 2 MB.")
    return
  }
  const r = new FileReader()
  r.onload = () => done(String(r.result))
  r.readAsDataURL(file)
}

function Announcements({
  data,
  setData,
  notify,
  viewPhoto,
  resident = false,
}: any) {
  const [open, setOpen] = useState(false)
  const [f, setF] = useState<Announcement>({
    id: "",
    title: "",
    content: "",
    date: today(),
    status: "Draft",
  })
  const list = resident
    ? data.announcements.filter((a: Announcement) => a.status === "Published")
    : data.announcements
  const save = (status: "Draft" | "Published") => {
    if (!f.title || !f.content) {
      notify("Title and content are required.")
      return
    }
    const a = {
      ...f,
      id: f.id || nextId("ANN", data.announcements.length),
      status,
    }
    setData((d: AppData) => ({
      ...d,
      announcements: [...d.announcements.filter((x) => x.id !== a.id), a],
    }))
    setOpen(false)
    notify(
      status === "Published"
        ? "Announcement published successfully."
        : "Announcement draft saved.",
    )
  }
  return (
    <div>
      <PageHead
        eyebrow="Community updates"
        title="Announcements"
        description="Timely health center notices for Barangay San Pedro."
        actions={
          !resident && (
            <>
              <Button variant="secondary">
                Drafts (
                {
                  data.announcements.filter(
                    (a: Announcement) => a.status === "Draft",
                  ).length
                }
                )
              </Button>
              <Button icon="plus" onClick={() => setOpen(true)}>
                Add Announcement
              </Button>
            </>
          )
        }
      />
      <div className="announcement-grid">
        {list.length ? (
          list.map((a: Announcement) => (
            <article className="announcement-card" key={a.id}>
              {a.image && (
                <button onClick={() => viewPhoto(a.image!)}>
                  <img src={a.image} alt={a.title} />
                </button>
              )}
              <div>
                <span
                  className={`chip ${
                    a.status === "Published" ? "success" : "neutral"
                  }`}
                >
                  {a.status}
                </span>
                <time>{a.date}</time>
                <h2>{a.title}</h2>
                <p>{a.content}</p>
                {!resident && (
                  <div className="record-actions">
                    <Button
                      variant="ghost"
                      icon="edit"
                      onClick={() => {
                        setF(a)
                        setOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      icon="trash"
                      onClick={() =>
                        confirm("Delete this announcement?") &&
                        setData((d: AppData) => ({
                          ...d,
                          announcements: d.announcements.filter(
                            (x) => x.id !== a.id,
                          ),
                        }))
                      }
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="card empty-records">
            <Empty
              icon="bell"
              title="No announcements yet"
              text={
                resident
                  ? "Published health center announcements will appear here."
                  : "Create a draft or publish the first community announcement."
              }
              action={
                !resident && (
                  <Button icon="plus" onClick={() => setOpen(true)}>
                    Add Announcement
                  </Button>
                )
              }
            />
          </div>
        )}
      </div>
      {open && (
        <Modal
          title={f.id ? "Edit Announcement" : "Add Announcement"}
          subtitle="Create a health center update"
          onClose={() => setOpen(false)}
        >
          <div className="modal-body form-body">
            <Field label="Title" required>
              <input
                value={f.title}
                onChange={(e) => setF({ ...f, title: e.target.value })}
              />
            </Field>
            <Field label="Content" required>
              <textarea
                rows={6}
                value={f.content}
                onChange={(e) => setF({ ...f, content: e.target.value })}
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={f.date}
                onChange={(e) => setF({ ...f, date: e.target.value })}
              />
            </Field>
            <Field label="Announcement image">
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) =>
                  fileToData(e.target.files?.[0], (s) =>
                    setF({ ...f, image: s }),
                  )
                }
              />
            </Field>
            {f.image && (
              <img
                className="upload-preview"
                src={f.image}
                alt="Announcement preview"
              />
            )}
          </div>
          <div className="modal-foot">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => save("Draft")}>
              Save Draft
            </Button>
            <Button onClick={() => save("Published")}>
              Publish Announcement
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function About({ data, setData, notify, editable = false, viewPhoto }: any) {
  const [edit, setEdit] = useState(false)
  const [center, setCenter] = useState(data.center)
  const save = () => {
    setData((d: AppData) => ({ ...d, center }))
    setEdit(false)
    notify("Health center information updated successfully.")
  }
  return (
    <div>
      <PageHead
        eyebrow="HC · Barangay San Pedro"
        title="About the Health Center"
        description="Community-centered care in Naujan, Oriental Mindoro."
        actions={
          editable && (
            <Button icon="edit" onClick={() => setEdit(true)}>
              Edit Information
            </Button>
          )
        }
      />
      <section className="about-hero">
        {center.image ? (
          <button onClick={() => viewPhoto(center.image)}>
            <img src={center.image} alt="Barangay San Pedro Health Center" />
          </button>
        ) : (
          <div className="facility-placeholder">
            <Icon name="health" size={40} />
            <span>Facility photo awaiting authorized upload</span>
          </div>
        )}
        <div>
          <span>YOUR COMMUNITY HEALTH PARTNER</span>
          <h2>Care that begins close to home.</h2>
          <p>{center.overview}</p>
        </div>
      </section>
      <section className="mission-card">
        <span>Our Mission</span>
        <h2>{center.mission}</h2>
      </section>
      <div className="info-cards">
        <article>
          <span>Location</span>
          <b>Barangay San Pedro, Naujan, Oriental Mindoro</b>
        </article>
        <article>
          <span>Hours</span>
          <b>{center.hours}</b>
        </article>
        <article>
          <span>Contact</span>
          <b>{center.contact}</b>
        </article>
      </div>
      <section className="services">
        <div className="section-title">
          <h2>Community Health Services</h2>
          <p>Coordinated primary and preventive healthcare.</p>
        </div>
        <div>
          {center.services.map((s: string, i: number) => (
            <article key={s}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <Icon
                name={["health", "users", "consult", "box", "info", "bell"][i]}
              />
              <h3>{s}</h3>
              <p>
                {
                  [
                    "Organized, resident-centered support delivered by authorized health personnel.",
                    "Maternal health support, infant monitoring, and appropriate preventive care.",
                    "Consultation documentation, resident monitoring, and coordinated follow-up visits.",
                    "Medicine stock monitoring and documented distribution of available medicines.",
                    "Community health information, preventive care guidance, and health awareness activities.",
                    "Health center notices, public health updates, and community announcements.",
                  ][i]
                }
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="card">
        <div className="card-title">
          <div>
            <h2>Health Center Staff</h2>
            <p>Authorized personnel, contact details and staff photos.</p>
          </div>
          {editable && (
            <Button
              icon="plus"
              onClick={() =>
                notify("Staff profile form is ready for backend integration.")
              }
            >
              Add Staff
            </Button>
          )}
        </div>
        <Empty
          icon="users"
          title="No staff profiles added yet"
          text="Staff profiles and photos added by the health center will appear here."
        />
      </section>
      <section className="card">
        <div className="card-title">
          <div>
            <h2>Facility Gallery</h2>
            <p>A view of the health center and community service spaces.</p>
          </div>
          {editable && (
            <Button icon="plus" onClick={() => setEdit(true)}>
              Upload Photo
            </Button>
          )}
        </div>
        <Empty
          icon="health"
          title="No facility photos yet"
          text="Authorized facility photos will appear here."
        />
      </section>
      {edit && (
        <Modal
          title="Edit Health Center Information"
          subtitle="Changes update the shared public-facing page."
          onClose={() => setEdit(false)}
        >
          <div className="modal-body form-body">
            <Field label="Overview">
              <textarea
                value={center.overview}
                onChange={(e) =>
                  setCenter({ ...center, overview: e.target.value })
                }
              />
            </Field>
            <Field label="Mission">
              <textarea
                value={center.mission}
                onChange={(e) =>
                  setCenter({ ...center, mission: e.target.value })
                }
              />
            </Field>
            <Field label="Operating hours">
              <input
                value={center.hours}
                onChange={(e) =>
                  setCenter({ ...center, hours: e.target.value })
                }
              />
            </Field>
            <Field label="Contact">
              <input
                value={center.contact}
                onChange={(e) =>
                  setCenter({ ...center, contact: e.target.value })
                }
              />
            </Field>
            <Field label="Facility photo">
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) =>
                  fileToData(e.target.files?.[0], (s) =>
                    setCenter({ ...center, image: s }),
                  )
                }
              />
            </Field>
            {center.image && (
              <img
                className="upload-preview"
                src={center.image}
                alt="Facility preview"
              />
            )}
          </div>
          <div className="modal-foot">
            <Button variant="secondary" onClick={() => setEdit(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save Changes</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
function Reports({ data }: any) {
  const metrics = [
    ["Resident Population", data.residents.length],
    ["Health Records", data.healthRecords.length],
    [
      "Consultation Activity",
      data.consultations.filter((x: Consultation) => x.status === "Finalized")
        .length,
    ],
    [
      "Prescription Activity",
      data.prescriptions.filter((x: Prescription) => x.status !== "Draft")
        .length,
    ],
    ["Medicine Inventory", data.medicines.length],
    [
      "Low Stock",
      data.medicines.filter((x: Medicine) => x.stock > 0 && x.stock <= 50)
        .length,
    ],
  ]
  return (
    <div>
      <PageHead
        eyebrow="Live system data"
        title="Reports"
        description="Operational summaries generated only from saved MEDNEXUS records."
        actions={
          <Button icon="print" onClick={() => window.print()}>
            Print Report
          </Button>
        }
      />
      <div className="report-grid">
        {metrics.map(([l, v]) => (
          <article className="card" key={l}>
            <span>{l}</span>
            <strong>{v}</strong>
            <div className="zero-chart">
              <i style={{ width: `${Math.min(Number(v) * 10, 100)}%` }} />
            </div>
            <small>
              {Number(v) === 0
                ? "No records available"
                : "Based on current saved records"}
            </small>
          </article>
        ))}
      </div>
    </div>
  )
}
function Notifications({ data, go }: any) {
  const items = [
    ...data.prescriptions
      .filter((p: Prescription) => p.status !== "Draft")
      .map((p: Prescription) => ({
        id: p.id,
        title: "Prescription created",
        text: `${p.id} is available for ${fullName(data.residents.find((r: Resident) => r.id === p.residentId))}`,
        to: "prescriptions",
      })),
    ...data.announcements
      .filter((a: Announcement) => a.status === "Published")
      .map((a: Announcement) => ({
        id: a.id,
        title: "Announcement published",
        text: a.title,
        to: "announcements",
      })),
  ]
  return (
    <div>
      <PageHead
        eyebrow="Activity center"
        title="Notifications"
        description="Events generated from actual saved records."
      />
      <div className="card notification-list">
        {items.length ? (
          items.map((i) => (
            <button key={i.id} onClick={() => go(i.to)}>
              <span>
                <Icon name="bell" />
              </span>
              <div>
                <b>{i.title}</b>
                <p>{i.text}</p>
                <small>Related record: {i.id}</small>
              </div>
              <Icon name="arrow" />
            </button>
          ))
        ) : (
          <Empty
            icon="bell"
            title="You’re all caught up"
            text="Record, message and announcement notifications will appear here."
          />
        )}
      </div>
    </div>
  )
}

function Profile({ data, setData, notify, role, resident, viewPhoto }: any) {
  const target = role === "bhw" ? data.bhw : resident
  const [edit, setEdit] = useState(false)
  const [name, setName] = useState(
    role === "bhw" ? target.name : fullName(target),
  )
  const [contact, setContact] = useState(target.contact || target.mobile || "")
  const [preview, setPreview] = useState<string>()
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  })
  const save = () => {
    if (role === "bhw")
      setData((d: AppData) => ({ ...d, bhw: { ...d.bhw, name, contact } }))
    else {
      const bits = name.trim().split(/\s+/)
      setData((d: AppData) => ({
        ...d,
        residents: d.residents.map((r: Resident) =>
          r.id === target.id
            ? {
                ...r,
                firstName: bits[0] || r.firstName,
                lastName: bits.slice(1).join(" ") || r.lastName,
                mobile: contact,
              }
            : r,
        ),
      }))
    }
    setEdit(false)
    notify("Profile updated successfully.")
  }
  const savePhoto = () => {
    if (!preview) return
    if (role === "bhw")
      setData((d: AppData) => ({ ...d, bhw: { ...d.bhw, photo: preview } }))
    else
      setData((d: AppData) => ({
        ...d,
        residents: d.residents.map((r: Resident) =>
          r.id === target.id ? { ...r, photo: preview } : r,
        ),
      }))
    setPreview(undefined)
    notify("Profile picture updated successfully.")
  }
  return (
    <div>
      <PageHead
        eyebrow="Authenticated account"
        title="My Profile"
        description="Manage your identity, contact information and account security."
      />
      <section className="profile-hero">
        <div>
          <Avatar
            name={role === "bhw" ? target.name : fullName(target)}
            src={preview || target.photo}
            size="xl"
            onClick={() => target.photo && viewPhoto(target.photo)}
          />
          <label className="photo-action">
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => fileToData(e.target.files?.[0], setPreview)}
            />
            <Icon name="edit" size={16} /> Change photo
          </label>
        </div>
        <div>
          <h2>{role === "bhw" ? target.name : fullName(target)}</h2>
          <p>
            {role === "bhw" ? "Barangay Health Worker" : "Registered Resident"}
          </p>
          <span className="chip success">Active</span>
          <span className="chip neutral">
            {role === "bhw" ? "Authorized Health Center Personnel" : target.id}
          </span>
        </div>
      </section>
      {preview && (
        <div className="card photo-confirm">
          <span>Preview selected. Save to update this avatar everywhere.</span>
          <Button variant="secondary" onClick={() => setPreview(undefined)}>
            Cancel
          </Button>
          <Button onClick={savePhoto}>Save Photo</Button>
        </div>
      )}
      <div className="profile-grid">
        <section className="card">
          <div className="card-title">
            <div>
              <h2>Profile Details</h2>
              <p>Information tied to the currently authenticated account.</p>
            </div>
            <Button
              variant="secondary"
              icon="edit"
              onClick={() => setEdit(!edit)}
            >
              {edit ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
          <div className="profile-fields">
            <Field label="Full Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                readOnly={!edit}
              />
            </Field>
            <Field label="Position / Category">
              <input
                value={
                  role === "bhw"
                    ? "Barangay Health Worker"
                    : target.classification
                }
                readOnly
              />
            </Field>
            <Field label="Contact Number">
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                readOnly={!edit}
              />
            </Field>
            <Field label="Username">
              <input value={target.username} readOnly />
            </Field>
          </div>
          {edit && <Button onClick={save}>Save Changes</Button>}
        </section>
        <section className="card">
          <div className="card-title">
            <div>
              <h2>Security Settings</h2>
              <p>Change your account password securely.</p>
            </div>
          </div>
          <div className="profile-fields">
            <Field label="Current Password">
              <input
                type="password"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
              />
            </Field>
            <Field label="New Password">
              <input
                type="password"
                value={passwords.next}
                onChange={(e) =>
                  setPasswords({ ...passwords, next: e.target.value })
                }
              />
            </Field>
            <Field label="Confirm New Password">
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
              />
            </Field>
          </div>
          <div className="security-notice">
            <Icon name="info" />
            <span>
              Passwords are never displayed. This prototype stores credentials
              locally; production requires a server-side authentication provider
              and secure hashing.
            </span>
          </div>
          <Button
            onClick={() => {
              if (
                passwords.next.length < 8 ||
                passwords.next !== passwords.confirm
              ) {
                notify(
                  "New passwords must match and contain at least 8 characters.",
                )
                return
              }
              if (
                role === "resident" &&
                passwords.current === target.password
              ) {
                setData((d: AppData) => ({
                  ...d,
                  residents: d.residents.map((r: Resident) =>
                    r.id === target.id ? { ...r, password: passwords.next } : r,
                  ),
                }))
                setPasswords({ current: "", next: "", confirm: "" })
                notify("Password changed successfully.")
              } else notify("Current password could not be verified.")
            }}
          >
            Change Password
          </Button>
        </section>
      </div>
    </div>
  )
}

function ResidentPage({
  page,
  data,
  resident,
  setData,
  go,
  notify,
  viewPhoto,
}: any) {
  const mine = <T extends { residentId: string }>(arr: T[]) =>
    arr.filter((x) => x.residentId === resident.id)
  if (page === "dashboard") {
    const latest = mine(data.healthRecords).at(-1)
    const recentRx = mine(data.prescriptions)
      .filter((p: Prescription) => p.status !== "Draft")
      .at(-1)
    return (
      <div>
        <LiveGreeting name={fullName(resident)} resident={resident} />
        <section className="resident-overview">
          <Avatar name={fullName(resident)} src={resident.photo} size="lg" />
          <div>
            <span>Personal overview</span>
            <h2>{fullName(resident)}</h2>
            <p>
              {resident.id} · {resident.classification} · {resident.sitio}
            </p>
          </div>
          <Button variant="secondary" onClick={() => go("profile")}>
            My Profile
          </Button>
        </section>
        <div className="resident-dashboard">
          <section className="card">
            <div className="card-title">
              <div>
                <h2>My Health Overview</h2>
                <p>Your latest connected health information.</p>
              </div>
            </div>
            {latest ? (
              <dl className="health-stats">
                <div>
                  <dt>Latest record</dt>
                  <dd>{latest.date}</dd>
                </div>
                <div>
                  <dt>Blood pressure</dt>
                  <dd>{latest.bloodPressure || "Not recorded"}</dd>
                </div>
                <div>
                  <dt>Allergies</dt>
                  <dd>{latest.allergies || "Not assessed"}</dd>
                </div>
                <div>
                  <dt>Current conditions</dt>
                  <dd>{latest.conditions || "Not recorded"}</dd>
                </div>
              </dl>
            ) : (
              <Empty
                icon="health"
                title="No health records yet"
                text="Records added by the health center will appear here."
              />
            )}
            <Button variant="ghost" onClick={() => go("health")}>
              View health records
            </Button>
          </section>
          <section className="card">
            <div className="card-title">
              <div>
                <h2>My Medication Overview</h2>
                <p>Latest finalized prescription.</p>
              </div>
            </div>
            {recentRx ? (
              <div className="latest-rx">
                <span className="record-icon">
                  <Icon name="rx" />
                </span>
                <div>
                  <b>{recentRx.id}</b>
                  <p>
                    {recentRx.medicines
                      .map((m: MedicineLine) => m.name)
                      .join(", ")}
                  </p>
                  <small>
                    {recentRx.date} · {recentRx.status}
                  </small>
                </div>
              </div>
            ) : (
              <Empty
                icon="rx"
                title="No prescriptions yet"
                text="Finalized prescriptions will appear here."
              />
            )}
            <Button variant="ghost" onClick={() => go("prescriptions")}>
              View prescriptions
            </Button>
          </section>
          <section className="card span-two">
            <div className="card-title">
              <div>
                <h2>Quick links</h2>
                <p>Access your connected health services.</p>
              </div>
            </div>
            <div className="quick-grid">
              {[
                ["My Health Records", "health", "health"],
                ["My Consultations", "consultations", "consult"],
                ["My Prescriptions", "prescriptions", "rx"],
                ["Messages", "messages", "message"],
                ["Announcements", "announcements", "bell"],
                ["Medicine Availability", "availability", "box"],
              ].map(([l, p, i]) => (
                <button onClick={() => go(p)} key={p}>
                  <span>
                    <Icon name={i} />
                  </span>
                  {l}
                  <Icon name="arrow" size={16} />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    )
  }
  if (page === "health")
    return (
      <ResidentRecords
        title="My Health Records"
        description="Clinical records created by authorized health personnel."
      >
        <RecordCards
          records={mine(data.healthRecords)}
          data={data}
          kind="health"
        />
      </ResidentRecords>
    )
  if (page === "consultations")
    return (
      <ResidentRecords
        title="My Consultations"
        description="Your complete finalized consultation history."
      >
        <RecordCards
          records={mine(data.consultations).filter(
            (x: Consultation) => x.status === "Finalized",
          )}
          data={data}
          kind="consult"
        />
      </ResidentRecords>
    )
  if (page === "prescriptions")
    return (
      <ResidentRecords
        title="My Prescriptions"
        description="Medication orders finalized for your connected resident identity."
      >
        <ResidentPrescriptions
          records={mine(data.prescriptions).filter(
            (x: Prescription) => x.status !== "Draft",
          )}
          resident={resident}
          center={data.center}
        />
      </ResidentRecords>
    )
  if (page === "medications")
    return (
      <ResidentRecords
        title="My Medication History"
        description="Medication entries grouped by finalized prescription."
      >
        <ConnectedList
          items={mine(data.prescriptions)
            .filter((x: Prescription) => x.status !== "Draft")
            .flatMap((p: Prescription) =>
              p.medicines.map((m) => ({
                ...m,
                prescription: p.id,
                date: p.date,
                status: p.status,
              })),
            )}
          empty="No medication history available."
          render={(x: any) => (
            <div>
              <b>
                {x.name} {x.strength}
              </b>
              <p>
                {x.dose} · {x.frequency} · {x.route} · {x.duration}
              </p>
              <small>
                {x.prescription} · {x.date} · {x.status}
              </small>
            </div>
          )}
        />
      </ResidentRecords>
    )
  if (page === "availability")
    return (
      <ResidentRecords
        title="Medicine Availability"
        description="View-only availability from current usable inventory."
      >
        <div className="availability-grid">
          {data.medicines.length ? (
            data.medicines.map((m: Medicine) => (
              <article className="card" key={m.id}>
                <Icon name="box" />
                <div>
                  <b>{m.name}</b>
                  <span>
                    {m.generic} · {m.strength} · {m.form}
                  </span>
                </div>
                <span className={`chip ${m.stock > 0 ? "success" : "danger"}`}>
                  {m.stock > 0 ? "Available" : "Out of Stock"}
                </span>
              </article>
            ))
          ) : (
            <Empty
              icon="box"
              title="No medicines listed"
              text="Catalogued medicine availability will appear here."
            />
          )}
        </div>
      </ResidentRecords>
    )
  if (page === "messages")
    return (
      <Messages
        data={data}
        setData={setData}
        resident={resident}
        notify={notify}
        viewPhoto={viewPhoto}
      />
    )
  if (page === "announcements")
    return (
      <Announcements
        data={data}
        setData={setData}
        notify={notify}
        viewPhoto={viewPhoto}
        resident
      />
    )
  if (page === "about")
    return (
      <About
        data={data}
        setData={setData}
        notify={notify}
        viewPhoto={viewPhoto}
      />
    )
  if (page === "profile")
    return (
      <Profile
        data={data}
        setData={setData}
        notify={notify}
        role="resident"
        resident={resident}
        viewPhoto={viewPhoto}
      />
    )
  return (
    <Notifications
      data={{ ...data, prescriptions: mine(data.prescriptions) }}
      go={go}
    />
  )
}
function ResidentRecords({ title, description, children }: any) {
  return (
    <div>
      <PageHead
        eyebrow="Private resident portal"
        title={title}
        description={description}
      />
      {children}
    </div>
  )
}
function ResidentPrescriptions({ records, resident, center }: any) {
  const [print, setPrint] = useState<Prescription>()
  return (
    <>
      <div className="record-grid">
        {records.length ? (
          records.map((p: Prescription) => (
            <article className="record-card" key={p.id}>
              <div className="record-top">
                <span className="record-icon">
                  <Icon name="rx" />
                </span>
                <span>
                  <b>{p.id}</b>
                  <small>{p.date}</small>
                </span>
                <span className="chip success">{p.status}</span>
              </div>
              <strong className="diagnosis">Diagnosis: {p.diagnosis}</strong>
              <div className="medicine-summary">
                {p.medicines.map((m) => (
                  <div key={m.id}>
                    <b>
                      {m.name} {m.strength}
                    </b>
                    <p>
                      {m.dose} · {m.frequency} · {m.route} · {m.duration}
                    </p>
                    <small>{m.instructions}</small>
                  </div>
                ))}
              </div>
              <Button icon="eye" onClick={() => setPrint(p)}>
                View Complete Prescription
              </Button>
            </article>
          ))
        ) : (
          <div className="card empty-records">
            <Empty
              icon="rx"
              title="No prescriptions yet"
              text="Only finalized prescriptions associated with your Resident ID will appear here."
            />
          </div>
        )}
      </div>
      {print && (
        <PrescriptionDocument
          prescription={print}
          resident={resident}
          center={center}
          onClose={() => setPrint(undefined)}
        />
      )}
    </>
  )
}
