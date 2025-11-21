# LeetTrack Design Guidelines

## Design Approach

**Selected Approach:** Design System - Modern Developer Dashboard  
**Primary References:** Linear (clean layouts), GitHub (developer familiarity), Vercel (modern aesthetic)  
**Rationale:** LeetTrack is a data-heavy analytics platform requiring clear information hierarchy, efficient data visualization, and professional interface suited for developers.

---

## Typography System

**Font Stack:**
- Primary: Inter (via Google Fonts CDN)
- Monospace: JetBrains Mono (for stats, numbers, rankings)

**Hierarchy:**
- Page Titles: text-4xl font-bold (admin sections), text-3xl font-bold (student sections)
- Section Headers: text-2xl font-semibold
- Card Titles: text-lg font-semibold
- Body Text: text-base font-normal
- Stats/Numbers: text-3xl md:text-4xl font-bold font-mono
- Labels/Metadata: text-sm font-medium
- Captions: text-xs font-normal

---

## Layout & Spacing System

**Spacing Units:** Consistent use of 4, 6, 8, 12, 16, 24, 32  
**Common Patterns:**
- Card padding: p-6 md:p-8
- Section spacing: space-y-8 md:space-y-12
- Grid gaps: gap-6 md:gap-8
- Container max-width: max-w-7xl mx-auto px-4 md:px-6

**Dashboard Structure:**
- Sidebar navigation: Fixed left, w-64, with logo at top
- Main content area: Scrollable, full height minus header
- Cards: Rounded corners (rounded-xl), subtle elevation via shadow

---

## Component Library

### Navigation
**Sidebar (Admin & Student):**
- Fixed position, full height
- Logo/branding at top (mb-8)
- Navigation items with icons (Heroicons via CDN)
- Active state: Distinct visual treatment
- Collapsed state on mobile (hamburger menu)

**Top Bar:**
- User profile dropdown (right aligned)
- Notifications icon (for future use)
- Breadcrumb navigation for admin deep pages

### Dashboard Cards

**Stat Cards (Student Dashboard):**
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Each card displays: Icon, Label, Large number, Optional trend indicator
- Variant cards for: Total Solved, Easy/Medium/Hard, Contest Rating
- Consistent card structure with icon-left, stats-right layout

**Chart Cards:**
- Weekly Progress: Bar chart (7 days)
- Difficulty Distribution: Donut/Pie chart
- Monthly Trend: Line chart
- Use Chart.js or Recharts library
- Legend always visible below chart
- Responsive height: h-64 md:h-80

### Tables

**Students List (Admin):**
- Full-width responsive table
- Columns: Avatar, Name, Email, Department, Total Solved, Weekly Progress, Actions
- Sortable headers (arrow indicators)
- Hover row highlight
- Action buttons: View Details (primary), Edit (secondary)
- Mobile: Stack as cards on small screens

**Rankings Table:**
- Columns: Rank (#), Avatar, Name, Total Solved, Contest Rating, Department, Batch
- Top 3 ranks: Special visual treatment (larger, distinct styling)
- Zebra striping for readability
- Fixed header on scroll

### Forms

**Login/Register:**
- Centered card layout, max-w-md
- Input fields: Full width, consistent spacing (space-y-4)
- Labels above inputs
- Error states: Red border + message below field
- Primary action button: Full width, prominent

**Create Batch Form:**
- Two-column grid on desktop, single column mobile
- Input groups: Label, Input/Select, Helper text
- Student selection: Searchable multi-select with chips
- Preview section showing selected students

### Buttons & Actions
- Primary: Solid background, medium size (px-4 py-2)
- Secondary: Outlined style
- Danger: For remove/delete actions
- Icon buttons: Square, p-2, for quick actions
- Loading state: Spinner + disabled

### Progress Indicators
- Weekly progress: Mini bar chart or progress bar
- Loading states: Skeleton screens for cards/tables
- Empty states: Centered icon + message + CTA

---

## Page-Specific Layouts

### Student Dashboard
- Hero section: Welcome message + quick stats (h-auto, not forced viewport)
- Stats grid: 4 stat cards
- Charts section: 2-column grid (Weekly + Difficulty)
- Recent submissions: Table or timeline
- Spacing: Sections separated by py-12

### Admin Dashboard
- Overview stats: 3-4 key metrics at top
- Quick actions: Row of action buttons
- Students table: Full-width, below stats
- Batch performance: Side-by-side comparison cards
- Compact layout maximizing data density

### Rankings Page
- Leaderboard table: Full width
- Filter bar: Department/Batch dropdowns + search
- Top 3 podium: Visual highlight at top (optional creative element)

### Batch Details
- Batch info header: Name, date range, student count
- Performance summary: Avg solved, top performer, charts
- Student list: Table with batch-specific stats
- Two-column layout: Left (stats), Right (student list) on desktop

---

## Images

**Placeholder Requirements:**
- User avatars: Initials-based or default avatar icon (40x40px for tables, 64x64px for profiles)
- Dashboard illustrations: Abstract graphics for empty states (max 300x300px)
- No hero images needed - this is a utility dashboard application

**Icon Library:** Heroicons (via CDN) - use outline style for nav, solid for stats

---

## Accessibility & Responsiveness

- All interactive elements: Clear focus states
- Form inputs: Proper label associations, aria-labels
- Tables: Responsive transformation to cards on mobile (<768px)
- Sidebar: Collapsible to icon-only on tablet, full hamburger on mobile
- Touch targets: Minimum 44x44px on mobile
- Consistent tab order throughout application

---

## Key Principles

1. **Data First:** Maximize information density without clutter
2. **Scan-ability:** Clear visual hierarchy using typography scale
3. **Developer Aesthetic:** Clean, minimal, professional
4. **Responsive Grids:** Mobile-first, progressive enhancement
5. **Consistent Spacing:** Strict adherence to 4, 6, 8, 12, 16, 24, 32 scale
6. **Performance:** Minimal animations, fast data loading with skeletons