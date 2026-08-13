/* ── Somae mock data — powers the UI showcase ───────────────── */

export const user = {
  name: "Revanth",
  fullName: "Revanth Reynold",
  email: "revanth@somae.ai",
  initials: "RR",
};

export const kpis = [
  {
    label: "Content Created",
    value: "48",
    delta: "+24% this week",
    tone: "blue" as const,
    series: [12, 18, 14, 22, 19, 28, 24, 32, 30, 38, 36, 48],
  },
  {
    label: "Total Reach",
    value: "128K",
    delta: "+18% this week",
    tone: "violet" as const,
    series: [40, 52, 46, 60, 55, 74, 68, 90, 84, 104, 112, 128],
  },
  {
    label: "Engagement",
    value: "6.7K",
    delta: "+32% this week",
    tone: "green" as const,
    series: [2.1, 2.8, 2.4, 3.4, 3.0, 4.1, 3.8, 4.9, 4.4, 5.6, 6.0, 6.7],
  },
  {
    label: "AI Suggestions",
    value: "32",
    delta: "+8 new ideas",
    tone: "amber" as const,
    series: [4, 7, 5, 9, 8, 12, 10, 16, 14, 22, 26, 32],
  },
];

export type UpcomingContent = {
  platform: "instagram" | "linkedin" | "email" | "blog" | "ads" | "video";
  platformLabel: string;
  date: string;
  title: string;
  status: "Scheduled" | "Draft";
  art: string; // css gradient class
};

export const upcomingContent: UpcomingContent[] = [
  {
    platform: "instagram",
    platformLabel: "Instagram Post",
    date: "May 21, 2024 · 10:00 AM",
    title: "Behind the scenes",
    status: "Scheduled",
    art: "from-[#ffd9c0] via-[#ffb4a2] to-[#e5989b]",
  },
  {
    platform: "linkedin",
    platformLabel: "LinkedIn Article",
    date: "May 22, 2024 · 09:00 AM",
    title: "5 ways AI is changing…",
    status: "Draft",
    art: "from-[#bcd7ff] via-[#8db9ff] to-[#4a8dff]",
  },
  {
    platform: "email",
    platformLabel: "Email Campaign",
    date: "May 23, 2024 · 08:00 AM",
    title: "Productivity tips",
    status: "Scheduled",
    art: "from-[#d9e8ff] via-[#a8c6fa] to-[#7fb3ff]",
  },
];

export const assistantSuggestions = [
  { icon: "instagram", label: "Create Instagram post ideas" },
  { icon: "blog", label: "Write a blog on AI trends" },
  { icon: "image", label: "Generate product images" },
  { icon: "calendar", label: "Plan next week's content" },
  { icon: "chart", label: "Analyze competitors" },
];

export const trustedBrands = [
  { name: "LUNEXT", sub: "" },
  { name: "KAIROS", sub: "KITCHEN" },
  { name: "pure", sub: "stories" },
  { name: "WE TONE", sub: "STUDIOS" },
  { name: "santhwana", sub: "HOPE ACADEMY" },
  { name: "espior", sub: "eternal" },
];

export type CalendarEvent = {
  day: number; // 0 = Mon … 6 = Sun
  start: string;
  title: string;
  kind: "instagram" | "linkedin" | "email" | "blog" | "ads";
  color: string;
  bg: string;
  row: number; // grid row position
};

export const calendarWeek = {
  month: "May 2024",
  days: [
    { label: "Mon", date: 20 },
    { label: "Tue", date: 21 },
    { label: "Wed", date: 22 },
    { label: "Thu", date: 23 },
    { label: "Fri", date: 24 },
    { label: "Sat", date: 25 },
    { label: "Sun", date: 26 },
  ],
  hours: ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM"],
};

export const calendarEvents: CalendarEvent[] = [
  {
    day: 0,
    start: "10:00 AM",
    title: "Instagram Post",
    kind: "instagram",
    color: "#c2185b",
    bg: "#ffe4ef",
    row: 2,
  },
  {
    day: 1,
    start: "9:00 AM",
    title: "LinkedIn Article",
    kind: "linkedin",
    color: "#1d4ed8",
    bg: "#e0ecff",
    row: 1,
  },
  {
    day: 2,
    start: "8:00 AM",
    title: "Email Campaign",
    kind: "email",
    color: "#047857",
    bg: "#dcf5e9",
    row: 1,
  },
  {
    day: 3,
    start: "12:00 PM",
    title: "Blog Post",
    kind: "blog",
    color: "#7c3aed",
    bg: "#efe6ff",
    row: 3,
  },
  {
    day: 1,
    start: "1:00 PM",
    title: "Ad Campaign",
    kind: "ads",
    color: "#b45309",
    bg: "#ffedd5",
    row: 4,
  },
];

export const analyticsSeries = {
  labels: ["May 14", "May 15", "May 16", "May 17", "May 18", "May 19", "May 20"],
  reach: [22, 30, 26, 38, 31, 40, 35],
  engagement: [12, 16, 14, 20, 17, 22, 19],
};

export const analyticsKpis = [
  { label: "Total Reach", value: "345K", delta: "+18%" },
  { label: "Engagement", value: "24.6K", delta: "+22%" },
  { label: "Profile Visits", value: "12.4K", delta: "+21%" },
  { label: "Clicks", value: "8.7K", delta: "+16%" },
];

export const brandDna = [
  {
    key: "mission",
    title: "Mission",
    body: "To empower businesses with AI-driven content that connects and converts.",
  },
  {
    key: "vision",
    title: "Vision",
    body: "A world where every brand tells its story beautifully and consistently.",
  },
  {
    key: "audience",
    title: "Audience",
    body: "Ambitious founders, marketing leads and creative teams at growing companies who value craft and clarity.",
  },
  {
    key: "tone",
    title: "Tone of Voice",
    body: "Confident, warm and precise. We speak like a trusted creative partner — never robotic, never salesy.",
  },
  {
    key: "pillars",
    title: "Content Pillars",
    body: "Education · Behind the scenes · Product craft · Customer stories · Industry perspective",
  },
  {
    key: "competitors",
    title: "Competitors",
    body: "Jasper, Copy.ai, Canva Magic Studio — differentiated by deep brand understanding and taste.",
  },
];

export const brandColors = [
  { name: "Royal Blue", hex: "#2B5CE6" },
  { name: "Azure Blue", hex: "#3E8BFF" },
  { name: "Sky Blue", hex: "#7FB3FF" },
  { name: "Soft White", hex: "#F5F9FF" },
  { name: "AI Accent", hex: "#B6F500" },
];

export const brandAssets = [
  { name: "Primary Logo", type: "SVG · PNG", tone: "from-[#2b5ce6] to-[#4a8dff]", glyph: "æ" },
  { name: "Wordmark", type: "SVG", tone: "from-[#101c3d] to-[#3d4c6d]", glyph: "somae" },
  { name: "Icon Mark", type: "PNG · 1024px", tone: "from-[#7fb3ff] to-[#bcd7ff]", glyph: "æ" },
  { name: "Brand Guidelines", type: "PDF · 42 pages", tone: "from-[#eef4ff] to-[#dce9ff]", glyph: "Aa" },
  { name: "Social Kit", type: "Figma", tone: "from-[#ffe4ef] to-[#ffd9c0]", glyph: "▦" },
  { name: "Email Templates", type: "HTML", tone: "from-[#dcf5e9] to-[#c0ebd6]", glyph: "✉" },
];

export const aiImages = [
  { title: "Product hero — sky", tone: "from-[#8db9ff] via-[#bcd7ff] to-[#eaf3ff]" },
  { title: "Abstract waves", tone: "from-[#2b5ce6] via-[#4a8dff] to-[#7fb3ff]" },
  { title: "Studio minimal", tone: "from-[#ffd9c0] via-[#ffb4a2] to-[#e5989b]" },
  { title: "Gradient field", tone: "from-[#a8c6fa] via-[#7fb3ff] to-[#3e8bff]" },
  { title: "Neon dusk", tone: "from-[#312e81] via-[#4a4ad8] to-[#7fb3ff]" },
  { title: "Soft bloom", tone: "from-[#ffe4ef] via-[#ffd1e3] to-[#ffb4d1]" },
  { title: "Monolith", tone: "from-[#101c3d] via-[#2b3a6b] to-[#4a8dff]" },
  { title: "Morning mist", tone: "from-[#eaf3ff] via-[#d6e7ff] to-[#a8c6fa]" },
];

export const campaigns = [
  {
    name: "Summer Launch",
    status: "Active",
    channels: ["Instagram", "LinkedIn"],
    posts: 14,
    reach: "86K",
    engagement: "9.2%",
  },
  {
    name: "AI Trends Series",
    status: "Active",
    channels: ["Blog", "Email"],
    posts: 8,
    reach: "42K",
    engagement: "7.8%",
  },
  {
    name: "Founder Stories",
    status: "Scheduled",
    channels: ["LinkedIn", "Video"],
    posts: 6,
    reach: "—",
    engagement: "—",
  },
  {
    name: "Product Hunt Push",
    status: "Draft",
    channels: ["Social", "Email"],
    posts: 11,
    reach: "—",
    engagement: "—",
  },
  {
    name: "Spring Recap",
    status: "Completed",
    channels: ["Instagram"],
    posts: 9,
    reach: "63K",
    engagement: "8.4%",
  },
];

export const contentTypes = [
  { key: "instagram", label: "Instagram Post", color: "#e1306c", bg: "#ffe4ef" },
  { key: "linkedin", label: "LinkedIn Article", color: "#0a66c2", bg: "#e0ecff" },
  { key: "blog", label: "Blog Post", color: "#7c3aed", bg: "#efe6ff" },
  { key: "email", label: "Email Campaign", color: "#047857", bg: "#dcf5e9" },
  { key: "facebook", label: "Facebook Post", color: "#1877f2", bg: "#e3effe" },
  { key: "ads", label: "Ad Copy", color: "#b45309", bg: "#ffedd5" },
  { key: "script", label: "Video Script", color: "#dc2626", bg: "#fee2e2" },
  { key: "image", label: "AI Image", color: "#2b5ce6", bg: "#e0ecff" },
];
