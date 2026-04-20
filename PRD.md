# Design Overview
- Goal: Minimalist, real-time chat focus, fast UX, mobile-first, anonymous but safe feel.
- Theme: Dark mode with purple primary colors.

# Design Tokens
- Primary: #7F2CCB (Purple)
- Primary Hover: #6A24AA
- Accent (Success): #22C55E
- Danger: #EF4444
- Warning: #F59E0B
- Background: #0B0B0F
- Surface: #13131A
- Border: #2A2A35
- Text Primary: #FFFFFF
- Text Secondary: #A1A1AA

# Screens
1. Login Screen: Centered card, dark background, social login optional.
2. Register Screen: Username, Email, Password, Confirm.
3. Home / Matching: Central "Start Chatting" button with pulse animation.
4. Chat Screen: Core interface with header (Stranger, Skip, Report), scrollable messages, and input.
5. Chat End State: Disconnect message and "Find new chat" CTA.
6. Profile Screen: Avatar, Bio, Interests (tags).
7. Edit Profile Screen: Upload, tag input (chips), bio.
8. Settings: Toggles for notifications, privacy, logout.
9. Report Modal: Reasons dropdown, textarea.

# UX Principles
- Speed: Matching < 2s, real-time messages.
- Focus: One main action per screen.
- Anonymity: "Stranger" as default name.
- Safety: Easy access to Skip and Report.

# Library
- React
- React Router
- Shadcn UI
- Tailwind CSS
- JWT

