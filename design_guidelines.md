# MentorConnect Design Guidelines

## Design Approach
**Selected Approach:** Material Design System with LinkedIn-inspired professional aesthetics
**Justification:** Education/mentorship platforms require clear information hierarchy, trust-building elements, and efficient task completion. Material Design provides robust mobile-responsive patterns while LinkedIn's professional polish establishes credibility.

## Core Design Elements

### A. Typography
- **Primary Font:** Inter (via Google Fonts)
- **Secondary Font:** System default for chat/messaging
- **Hierarchy:**
  - Hero/Page Titles: 32px (mobile) / 48px (desktop), font-weight-700
  - Section Headers: 24px (mobile) / 32px (desktop), font-weight-600
  - Card Titles: 18px / 20px, font-weight-600
  - Body Text: 15px / 16px, font-weight-400
  - Metadata/Labels: 13px / 14px, font-weight-500
  - Button Text: 15px, font-weight-600

### B. Layout System
**Spacing Units:** Tailwind spacing of 2, 4, 6, 8, 12, 16 (p-2, m-4, gap-6, etc.)
- Mobile padding: p-4 to p-6
- Desktop padding: p-8 to p-12
- Card spacing: p-6 (mobile) / p-8 (desktop)
- Section gaps: gap-8 to gap-12

**Responsive Breakpoints:**
- Mobile-first approach
- Single column on mobile, 2-3 columns on desktop for mentor cards
- Sidebar navigation on desktop, bottom tab bar on mobile

### C. Component Library

**Navigation**
- **Desktop:** Top navigation bar with logo left, primary actions right (Login/Register or Dashboard/Profile), search bar centered
- **Mobile:** Fixed bottom tab navigation (4 tabs: Search, Sessions, Chat, Profile) with icons from Heroicons

**Homepage Hero Section**
- Full-width hero (h-[500px] on desktop, h-[400px] on mobile)
- Background: Blurred gradient overlay on an image showing students/mentors collaborating
- Centered content: Headline, supporting text, dual CTAs (one for students "Find a Mentor", one for mentors "Become a Mentor")
- CTA buttons with backdrop blur (backdrop-blur-md bg-white/20)

**Mentor Search/Discovery**
- Search bar at top with subject filter dropdown
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Mentor cards: Rounded corners (rounded-xl), shadow (shadow-md hover:shadow-lg transition)
- Card content: Profile photo (top), name, bio snippet (2 lines max), subject tags (pills), availability indicator, "View Profile" button

**Mentor Profile Page**
- Two-column layout on desktop (sidebar with photo/CTA, main content area)
- Profile photo: Large circular avatar (w-32 h-32)
- Sections: Bio, Subjects (tag pills), Availability, Reviews/Ratings (if implemented), "Book Session" CTA button (prominent, sticky on scroll for mobile)

**Session Booking Interface**
- Modal/Drawer overlay (full-screen on mobile, centered modal on desktop)
- Form fields: Subject dropdown, Date/Time picker, Optional message textarea
- Clear booking confirmation with session details

**Dashboard**
- Tab-based interface: "Upcoming Sessions" / "Past Sessions"
- Session cards: Mentor/Student name with avatar, subject, date/time, status badge (pending/confirmed/completed/cancelled)
- Quick actions: "Join Chat", "Reschedule", "Cancel"

**Chat Interface**
- Chat list: Contact cards with last message preview, timestamp, unread indicator
- Chat screen: Standard messaging UI with message bubbles (sent vs received), input field at bottom, header with contact name/avatar
- Use distinct bubble styles for sent (right-aligned) vs received (left-aligned) messages

**Authentication Screens**
- Centered card layout (max-w-md)
- Toggle between Login/Register
- Role selection for registration (Student/Mentor radio buttons with icons)
- Social proof element: "Join 1,000+ students and mentors" with small avatars

**Status Indicators**
- Session status badges: pending (yellow/amber), confirmed (green), completed (blue), cancelled (gray)
- Availability badges: "Available Now" (green dot), "Busy" (red dot)
- Unread message count badges (red circle with white number)

### D. Patterns & Interactions
- **Cards:** Hover elevation change (shadow-md to shadow-lg)
- **Buttons:** Primary (solid), Secondary (outline), Ghost (text only) - all with smooth hover states
- **Loading States:** Skeleton screens for mentor cards/chat messages
- **Empty States:** Friendly illustrations with helpful CTAs ("No mentors found. Try different subjects")
- **Animations:** Minimal - only smooth transitions (duration-200) on hover/focus states

### E. Images
**Hero Section Image:** 
- Full-width background image showing diverse students and mentors in a collaborative learning environment (library, study group, or modern classroom)
- Apply gradient overlay (from transparent to semi-dark) for text readability

**Mentor Profile Photos:**
- Circular avatars throughout the app
- Placeholder: Use initials with generated background colors for profiles without photos

**Empty State Illustrations:**
- Simple line illustrations for empty mentor search, no sessions, no chat messages

## Mobile-First Considerations
- Touch targets minimum 44x44px
- Generous tap spacing between interactive elements (gap-4 minimum)
- Sticky CTAs and primary actions on mobile
- Swipe gestures for chat (swipe to delete/archive conversations)
- Bottom sheet modals instead of centered modals on mobile
- Collapsible sections for long mentor bios on mobile

## Trust & Credibility Elements
- Mentor verification badges (if applicable)
- Session count/rating display on mentor cards
- "Safe space" messaging in chat
- Clear privacy/data usage information in footer