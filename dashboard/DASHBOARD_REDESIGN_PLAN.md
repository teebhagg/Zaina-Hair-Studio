# Dashboard Redesign Implementation Plan

## Goal
Redesign the salon dashboard to match the shadcn-admin design:
- Reference: https://shadcn-admin.netlify.app/
- Users page reference: https://shadcn-admin.netlify.app/users

## Components to Build

### 1. Layout Components
- [ ] Sidebar with collapsible navigation
- [ ] Top AppBar with breadcrumbs and user menu
- [ ] Main layout wrapper

### 2. Dashboard Pages
- [ ] Overview/Dashboard (with charts)
  - Revenue chart
  - Appointments chart
  - Reviews stats
  - Quick stats cards
- [ ] Reviews Management
  - Data table with sorting/filtering
  - Status badges
  - Actions (approve/delete)
- [ ] Appointments Management
  - Data table with sorting/filtering
  - Status badges (pending/confirmed/completed/cancelled)
  - Actions (confirm/cancel/complete)

### 3. UI Components Needed
- [x] Collapsible (installed)
- [ ] Card
- [ ] Badge
- [ ] Avatar
- [ ] Breadcrumb
- [ ] Data Table (with TanStack Table)
- [ ] Charts (using Recharts)
- [ ] Dropdown Menu
- [ ] Dialog

## Design Specifications

### Sidebar
- Width: 240px (expanded), 60px (collapsed)
- Dark background
- Logo at top
- Navigation items with icons
- Collapsible sub-menus
- User profile at bottom

### AppBar
- Height: 64px
- Breadcrumb navigation
- Search bar (optional)
- Notifications icon
- User avatar with dropdown

### Data Tables
- Sortable columns
- Row selection
- Pagination
- Search/filter
- Actions column
- Status badges

### Charts
- Line chart for revenue
- Bar chart for appointments
- Area chart for reviews
- Responsive design

## File Structure
```
dashboard/
├── app/
│   └── dashboard/
│       ├── layout.tsx (new sidebar + appbar layout)
│       ├── page.tsx (overview with charts)
│       ├── reviews/
│       │   └── page.tsx (reviews table)
│       └── appointments/
│           └── page.tsx (appointments table)
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── app-bar.tsx
│   │   ├── nav.tsx (done)
│   │   └── user-nav.tsx
│   ├── dashboard/
│   │   ├── stats-cards.tsx
│   │   ├── revenue-chart.tsx
│   │   ├── appointments-chart.tsx
│   │   └── recent-reviews.tsx
│   ├── reviews/
│   │   ├── reviews-table.tsx
│   │   └── columns.tsx
│   └── appointments/
│       ├── appointments-table.tsx
│       └── columns.tsx
└── lib/
    └── data/ (mock data for development)
```

## Implementation Steps

### Phase 1: Core Layout (Priority 1)
1. Install required shadcn components
2. Create Sidebar component
3. Create AppBar component
4. Update dashboard layout

### Phase 2: Dashboard Overview (Priority 2)
1. Create stats cards
2. Add revenue chart
3. Add appointments chart
4. Add recent reviews widget

### Phase 3: Reviews Page (Priority 3)
1. Create reviews data table
2. Add sorting/filtering
3. Add status badges
4. Add action buttons

### Phase 4: Appointments Page (Priority 4)
1. Create appointments data table
2. Add sorting/filtering
3. Add status badges
4. Add action buttons (confirm/cancel/complete)

## Color Scheme (matching shadcn-admin)
- Background: hsl(0 0% 100%)
- Foreground: hsl(240 10% 3.9%)
- Card: hsl(0 0% 100%)
- Primary: hsl(240 5.9% 10%)
- Secondary: hsl(240 4.8% 95.9%)
- Muted: hsl(240 4.8% 95.9%)
- Accent: hsl(240 4.8% 95.9%)
- Border: hsl(240 5.9% 90%)

## Next Steps
1. Install remaining shadcn components
2. Build sidebar component
3. Build app bar component
4. Create dashboard layout
5. Build overview page with charts
6. Build reviews table
7. Build appointments table
