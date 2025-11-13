# PeopleCore UI - AI Coding Agent Instructions

## Project Overview
PeopleCore is a Next.js 16 (App Router) employee management and chat application using React 19, TypeScript, Tailwind CSS v4, and shadcn/ui components. The app supports authentication, employee management, real-time chat, and user profiles with dark mode.

## Architecture & Structure

### Route Groups (App Router)
- `(auth)/` - Unauthenticated routes (login, register) with centered gradient layout
- `(dashboard)/` - Protected routes with sidebar navigation (chat, profile, settings)
- Route groups provide layout isolation without affecting URL structure

### Component Organization
```
components/
├── ui/          # shadcn/ui primitives (Button, Card, Dialog, etc.)
├── layout/      # Sidebar, Header for dashboard layout
├── auth/        # Login/Register forms
├── chat/        # Chat UI components
└── employees/   # Employee management components
```

### State Management & Data Flow
- **No global state library** - Use React hooks (`useState`, `useEffect`) for local state
- **Custom hooks in `hooks/`** - `use-auth.ts`, `use-chat.ts`, `use-employees.ts` (currently empty, to be implemented)
- **API calls** - Centralize in `lib/api.ts` (currently empty, to be implemented)
- **WebSocket** - Real-time chat via `lib/socket.ts` (stub for future Socket.io integration)
- **Auth pattern** - Token stored in `localStorage`, checked in dashboard layout

### TypeScript Types
All data models defined in `lib/types.ts`:
- `User`, `Employee`, `Message`, `Chat`
- Form data interfaces: `LoginData`, `RegisterData`, `EmployeeFormData`
- Always import types from this central location

## Tech Stack Specifics

### Tailwind CSS v4 + shadcn/ui (New York Style)
- **Import pattern**: `@import "tailwindcss"` in `globals.css` (v4 syntax, no config file)
- **Design tokens**: Uses CSS custom properties (`--color-*`, `--radius-*`) with `@theme inline`
- **Base color**: `zinc` - All UI components use zinc color scale
- **Dark mode**: Class-based (`.dark` ancestor selector) with `@custom-variant`
- **Component styling**: Use `cn()` utility from `lib/utils.ts` to merge Tailwind classes
- **shadcn config**: `components.json` defines aliases - use `@/components/ui/*` for primitives

### Next.js 16 Patterns
- **App Router only** - No pages directory
- **Client components** - Use `"use client"` for interactivity (e.g., `layout.tsx` in dashboard)
- **Path alias**: `@/*` maps to project root - use `@/components`, `@/lib`, `@/hooks`
- **Fonts**: Geist Sans & Geist Mono loaded via `next/font/google` in root layout
- **Toast notifications**: `react-hot-toast` with `<Toaster position="top-center" />` in root layout

### UI Component Patterns
- **Button variants**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- **Icons**: Use `lucide-react` - examples: `MessageSquare`, `User`, `Settings`, `LogOut`
- **Responsive nav**: Sidebar shows icons on mobile (`w-20`), expands to full width on desktop (`sm:w-64`)
- **Active state**: Check `usePathname()` to highlight current route in sidebar

## Development Workflow

### Commands
```bash
npm run dev    # Start dev server on localhost:3000
npm run build  # Production build
npm run lint   # ESLint check (Next.js config with TypeScript support)
```

### Adding shadcn/ui Components
```bash
npx shadcn@latest add <component-name>
```
Components auto-install to `components/ui/` with proper styling.

### File Creation Guidelines
- **New pages**: Add to `app/` with appropriate route group
- **New components**: Place in `components/<category>/` (not `ui/` - reserved for shadcn)
- **Hooks**: Add to `hooks/` directory
- **Types**: Extend interfaces in `lib/types.ts`
- **API functions**: Implement in `lib/api.ts` with proper error handling

## Code Conventions

### Styling Patterns
```tsx
// Use cn() to merge conditional classes
<div className={cn(
  "base-classes",
  condition && "conditional-classes"
)}>
```

### Client-Side Navigation
```tsx
// Always use Next.js router, never <a> tags
import { useRouter, usePathname } from "next/navigation";
const router = useRouter();
router.push("/path");
```

### Layout Structure
- Dashboard layout wraps protected routes with `<Sidebar />` and `<Header />`
- Auth layout centers content with gradient background
- Root layout includes global styles, fonts, and `<Toaster />`

### Authentication Pattern (Current Implementation)
```tsx
// Store token on login
localStorage.setItem("token", token);

// Clear token on logout
localStorage.removeItem("token");
router.push("/login");
```

## Known Incomplete Areas
- `lib/api.ts`, `lib/socket.ts` - Empty, need backend integration
- Custom hooks (`use-auth.ts`, `use-chat.ts`, `use-employees.ts`) - Empty, need implementation
- Many feature components (chat, auth forms, employee tables) - Stubbed out, need logic
- Backend API endpoints - Not defined yet

## Key Design Decisions
- **No server components for dashboard** - Dashboard layout marked `"use client"` for easier state management
- **Responsive-first sidebar** - Icon-only on mobile, full width on desktop
- **Centralized types** - All TypeScript interfaces in single file for consistency
- **shadcn/ui "New York" style** - More compact, modern aesthetic vs. "Default" style
- **Zinc color scheme** - Neutral, professional appearance with excellent dark mode

## When Implementing Features
1. Check `lib/types.ts` for existing interfaces before creating new ones
2. Use shadcn/ui components from `components/ui/` - don't reinvent primitives
3. Follow Next.js App Router patterns - prefer server components unless interactivity needed
4. Implement API calls in `lib/api.ts`, not directly in components
5. Use `react-hot-toast` for user feedback (success, error messages)
6. Always test dark mode - toggle via system preference or add manual toggle
