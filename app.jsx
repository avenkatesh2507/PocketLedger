import { useState, useEffect, useRef } from "react";

/* Expense categories with colors and labels */
const CATEGORIES = [
  { id: "food", label: "FOOD", color: "#546200", bg: "#daec7f" },
  { id: "transport", label: "TRANSPORT", color: "#1a3a5c", bg: "#b8d4f0" },
  { id: "groceries", label: "GROCERIES", color: "#7c4a00", bg: "#ffd488" },
  { id: "personal", label: "PERSONAL", color: "#b71f35", bg: "#ffc8b0" },
  { id: "home", label: "HOME", color: "#2e4a2e", bg: "#c8e6c8" },
  { id: "health", label: "HEALTH", color: "#5e5c54", bg: "#e7e2d8" },
  { id: "other", label: "OTHER", color: "#464839", bg: "#c7c8b4" },
];

/* Default monthly budget allocation per category */
const DEFAULT_BUDGET = [
  { id: "food", label: "Food & Dining", allocated: 300 },
  { id: "transport", label: "Transport", allocated: 150 },
  { id: "groceries", label: "Groceries", allocated: 250 },
  { id: "personal", label: "Personal", allocated: 200 },
  { id: "home", label: "Home & Utilities", allocated: 1400 },
  { id: "health", label: "Health", allocated: 100 },
  { id: "other", label: "Other", allocated: 100 },
];

/* Supported currencies for conversion */
const CURRENCIES = ["USD", "EUR", "GBP", "INR"];
const SYM = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
};


/* Sample expenses for first-time users */
const SEED = [
  {
    id: 1,
    name: "Artisanal Coffee & Muffin",
    amount: 12.45,
    category: "food",
    note: "",
    date: "Oct 14",
  },
  {
    id: 2,
    name: "Subway Weekly Pass",
    amount: 33.0,
    category: "transport",
    note: "Walking home tonight!",
    date: "Oct 14",
  },
  {
    id: 3,
    name: "Farmer's Market Haul",
    amount: 64.2,
    category: "groceries",
    note: "",
    date: "Oct 13",
  },
  {
    id: 4,
    name: "Vintage Thrift Shop (Boots)",
    amount: 110.0,
    category: "personal",
    note: "These boots were a steal!",
    date: "Oct 13",
  },
  {
    id: 5,
    name: "Studio Rent",
    amount: 1200.0,
    category: "home",
    note: "",
    date: "Oct 12",
  },
];

/* Documentation cards shown in Vault */
const VAULT_DOCS = [
  {
    id: "guide",
    icon: "📖",
    title: "How to use PocketLedger",
    tag: "GUIDE",
    tagC: "#546200",
    tagB: "#daec7f",
    body:
      "Log expenses daily in the Journal tab. Use categories consistently so your Insights breakdown stays meaningful. Set monthly allocations in the Budget tab — the progress bars will warn you when a category runs over.",
  },
  {
    id: "tips",
    icon: "💡",
    title: "Smart spending tips",
    tag: "TIPS",
    tagC: "#1a3a5c",
    tagB: "#b8d4f0",
    body:
      "The 50/30/20 rule: 50% of take-home to needs, 30% to wants, 20% to savings. Review your Weekly Reflection every Sunday. If any category exceeds its allocation, flag it and reduce discretionary spending next week.",
  },
  {
    id: "privacy",
    icon: "🔒",
    title: "Your data stays local",
    tag: "PRIVACY",
    tagC: "#2e4a2e",
    tagB: "#c8e6c8",
    body:
      "PocketLedger stores everything in your browser's localStorage — nothing is sent to any server. Your expenses, budget, and name live entirely on your device. Clear your browser storage (or use the reset button in this tab) to start fresh.",
  },
  {
    id: "export",
    icon: "📤",
    title: "Export your journal",
    tag: "EXPORT",
    tagC: "#7c4a00",
    tagB: "#ffd488",
    body:
      "Download your full expense list as a .csv file and paste it into any spreadsheet app for deeper analysis. Use the button below to export your current data.",
  },
];

/* Load data from browser storage with fallback */
function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

/* Save data to browser storage */
function save(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

/* Get category object by ID */
function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[6];
}

/* Group expenses by date string */
function groupByDate(expenses) {
  const map = {};
  expenses.forEach((e) => {
    if (!map[e.date]) map[e.date] = [];
    map[e.date].push(e);
  });
  return Object.entries(map);
}


/* Animated number counter with easing effect */
function AnimNum({ value, prefix = "$" }) {
  const [disp, setDisp] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    const t0 = performance.now();

    const step = (t) => {
      const p = Math.min((t - t0) / 450, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisp(from + (to - from) * e);

      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        prev.current = to;
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  return (
    <>
      {prefix}
      {disp.toFixed(2)}
    </>
  );
}

/* Category label badge */
function Tag({ id }) {
  const c = getCategoryById(id);

  return (
    <span
      style={{
        fontFamily: "'Inter',sans-serif",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.07em",
        padding: "2px 7px",
        borderRadius: 3,
        background: c.bg,
        color: c.color,
        marginLeft: 8,
      }}
    >
      {c.label}
    </span>
  );
}

/* Sticky note visual component */
function Sticky({ children, color = "#ffd488", rotate = "-1.5deg", style = {} }) {
  return (
    <div
      style={{
        background: color,
        padding: "16px 18px",
        borderRadius: 2,
        boxShadow: "2px 3px 8px rgba(0,0,0,0.13)",
        transform: `rotate(${rotate})`,
        fontFamily: "'Caveat',cursive",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* Torn paper divider SVG */
function TornDivider() {
  return (
    <div
      style={{
        position: "relative",
        height: 18,
        overflow: "hidden",
        margin: "0 -1px",
        pointerEvents: "none",
      }}
    >
      <svg
        viewBox="0 0 800 18"
        preserveAspectRatio="none"
        style={{
          width: "100%",
          height: 18,
          display: "block",
        }}
      >
        <path
          d="M0,0 Q40,14 80,6 Q120,0 160,10 Q200,18 240,8 Q280,0 320,12 Q360,18 400,6 Q440,0 480,14 Q520,18 560,7 Q600,0 640,11 Q680,18 720,5 Q760,0 800,9 L800,18 L0,18 Z"
          fill="#fff8f3"
          opacity="0.7"
        />
        <path
          d="M0,4 Q40,16 80,8 Q120,2 160,12 Q200,18 240,9 Q280,2 320,14 Q360,18 400,8 Q440,0 480,15 Q520,18 560,9 Q600,2 640,13 Q680,18 720,7 Q760,2 800,11"
          stroke="#d4c9b0"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  );
}


/* First-time user onboarding modal */
function Onboarding({ onComplete }) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [err, setErr] = useState(false);

  function submit() {
    if (!first.trim() || !last.trim()) {
      setErr(true);
      return;
    }
    onComplete({
      firstName: first.trim(),
      lastName: last.trim(),
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(39,25,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
        }}
      >
        {/* Decorative tape */}
        <div
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 80,
            height: 16,
            background: "rgba(190,207,102,0.65)",
            borderRadius: 2,
            zIndex: 2,
          }}
        />

        {/* Form card */}
        <div
          style={{
            background: "#fffdf8",
            border: "1px solid #e8dfc8",
            borderRadius: 4,
            padding: "36px 32px 32px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 36 }}>📒</span>
          </div>

          <div
            style={{
              fontFamily: "'Caveat',cursive",
              fontSize: 32,
              fontWeight: 700,
              color: "#271900",
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            Welcome to PocketLedger
          </div>

          <div
            style={{
              fontFamily: "'Kalam',cursive",
              fontSize: 15,
              color: "#78716c",
              textAlign: "center",
              marginBottom: 28,
              lineHeight: 1.5,
            }}
          >
            Your personal finance journal. Let's get you set up — what's your
            name?
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {[
              { label: "FIRST NAME", val: first, set: setFirst, ph: "e.g. Ada" },
              {
                label: "LAST NAME",
                val: last,
                set: setLast,
                ph: "e.g. Lovelace",
              },
            ].map((f) => (
              <div key={f.label}>
                <div
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "#78716c",
                    marginBottom: 6,
                  }}
                >
                  {f.label}
                </div>

                <input
                  value={f.val}
                  onChange={(e) => {
                    f.set(e.target.value);
                    setErr(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder={f.ph}
                  autoFocus={f.label === "FIRST NAME"}
                  style={{
                    width: "100%",
                    border: "none",
                    borderBottom:
                      err && !f.val.trim()
                        ? "2px solid #b71f35"
                        : "2px solid #c7c8b4",
                    background: "transparent",
                    fontFamily: "'Manrope',sans-serif",
                    fontSize: 17,
                    color: "#271900",
                    padding: "6px 0",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderBottomColor = "#546200")}
                  onBlur={(e) =>
                    (e.target.style.borderBottomColor =
                      err && !f.val.trim() ? "#b71f35" : "#c7c8b4")
                  }
                />
              </div>
            ))}

            {err && (
              <div
                style={{
                  fontFamily: "'Kalam',cursive",
                  fontSize: 13,
                  color: "#b71f35",
                }}
              >
                Please fill in both fields ✏️
              </div>
            )}

            <button
              onClick={submit}
              style={{
                marginTop: 8,
                background: "#546200",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "14px",
                fontFamily: "'Inter',sans-serif",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.06em",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#414c00")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#546200")}
            >
              OPEN MY JOURNAL →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* Main application component */
export default function PocketLedger() {
  /* User profile state */
  const [user, setUser] = useState(() => load("pl_user", null));

  /* Expense data */
  const [expenses, setExp] = useState(() => load("pl_exp", SEED));

  /* Budget allocations by category */
  const [budget, setBudget] = useState(() => load("pl_budget", DEFAULT_BUDGET));

  /* Monthly income */
  const [income, setIncome] = useState(() => load("pl_income", 3500));

  /* Current active tab */
  const [tab, setTab] = useState("journal");

  /* ID of expense being removed (for animation) */
  const [removing, setRem] = useState(null);

  /* Show/hide add expense form modal */
  const [showForm, setShowForm] = useState(false);

  /* Currency for conversion display */
  const [currency, setCur] = useState("USD");

  /* Exchange rates from API */
  const [rates, setRates] = useState({});

  /* API loading status */
  const [rateStatus, setRS] = useState("idle");

  /* New expense form data */
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "food",
    note: "",
  });

  /* Validation errors */
  const [errors, setErrors] = useState({});

  /* Edit budget mode toggle */
  const [editBudget, setEB] = useState(false);

  /* Budget draft for editing */
  const [budgetDraft, setBD] = useState(null);

  /* Expanded documentation card ID */
  const [expandedDoc, setED] = useState(null);

  /* Edit name mode toggle */
  const [editName, setEN] = useState(false);

  /* Name draft for editing */
  const [nameDraft, setND] = useState({ firstName: "", lastName: "" });

  /* Weekly spending goal */
  const [weeklyGoal, setWG] = useState(() => load("pl_goal", 400));

  /* ID of expense being edited */
  const [editingExpId, setEE] = useState(null);

  /* Expense edit form data */
  const [editingExpForm, setEF] = useState({
    name: "",
    amount: "",
    category: "food",
    note: "",
  });

  /* Multi-user profile storage */
  const [profiles, setProfiles] = useState(() => load("pl_profiles", {}));

  /* Counter for unique expense IDs */
  const nextId = useRef(200);

  /* Generate profile key from first and last name (case-insensitive) */
  function getProfileKey(firstName, lastName) {
    return `${firstName.toLowerCase()}|${lastName.toLowerCase()}`;
  }

  /* Handle first-time user onboarding or returning user login */
  function handleOnboardingComplete(newUser) {
    const key = getProfileKey(newUser.firstName, newUser.lastName);
    const existingProfile = profiles[key];

    if (existingProfile) {
      /* Restore existing user data */
      setUser(newUser);
      setExp(existingProfile.expenses || SEED);
      setBudget(existingProfile.budget || DEFAULT_BUDGET);
      setIncome(existingProfile.income || 3500);
      setWG(existingProfile.goal || 400);
    } else {
      /* Create new user with defaults */
      setUser(newUser);
      setExp(SEED);
      setBudget(DEFAULT_BUDGET);
      setIncome(3500);
      setWG(400);
    }
  }

  /* Save current user data and logout */
  function handleLogout() {
    const key = getProfileKey(user.firstName, user.lastName);
    setProfiles((prev) => ({
      ...prev,
      [key]: {
        firstName: user.firstName,
        lastName: user.lastName,
        expenses: expenses,
        budget: budget,
        income: income,
        goal: weeklyGoal,
      },
    }));
    setUser(null);
  }

  /* Persist all data to localStorage whenever state changes */
  useEffect(() => {
    save("pl_profiles", profiles);
  }, [profiles]);

  useEffect(() => {
    save("pl_user", user);
  }, [user]);

  useEffect(() => {
    save("pl_exp", expenses);
  }, [expenses]);

  useEffect(() => {
    save("pl_budget", budget);
  }, [budget]);

  useEffect(() => {
    save("pl_income", income);
  }, [income]);

  useEffect(() => {
    save("pl_goal", weeklyGoal);
  }, [weeklyGoal]);

  /* Fetch currency exchange rates */
  useEffect(() => {
    if (currency === "USD") {
      setRates({});
      setRS("idle");
      return;
    }

    setRS("loading");
    fetch(`https://api.frankfurter.dev/v2/rate/USD/${currency}`)
      .then((r) => r.json())
      .then((d) => {
        setRates({ [currency]: d.rate });
        setRS("idle");
      })
      .catch(() => setRS("error"));
  }, [currency]);


  /* Calculate total spent */
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  /* Convert total to selected currency */
  const converted = rates[currency] ? total * rates[currency] : total;

  /* Currency symbol */
  const sym = SYM[currency] || "$";

  /* Total budgeted across all categories */
  const totBudget = budget.reduce((s, c) => s + c.allocated, 0);

  /* Budget health percentage */
  const health = Math.max(
    0,
    Math.min(100, Math.round((1 - total / totBudget) * 100))
  );

  /* Spending by category with totals */
  const catTotals = budget
    .map((bc) => ({
      ...bc,
      ...getCategoryById(bc.id),
      spent: expenses
        .filter((e) => e.category === bc.id)
        .reduce((s, e) => s + e.amount, 0),
    }))
    .sort((a, b) => b.spent - a.spent);

  /* Top spending category */
  const topCat = catTotals.filter((c) => c.spent > 0)[0] || null;

  /* Expenses grouped by date */
  const groups = groupByDate(expenses);

  /* Show onboarding if not logged in */
  if (!user) return <Onboarding onComplete={handleOnboardingComplete} />;

  /* Add new expense handler */
  function addExpense() {
    const e = {};

    if (!form.name.trim()) e.name = true;
    if (!form.amount || isNaN(+form.amount) || +form.amount <= 0)
      e.amount = true;

    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const label = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    setExp((prev) => [
      {
        id: nextId.current++,
        name: form.name.trim(),
        amount: parseFloat(form.amount),
        category: form.category,
        note: form.note.trim(),
        date: label,
      },
      ...prev,
    ]);

    setForm({ name: "", amount: "", category: "food", note: "" });
    setErrors({});
    setShowForm(false);
  }

  /* Remove expense with animation */
  function removeExp(id) {
    setRem(id);
    setTimeout(() => {
      setExp((prev) => prev.filter((e) => e.id !== id));
      setRem(null);
    }, 380);
  }

  /* Start editing an expense */
  function startEditExp(exp) {
    setEE(exp.id);
    setEF({
      name: exp.name,
      amount: exp.amount.toString(),
      category: exp.category,
      note: exp.note,
    });
  }

  /* Save edited expense */
  function saveEditExp() {
    const e = {};

    if (!editingExpForm.name.trim()) e.name = true;
    if (
      !editingExpForm.amount ||
      isNaN(+editingExpForm.amount) ||
      +editingExpForm.amount <= 0
    )
      e.amount = true;

    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setExp((prev) =>
      prev.map((exp) =>
        exp.id === editingExpId
          ? {
              ...exp,
              name: editingExpForm.name.trim(),
              amount: parseFloat(editingExpForm.amount),
              category: editingExpForm.category,
              note: editingExpForm.note.trim(),
            }
          : exp
      )
    );

    setEE(null);
    setEF({ name: "", amount: "", category: "food", note: "" });
    setErrors({});
  }

  /* Export expenses as CSV */
  function exportCSV() {
    const rows = [
      ["Name", "Amount", "Category", "Date", "Note"],
      ...expenses.map((e) => [
        `"${e.name}"`,
        e.amount,
        e.category,
        e.date,
        `"${e.note}"`,
      ]),
    ];

    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([rows.map((r) => r.join(",")).join("\n")], {
        type: "text/csv",
      })
    );
    a.download = "pocketledger.csv";
    a.click();
  }

  /* Shared style constants */
  const notebook = {
    background: "#fffdf8",
    border: "1px solid #e8dfc8",
    borderRadius: 4,
    boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
  };

  const inpBase = {
    width: "100%",
    border: "none",
    borderBottom: "2px solid #c7c8b4",
    background: "transparent",
    fontFamily: "'Manrope',sans-serif",
    fontSize: 16,
    color: "#271900",
    padding: "6px 0",
    outline: "none",
    transition: "border-color 0.15s",
  };

  const capLabel = {
    fontFamily: "'Inter',sans-serif",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "#78716c",
    marginBottom: 6,
  };

  const olivBtn = {
    background: "#546200",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    fontFamily: "'Inter',sans-serif",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.06em",
    cursor: "pointer",
  };

  /* JOURNAL */
  const JournalView=(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontFamily:"'Caveat',cursive",fontSize:14,color:"#78716c",marginBottom:2}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
          <div style={{fontFamily:"'Caveat',cursive",fontSize:28,fontWeight:700,color:"#271900"}}>Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, {user.firstName}!</div>
        </div>
        <Sticky color="#fef9c3" rotate="1.2deg" style={{minWidth:160,maxWidth:220}}>
          <div style={{fontSize:12,color:"#78716c",marginBottom:2}}>Weekly Goal</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:26,fontWeight:700,color:"#271900"}}>Stay under $<input type="number" value={weeklyGoal} onChange={e=>setWG(parseFloat(e.target.value)||400)} style={{border:"none",background:"transparent",fontFamily:"'Caveat',cursive",fontSize:26,color:"#271900",width:50,outline:"none",fontWeight:700}}/></div>
          </div>
          <div style={{marginTop:12,fontSize:13,color:"#78716c",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:18}}>☆</span> You're at ${total.toFixed(0)}!</div>
        </Sticky>
      </div>

      <div style={{...notebook,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",left:200,top:0,bottom:0,width:1,background:"rgba(183,31,53,0.25)",zIndex:1}}/>
        {groups.length===0&&<div style={{padding:"48px 24px 48px 220px",fontFamily:"'Caveat',cursive",fontSize:20,color:"#a8997a"}}>No entries yet. Tap ✏️ to add your first expense!</div>}
        {groups.map(([date,items],gi)=>(
          <div key={date}>
            {gi>0&&<TornDivider/>}
            <div style={{display:"flex",alignItems:"flex-start"}}>
              <div style={{width:200,flexShrink:0,padding:"20px 16px 20px 24px",textAlign:"right",fontFamily:"'Inter',sans-serif",color:"#271900"}}>
                <div style={{fontSize:11,color:"#78716c",textTransform:"uppercase",letterSpacing:"0.05em"}}>{date.split(" ")[0]}</div>
                <div style={{fontSize:36,fontWeight:700,lineHeight:1}}>{date.split(" ")[1]}</div>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Caveat',cursive",fontSize:18,color:"#546200",padding:"14px 16px 4px",borderBottom:"1px solid #e8dfc8"}}>{date}</div>
                {items.map(exp=>(
                  <div key={exp.id} style={{borderBottom:"1px solid #ede8d8",opacity:removing===exp.id?0:1,transform:removing===exp.id?"translateX(24px)":"none",transition:"opacity 0.38s,transform 0.38s"}}>
                    <div style={{display:"flex",alignItems:"center",padding:"10px 16px",gap:8}}>
                      <div style={{flex:1,minWidth:0}}>
                        <span style={{fontFamily:"'Manrope',sans-serif",fontSize:15,color:"#271900"}}>{exp.name}</span>
                        <Tag id={exp.category}/>
                      </div>
                      <div style={{fontFamily:"'Manrope',sans-serif",fontSize:15,color:"#b71f35",fontWeight:500,flexShrink:0}}>${exp.amount.toFixed(2)}</div>
                      <button onClick={()=>startEditExp(exp)} style={{background:"none",border:"none",cursor:"pointer",color:"#546200",fontSize:15,lineHeight:1,padding:"2px 4px",borderRadius:4,transition:"color 0.15s"}}
                        onMouseEnter={e=>e.currentTarget.style.color="#414c00"} onMouseLeave={e=>e.currentTarget.style.color="#546200"} aria-label="Edit">✏️</button>
                      <button onClick={()=>removeExp(exp.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#c7c8b4",fontSize:18,lineHeight:1,padding:"0 2px",marginLeft:6,borderRadius:4,transition:"color 0.15s"}}
                        onMouseEnter={e=>e.currentTarget.style.color="#b71f35"} onMouseLeave={e=>e.currentTarget.style.color="#c7c8b4"} aria-label="Delete">×</button>
                    </div>
                    {exp.note&&<div style={{fontFamily:"'Kalam',cursive",fontSize:13,color:"#78716c",padding:"2px 16px 10px",display:"flex",alignItems:"center",gap:6}}><span>✏</span> {exp.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{position:"relative",marginTop:28,display:"flex",justifyContent:"center"}}>
        <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",width:80,height:18,background:"rgba(190,207,102,0.55)",borderRadius:2,zIndex:2}}/>
        <div style={{background:"#fff",border:"1px solid #e8dfc8",borderRadius:4,padding:"24px 32px",maxWidth:480,width:"100%",boxShadow:"0 2px 12px rgba(0,0,0,0.07)"}}>
          <div style={{fontFamily:"'Caveat',cursive",fontSize:24,color:"#546200",textAlign:"center",marginBottom:12}}>Weekly Reflection</div>
          <div style={{fontFamily:"'Caveat',cursive",fontSize:16,color:"#464839",textAlign:"center",lineHeight:1.6,marginBottom:16}}>
            "{topCat?`${topCat.label.charAt(0)+topCat.label.slice(1).toLowerCase()} is your top spend at $${topCat.spent.toFixed(0)}. Consider trimming it next week!`:"No expenses yet — you're doing great!"}"
          </div>
          <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#78716c",textAlign:"center",marginBottom:6}}>Budget Health: {health}%</div>
          <div style={{background:"#e8dfc8",borderRadius:99,height:8,overflow:"hidden"}}>
            <div style={{width:`${health}%`,height:"100%",background:"linear-gradient(90deg,#546200,#81912f)",borderRadius:99,transition:"width 0.6s ease"}}/>
          </div>
        </div>
      </div>
    </div>
  );

  /* BUDGET */
  const BudgetView=(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontFamily:"'Caveat',cursive",fontSize:32,fontWeight:700,color:"#271900"}}>Monthly Budget</div>
          <div style={{fontFamily:"'Kalam',cursive",fontSize:14,color:"#78716c",marginTop:4}}>{new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"})}</div>
        </div>
        {!editBudget&&(
          <button onClick={()=>{setBD(budget.map(c=>({...c})));setEB(true);}} style={{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700,letterSpacing:"0.05em",padding:"8px 18px",background:"transparent",border:"2px solid #546200",color:"#546200",borderRadius:4,cursor:"pointer",transition:"all 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="#546200";e.currentTarget.style.color="#fff";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#546200";}}>✏️ EDIT BUDGET</button>
        )}
      </div>

      {/* Summary strip */}
      <div style={{...notebook,padding:"18px 24px",marginBottom:16,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:16}}>
        {[
          {lbl:"MONTHLY INCOME", val: editBudget
            ? <input type="number" value={income} onChange={e=>setIncome(parseFloat(e.target.value)||0)}
                style={{border:"none",borderBottom:"2px solid #546200",background:"transparent",fontFamily:"'Caveat',cursive",fontSize:24,color:"#271900",width:120,outline:"none",padding:"2px 0"}}/>
            : <span style={{fontFamily:"'Caveat',cursive",fontSize:28,color:"#271900"}}>${income.toLocaleString()}</span>},
          {lbl:"TOTAL BUDGETED",  val:<span style={{fontFamily:"'Caveat',cursive",fontSize:28,color:"#546200"}}>${totBudget.toLocaleString()}</span>},
          {lbl:"SPENT SO FAR",    val:<span style={{fontFamily:"'Caveat',cursive",fontSize:28,color:"#b71f35"}}>${total.toFixed(2)}</span>},
          {lbl:"REMAINING",       val:<span style={{fontFamily:"'Caveat',cursive",fontSize:28,color:income-total>=0?"#2e4a2e":"#b71f35"}}>${(income-total).toFixed(2)}</span>},
        ].map(s=>(
          <div key={s.lbl}>
            <div style={capLabel}>{s.lbl}</div>
            {s.val}
          </div>
        ))}
      </div>

      {/* Category rows */}
      <div style={{...notebook,padding:"24px"}}>
        <div style={{fontFamily:"'Caveat',cursive",fontSize:18,color:"#78716c",marginBottom:20}}>Category allocations</div>
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          {(editBudget?budgetDraft:budget).map((bc,i)=>{
            const c = getCategoryById(bc.id);
            const spent=expenses.filter(e=>e.category===bc.id).reduce((s,e)=>s+e.amount,0);
            const pct=bc.allocated>0?Math.min(100,(spent/bc.allocated)*100):0;
            const over=spent>bc.allocated;
            return (
              <div key={bc.id}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontFamily:"'Caveat',cursive",fontSize:18,color:"#271900"}}>{bc.label}</span>
                    {over&&<span style={{fontFamily:"'Inter',sans-serif",fontSize:10,fontWeight:700,letterSpacing:"0.06em",color:"#b71f35",background:"#ffc8b0",padding:"2px 6px",borderRadius:3}}>OVER</span>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontFamily:"'Manrope',sans-serif",fontSize:13,color:"#78716c"}}>${spent.toFixed(2)} spent</span>
                    {editBudget?(
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <span style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#78716c"}}>of $</span>
                        <input type="number" value={budgetDraft[i].allocated}
                          onChange={e=>{const d=[...budgetDraft];d[i]={...d[i],allocated:e.target.value};setBD(d);}}
                          style={{width:70,border:"none",borderBottom:"2px solid #546200",background:"transparent",fontFamily:"'Manrope',sans-serif",fontSize:14,color:"#271900",outline:"none",padding:"2px 0",textAlign:"right"}}/>
                      </div>
                    ):(
                      <span style={{fontFamily:"'Manrope',sans-serif",fontSize:13,color:"#464839",fontWeight:500}}>of ${bc.allocated.toFixed(0)}</span>
                    )}
                  </div>
                </div>
                <div style={{background:"#e8dfc8",borderRadius:99,height:10,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,height:"100%",background:over?"#b71f35":c.color,borderRadius:99,transition:"width 0.7s ease"}}/>
                </div>
              </div>
            );
          })}
        </div>
        {editBudget&&(
          <div style={{display:"flex",gap:12,marginTop:28}}>
            <button onClick={()=>{setBudget(budgetDraft.map(c=>({...c,allocated:Math.max(0,parseFloat(c.allocated)||0)})));setEB(false);setBD(null);}}
              style={{...olivBtn,flex:1,padding:"13px"}}
              onMouseEnter={e=>e.currentTarget.style.background="#414c00"} onMouseLeave={e=>e.currentTarget.style.background="#546200"}>SAVE BUDGET</button>
            <button onClick={()=>{setEB(false);setBD(null);}}
              style={{flex:1,background:"transparent",color:"#78716c",border:"2px solid #c7c8b4",borderRadius:4,padding:"13px",fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700,letterSpacing:"0.06em",cursor:"pointer"}}>CANCEL</button>
          </div>
        )}
      </div>
    </div>
  );

  /* INSIGHTS */
  const InsightsView=(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontFamily:"'Caveat',cursive",fontSize:36,fontWeight:700,color:"#271900"}}>Monthly Review</div>
          <div style={{fontFamily:"'Manrope',sans-serif",fontSize:14,color:"#78716c",marginTop:4,display:"flex",alignItems:"center",gap:8}}>
            Current Total:
            <span style={{border:"1.5px solid #271900",borderRadius:99,padding:"1px 10px",fontFamily:"'Manrope',sans-serif",fontSize:14,color:"#271900"}}><AnimNum value={total}/></span>
          </div>
        </div>
        <Sticky color="#ffd488" rotate="2deg" style={{fontSize:15,padding:"10px 16px"}}>
          <span style={{fontFamily:"'Caveat',cursive",color:"#271900"}}>{new Date().toLocaleDateString("en-US",{month:"short",year:"2-digit"})}</span>
        </Sticky>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:16,marginBottom:28}}>
        <Sticky color="#fef9c3" rotate="-0.8deg">
          <div style={capLabel}>TOTAL SPENT</div>
          <div style={{fontFamily:"'Caveat',cursive",fontSize:28,color:"#271900",marginBottom:8}}>{sym}<AnimNum value={converted} prefix=""/></div>
          <div style={{fontFamily:"'Caveat',cursive",fontSize:13,color:"#78716c",lineHeight:1.4}}>"{topCat?`Focus on ${topCat.label.toLowerCase()} this month!`:"Great job tracking!"}"</div>
        </Sticky>
        <Sticky color="#ffd488" rotate="1deg">
          <div style={capLabel}>HIGHEST CATEGORY</div>
          <div style={{fontFamily:"'Caveat',cursive",fontSize:22,color:"#271900",marginBottom:4}}>{topCat?topCat.label:"—"}</div>
          <div style={{fontFamily:"'Manrope',sans-serif",fontSize:13,color:"#464839"}}>{topCat?`$${topCat.spent.toFixed(2)} spent`:"No data yet"}</div>
        </Sticky>
        <Sticky color="#c8e6c8" rotate="-1.2deg" style={{background:"#81912f22",border:"1.5px solid #81912f44"}}>
          <div style={capLabel}>BUDGET HEALTH</div>
          <div style={{fontFamily:"'Caveat',cursive",fontSize:28,color:"#271900",marginBottom:4}}>{health}%</div>
          <div style={{fontFamily:"'Caveat',cursive",fontSize:13,color:"#546200"}}>{health>60?"Looking good!":"Watch spending!"}</div>
        </Sticky>
      </div>

      <div style={{...notebook,padding:"24px 28px"}}>
        <div style={{fontFamily:"'Caveat',cursive",fontSize:18,color:"#78716c",marginBottom:20}}>Where it all went...</div>
        {catTotals.filter(c=>c.spent>0).length===0&&<div style={{fontFamily:"'Caveat',cursive",fontSize:18,color:"#a8997a"}}>Add expenses to see breakdown.</div>}
        {catTotals.filter(c=>c.spent>0).map((c,i)=>{
          const pct=total>0?(c.spent/total)*100:0;
          const bars=["#546200","#b71f35","#c9a227","#81912f","#5e5c54","#464839"];
          return (
            <div key={c.id} style={{marginBottom:18}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontFamily:"'Caveat',cursive",fontSize:18,color:"#271900"}}>{c.label.charAt(0)+c.label.slice(1).toLowerCase()}</span>
                <span style={{fontFamily:"'Manrope',sans-serif",fontSize:14,color:"#78716c"}}>${c.spent.toFixed(2)}</span>
              </div>
              <div style={{background:"#e8dfc8",borderRadius:99,height:10,overflow:"hidden"}}>
                <div style={{width:`${pct}%`,height:"100%",background:bars[i%bars.length],borderRadius:99,transition:"width 0.7s ease"}}/>
              </div>
            </div>
          );
        })}

        <div style={{marginTop:28,borderTop:"1px dashed #c7c8b4",paddingTop:20}}>
          <div style={{fontFamily:"'Caveat',cursive",fontSize:18,color:"#78716c",marginBottom:14}}>Convert total</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
            {CURRENCIES.map(c=>(
              <button key={c} onClick={()=>setCur(c)} style={{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700,letterSpacing:"0.05em",padding:"5px 14px",border:currency===c?"2px solid #546200":"1.5px solid #c7c8b4",background:currency===c?"#daec7f":"transparent",color:currency===c?"#546200":"#78716c",borderRadius:3,cursor:"pointer",transition:"all 0.15s"}}>{c}</button>
            ))}
          </div>
          {rateStatus==="loading"&&<div style={{fontFamily:"'Kalam',cursive",fontSize:15,color:"#a8997a"}}>Fetching rates...</div>}
          {rateStatus==="error"&&<div style={{fontFamily:"'Kalam',cursive",fontSize:15,color:"#b71f35"}}>Couldn't fetch exchange rates right now. Try again in a moment.</div>}
          {rateStatus==="idle"&&<div style={{fontFamily:"'Caveat',cursive",fontSize:28,color:"#271900"}}><AnimNum value={converted} prefix={sym}/>{currency!=="USD"&&rates[currency]&&<span style={{fontFamily:"'Kalam',cursive",fontSize:13,color:"#78716c",marginLeft:10}}>1 USD = {rates[currency].toFixed(4)} {currency}</span>}</div>}
        </div>
      </div>
    </div>
  );

  /* VAULT */
  const VaultView=(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontFamily:"'Caveat',cursive",fontSize:32,fontWeight:700,color:"#271900"}}>The Vault</div>
          <div style={{fontFamily:"'Kalam',cursive",fontSize:14,color:"#78716c",marginTop:4}}>Your personal finance library & settings</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:42,height:42,borderRadius:"50%",background:"#daec7f",border:"2px solid #546200",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Caveat',cursive",fontSize:16,fontWeight:700,color:"#546200",flexShrink:0}}>
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div>
            <div style={{fontFamily:"'Caveat',cursive",fontSize:18,color:"#271900"}}>{user.firstName} {user.lastName}</div>
            <button onClick={()=>{setND({...user});setEN(true);}} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'Kalam',cursive",fontSize:12,color:"#546200",padding:0,textDecoration:"underline"}}>edit name</button>
          </div>
        </div>
      </div>

      {editName&&(
        <div style={{...notebook,padding:"20px 24px",marginBottom:20}}>
          <div style={{fontFamily:"'Caveat',cursive",fontSize:20,color:"#271900",marginBottom:14}}>Edit your name</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            {[{lbl:"FIRST NAME",key:"firstName"},{lbl:"LAST NAME",key:"lastName"}].map(f=>(
              <div key={f.key}>
                <div style={capLabel}>{f.lbl}</div>
                <input value={nameDraft[f.key]} onChange={e=>setND(d=>({...d,[f.key]:e.target.value}))}
                  style={{...inpBase,borderBottomColor:"#546200"}}/>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>{if(nameDraft.firstName.trim()&&nameDraft.lastName.trim()){setUser(nameDraft);setEN(false);}}} style={{...olivBtn,padding:"10px 20px"}}
              onMouseEnter={e=>e.currentTarget.style.background="#414c00"} onMouseLeave={e=>e.currentTarget.style.background="#546200"}>SAVE</button>
            <button onClick={()=>setEN(false)} style={{background:"transparent",color:"#78716c",border:"1.5px solid #c7c8b4",borderRadius:4,padding:"10px 20px",fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700,letterSpacing:"0.06em",cursor:"pointer"}}>CANCEL</button>
          </div>
        </div>
      )}

      {/* Stats strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10,marginBottom:24}}>
        {[
          {lbl:"TOTAL ENTRIES",  v:expenses.length},
          {lbl:"TOTAL SPENT",    v:`$${total.toFixed(0)}`},
          {lbl:"CATEGORIES",     v:[...new Set(expenses.map(e=>e.category))].length},
          {lbl:"BUDGET HEALTH",  v:`${health}%`},
        ].map(s=>(
          <div key={s.lbl} style={{...notebook,padding:"14px 16px"}}>
            <div style={capLabel}>{s.lbl}</div>
            <div style={{fontFamily:"'Caveat',cursive",fontSize:24,color:"#271900"}}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Docs */}
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
        {VAULT_DOCS.map(doc=>(
          <div key={doc.id} style={{...notebook,overflow:"hidden"}}>
            <button onClick={()=>setED(expandedDoc===doc.id?null:doc.id)} style={{width:"100%",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:12,padding:"16px 20px",textAlign:"left"}}>
              <span style={{fontSize:22,flexShrink:0}}>{doc.icon}</span>
              <div style={{flex:1,fontFamily:"'Caveat',cursive",fontSize:18,color:"#271900"}}>{doc.title}</div>
              <span style={{fontFamily:"'Inter',sans-serif",fontSize:10,fontWeight:700,letterSpacing:"0.06em",padding:"3px 8px",borderRadius:3,background:doc.tagB,color:doc.tagC,flexShrink:0}}>{doc.tag}</span>
              <span style={{fontSize:16,color:"#78716c",transform:expandedDoc===doc.id?"rotate(180deg)":"none",transition:"transform 0.2s",flexShrink:0}}>▾</span>
            </button>
            {expandedDoc===doc.id&&(
              <div style={{padding:"0 20px 18px 54px",borderTop:"1px dashed #e8dfc8"}}>
                <div style={{fontFamily:"'Kalam',cursive",fontSize:15,color:"#464839",lineHeight:1.7,paddingTop:12}}>{doc.body}</div>
                {doc.id==="export"&&(
                  <button onClick={exportCSV} style={{marginTop:14,background:"transparent",border:"2px solid #546200",color:"#546200",borderRadius:4,padding:"9px 20px",fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700,letterSpacing:"0.06em",cursor:"pointer"}}
                    onMouseEnter={e=>{e.currentTarget.style.background="#546200";e.currentTarget.style.color="#fff";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#546200";}}>↓ DOWNLOAD CSV</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Logout */}
      <div style={{...notebook,padding:"20px 24px",marginBottom:16}}>
        <button onClick={handleLogout} style={{width:"100%",background:"#546200",color:"#fff",border:"none",borderRadius:4,padding:"12px",fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700,letterSpacing:"0.06em",cursor:"pointer"}}
          onMouseEnter={e=>e.currentTarget.style.background="#414c00"} onMouseLeave={e=>e.currentTarget.style.background="#546200"}>LOGOUT</button>
      </div>

      {/* Danger zone */}
      <div style={{border:"1.5px dashed #ffc8b0",borderRadius:4,padding:"20px 24px",background:"rgba(183,31,53,0.03)"}}>
        <div style={{fontFamily:"'Caveat',cursive",fontSize:18,color:"#b71f35",marginBottom:6}}>Reset data</div>
        <div style={{fontFamily:"'Kalam',cursive",fontSize:14,color:"#78716c",marginBottom:14,lineHeight:1.5}}>Permanently delete all expenses, budget settings, and your name. This cannot be undone.</div>
        <button onClick={()=>{if(window.confirm("Reset everything? All your data will be permanently erased.")){localStorage.clear();setExp(SEED);setBudget(DEFAULT_BUDGET);setIncome(3500);setUser(null);}}}
          style={{background:"transparent",border:"2px solid #b71f35",color:"#b71f35",borderRadius:4,padding:"9px 18px",fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700,letterSpacing:"0.06em",cursor:"pointer"}}
          onMouseEnter={e=>{e.currentTarget.style.background="#b71f35";e.currentTarget.style.color="#fff";}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#b71f35";}}>RESET EVERYTHING</button>
      </div>
    </div>
  );

  /* ── ADD FORM MODAL ── */
  const FormModal = showForm&&(
    <div style={{position:"fixed",inset:0,background:"rgba(39,25,0,0.35)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowForm(false)}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fffdf8",borderRadius:"12px 12px 0 0",padding:"28px 24px 32px",width:"100%",maxWidth:560,border:"1px solid #e8dfc8",borderBottom:"none",boxShadow:"0 -4px 32px rgba(0,0,0,0.12)"}}>
        <div style={{width:64,height:14,background:"rgba(190,207,102,0.6)",borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{fontFamily:"'Caveat',cursive",fontSize:26,color:"#271900",marginBottom:20}}>New Entry</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <div style={capLabel}>WHAT DID YOU SPEND ON?</div>
            <input value={form.name} onChange={e=>{setForm(f=>({...f,name:e.target.value}));setErrors(er=>({...er,name:false}));}} placeholder="e.g. Morning coffee" autoFocus
              style={{...inpBase,borderBottomColor:errors.name?"#b71f35":"#c7c8b4"}}
              onFocus={e=>e.target.style.borderBottomColor="#546200"} onBlur={e=>e.target.style.borderBottomColor=errors.name?"#b71f35":"#c7c8b4"}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div>
              <div style={capLabel}>AMOUNT ($)</div>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={e=>{setForm(f=>({...f,amount:e.target.value}));setErrors(er=>({...er,amount:false}));}} placeholder="0.00"
                style={{...inpBase,borderBottomColor:errors.amount?"#b71f35":"#c7c8b4"}}
                onFocus={e=>e.target.style.borderBottomColor="#546200"} onBlur={e=>e.target.style.borderBottomColor=errors.amount?"#b71f35":"#c7c8b4"}/>
            </div>
            <div>
              <div style={capLabel}>CATEGORY</div>
              <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={{...inpBase,cursor:"pointer"}}>
                {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div style={capLabel}>NOTE (OPTIONAL)</div>
            <input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Any thoughts..."
              style={{...inpBase,fontFamily:"'Kalam',cursive",fontSize:15}}
              onFocus={e=>e.target.style.borderBottomColor="#546200"} onBlur={e=>e.target.style.borderBottomColor="#c7c8b4"}
              onKeyDown={e=>e.key==="Enter"&&addExpense()}/>
          </div>
          <button onClick={addExpense} style={{...olivBtn,marginTop:6,padding:"13px"}}
            onMouseEnter={e=>e.currentTarget.style.background="#414c00"} onMouseLeave={e=>e.currentTarget.style.background="#546200"}>ADD ENTRY</button>
        </div>
      </div>
    </div>
  );

  const EditExpenseModal = editingExpId!==null&&(
    <div style={{position:"fixed",inset:0,background:"rgba(39,25,0,0.35)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setEE(null)}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fffdf8",borderRadius:"12px 12px 0 0",padding:"28px 24px 32px",width:"100%",maxWidth:560,border:"1px solid #e8dfc8",borderBottom:"none",boxShadow:"0 -4px 32px rgba(0,0,0,0.12)"}}>
        <div style={{width:64,height:14,background:"rgba(190,207,102,0.6)",borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{fontFamily:"'Caveat',cursive",fontSize:26,color:"#271900",marginBottom:20}}>Edit Entry</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <div style={capLabel}>WHAT DID YOU SPEND ON?</div>
            <input value={editingExpForm.name} onChange={e=>{setEF(f=>({...f,name:e.target.value}));setErrors(er=>({...er,name:false}));}} placeholder="e.g. Morning coffee" autoFocus
              style={{...inpBase,borderBottomColor:errors.name?"#b71f35":"#c7c8b4"}}
              onFocus={e=>e.target.style.borderBottomColor="#546200"} onBlur={e=>e.target.style.borderBottomColor=errors.name?"#b71f35":"#c7c8b4"}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div>
              <div style={capLabel}>AMOUNT ($)</div>
              <input type="number" min="0" step="0.01" value={editingExpForm.amount} onChange={e=>{setEF(f=>({...f,amount:e.target.value}));setErrors(er=>({...er,amount:false}));}} placeholder="0.00"
                style={{...inpBase,borderBottomColor:errors.amount?"#b71f35":"#c7c8b4"}}
                onFocus={e=>e.target.style.borderBottomColor="#546200"} onBlur={e=>e.target.style.borderBottomColor=errors.amount?"#b71f35":"#c7c8b4"}/>
            </div>
            <div>
              <div style={capLabel}>CATEGORY</div>
              <select value={editingExpForm.category} onChange={e=>setEF(f=>({...f,category:e.target.value}))} style={{...inpBase,cursor:"pointer"}}>
                {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div style={capLabel}>NOTE (OPTIONAL)</div>
            <input value={editingExpForm.note} onChange={e=>setEF(f=>({...f,note:e.target.value}))} placeholder="Any thoughts..."
              style={{...inpBase,fontFamily:"'Kalam',cursive",fontSize:15}}
              onFocus={e=>e.target.style.borderBottomColor="#546200"} onBlur={e=>e.target.style.borderBottomColor="#c7c8b4"}
              onKeyDown={e=>e.key==="Enter"&&saveEditExp()}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={saveEditExp} style={{...olivBtn,marginTop:6,padding:"13px",flex:1}}
              onMouseEnter={e=>e.currentTarget.style.background="#414c00"} onMouseLeave={e=>e.currentTarget.style.background="#546200"}>SAVE ENTRY</button>
            <button onClick={()=>setEE(null)} style={{marginTop:6,background:"transparent",color:"#78716c",border:"2px solid #c7c8b4",borderRadius:4,flex:1,padding:"13px",fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700,letterSpacing:"0.06em",cursor:"pointer"}}>CANCEL</button>
          </div>
        </div>
      </div>
    </div>
  );

  /* SHELL */
  return (
    <div style={{minHeight:"100vh",background:"#f0ebe0",fontFamily:"'Manrope',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Kalam:wght@300;400&family=Manrope:wght@300;400;500;600&family=Inter:wght@400;500;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#c7c8b4;border-radius:99px;}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
      `}</style>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:"radial-gradient(circle,#c7c8b4 1px,transparent 1px)",backgroundSize:"24px 24px",opacity:0.45}}/>

      <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(240,235,224,0.92)",backdropFilter:"blur(8px)",borderBottom:"1px dashed #c7c8b4",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18}}>📒</span>
          <span style={{fontFamily:"'Caveat',cursive",fontSize:22,fontWeight:700,color:"#271900"}}>PocketLedger</span>
        </div>
        <div style={{fontFamily:"'Kalam',cursive",fontSize:13,color:"#78716c"}}>{user.firstName} {user.lastName}</div>
      </div>

      <div style={{maxWidth:820,margin:"0 auto",padding:"28px 20px 100px",position:"relative",zIndex:1}}>
        {tab==="journal"  && JournalView}
        {tab==="budget"   && BudgetView}
        {tab==="insights" && InsightsView}
        {tab==="vault"    && VaultView}
      </div>

      <button onClick={()=>setShowForm(true)} style={{position:"fixed",bottom:80,right:20,zIndex:50,width:52,height:52,borderRadius:12,background:"#546200",border:"none",color:"#fff",fontSize:22,cursor:"pointer",boxShadow:"0 4px 16px rgba(84,98,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.15s,box-shadow 0.15s"}}
        onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.07)";e.currentTarget.style.boxShadow="0 6px 24px rgba(84,98,0,0.45)";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 16px rgba(84,98,0,0.35)";}}
        aria-label="Add expense">✏️</button>

      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,background:"rgba(240,235,224,0.97)",backdropFilter:"blur(8px)",borderTop:"1px dashed #c7c8b4",display:"flex",justifyContent:"space-around",alignItems:"center",padding:"8px 0 12px"}}>
        {[{id:"journal",label:"Journal",icon:"📋"},{id:"budget",label:"Budget",icon:"📊"},{id:"insights",label:"Insights",icon:"📈"},{id:"vault",label:"Vault",icon:"🗂️"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:tab===t.id?"#daec7f":"transparent",border:tab===t.id?"1.5px solid #546200":"1.5px solid transparent",borderRadius:10,padding:"6px 18px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",transition:"all 0.15s"}}>
            <span style={{fontSize:18,lineHeight:1}}>{t.icon}</span>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.04em",color:tab===t.id?"#546200":"#78716c"}}>{t.label}</span>
          </button>
        ))}
      </div>

      {FormModal}
      {EditExpenseModal}
    </div>
  );
}