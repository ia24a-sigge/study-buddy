<div align="center">

# 📚 Study Buddy Finder

**Find the right people to study with.**

A polished single-page web app that helps students create a learning profile, get matched with compatible study partners, organize sessions, and keep momentum going — all in one calm, focused workspace.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![ESLint](https://img.shields.io/badge/ESLint-configured-4B32C3?logo=eslint&logoColor=white)](https://eslint.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#-license)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [Project Structure](#-project-structure)
- [Architecture Notes](#-architecture-notes)
- [Design System](#-design-system)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

Studying alone is hard to keep up. **Study Buddy Finder** makes it easy to find people who are working toward the same goals, at the same times, on the same subjects — then gives you the tools to actually meet up and stay accountable.

The idea is simple:

1. **Create your profile** — add your subjects, goals, availability, and preferred learning style.
2. **Find a match** — browse partners ranked by shared subjects, similar goals, and overlapping free time.
3. **Get in touch** — open a profile, start a conversation, and plan a session together.

Everything runs entirely in the browser against a rich set of mock data, so the whole experience is instantly explorable without a backend, sign-up, or database.

---

## ✨ Features

### 🔐 Authentication
- Combined **login / register** screen with a live mode switch.
- Client-side form validation (name, valid email, minimum password length, school).
- One-tap social sign-in mockups (Google, Microsoft) for quick demos.
- "Remember me" and "Forgot password?" affordances.

### 🏠 Dashboard
- Personalized greeting and a momentum-focused hero panel.
- **Recommended study plan** card with a confidence meter.
- Upcoming sessions you've joined, at a glance.
- Recommended study buddies ranked by match score.
- Personal study goals with animated progress bars.

### 🤝 Matching
- Partners scored by a **compatibility percentage** based on shared subjects, goals, and availability.
- Rich buddy cards with skill level, languages, ratings, and bios.
- Staggered entrance animations for a lively grid.

### 🔎 Power Search
- Multi-criteria filtering: subject, goal, availability, skill level, online status, and language.
- Sort by **best match**, most active, newest, or highest rated.
- Graceful empty state when no partner fits the current filters.

### 📅 Sessions & Calendar
- Discover, join, leave, and create study sessions (online or in-person).
- Tabbed views: **Discover**, **Upcoming**, and **My sessions**.
- Month and week calendar views that surface sessions on their day.
- Create-session modal with subject, topic, date, time, duration, mode, location, and capacity.

### 💬 Messaging
- Two-pane chat layout with a searchable conversation list.
- Live message composer, typing indicators, and unread badges.
- Contacting a buddy automatically opens (or creates) a conversation.

### 👤 Profile & Ratings
- Detailed learning profile: bio, subjects, goals, availability, languages, interests.
- Editable profile modal that writes changes straight back into the app state.
- Gamification **badges** and a running **reviews** feed.
- Post-session star rating flow with optional written feedback.

### ⚙️ Settings & Personalization
- Account, privacy, and notification preferences with animated toggles.
- **Dark / light theme** switch, persisted to the document and available from every screen.
- Clearly separated "danger zone" for destructive actions (mocked).

### 🎨 Experience details
- Fully **responsive** layout with a collapsible mobile sidebar and scrim.
- Non-blocking **toast notifications** for feedback on every action.
- A slide-in **notification center** in the top bar.
- Subtle, tasteful motion throughout (entrance animations, pulses, progress fills).

---

## 🛠 Tech Stack

| Layer          | Technology                                              |
| -------------- | ------------------------------------------------------- |
| **Framework**  | [React 19](https://react.dev) (function components + hooks) |
| **Build tool** | [Vite 8](https://vitejs.dev) with Hot Module Replacement |
| **Language**   | Modern JavaScript (ES Modules, JSX)                     |
| **Styling**    | Handwritten CSS with custom properties & theming        |
| **Linting**    | [ESLint 10](https://eslint.org) with React Hooks rules  |
| **Data**       | In-memory mock dataset (no backend required)            |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `20.19+` or `22.12+` (required by Vite 8)
- **npm** `10+` (bundled with recent Node releases)

Check your versions:

```bash
node -v
npm -v
```

### Installation

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd study-buddy-v3

# 2. Install dependencies
npm install
```

### Run the development server

```bash
npm run dev
```

Vite will print a local URL (by default **http://localhost:5173**). Open it in your browser — changes hot-reload instantly.

### Build for production

```bash
npm run build      # outputs an optimized bundle to /dist
npm run preview    # serves the production build locally to verify it
```

---

## 📜 Available Scripts

| Command           | Description                                             |
| ----------------- | ------------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with hot module replacement.  |
| `npm run build`   | Produce an optimized production build in `dist/`.       |
| `npm run preview` | Preview the production build locally.                   |
| `npm run lint`    | Run ESLint across the project.                          |

---

## 🗂 Project Structure

```
study-buddy-v3/
├── public/                 # Static assets served as-is
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/             # Images used by the app (hero, logos)
│   ├── data/
│   │   └── mockData.js     # Users, buddies, sessions, chats, reviews, badges…
│   ├── App.jsx             # Application shell + all page/UI components
│   ├── App.css             # Component and layout styles
│   ├── index.css           # Global base styles & theme tokens
│   └── main.jsx            # React entry point
├── index.html              # HTML template / mount point
├── eslint.config.js        # ESLint configuration
├── vite.config.js          # Vite configuration
└── package.json
```

---

## 🧩 Architecture Notes

- **Single-page application.** The whole product lives in `App.jsx`, which composes a set of focused presentational components (sidebar, top bar, page views, cards, modals, toasts). A lightweight `activePage` state acts as the router.
- **State-driven UI.** All interactivity — joining sessions, sending messages, editing your profile, switching themes — is handled with React state. Actions optimistically update the in-memory data and surface feedback through toasts.
- **Mock data layer.** `src/data/mockData.js` is the single source of truth for demo content. Swapping it for a real API later means replacing this module and wiring the handlers to network calls.
- **Theming.** The active theme is written to `document.documentElement.dataset.theme`, letting the CSS respond globally via `[data-theme]` selectors and custom properties.
- **Accessibility.** Semantic landmarks, `aria-*` attributes, dialog roles, and keyboard-friendly controls are used throughout.

---

## 🎨 Design System

The interface is built on a small, consistent set of primitives so every screen feels like part of the same product:

- **Cards & glass panels** for grouping content with soft depth.
- **Eyebrow → title → body** typographic rhythm on every section.
- **Avatars** with gradient backgrounds and live status dots.
- **Primary / secondary / text / icon** button variants.
- **Toasts, badges, progress tracks, and toggles** as reusable feedback elements.
- A shared **light and dark palette** driven by CSS custom properties.

---

## 🗺 Roadmap

Ideas for where the project could go next:

- [ ] Real authentication and user accounts
- [ ] Persistent backend (database + REST/GraphQL API)
- [ ] Real-time chat via WebSockets
- [ ] Calendar sync (Google / Outlook / iCal export)
- [ ] Smarter matching that learns from session outcomes
- [ ] Push and email notifications
- [ ] Profile photo uploads
- [ ] Internationalization (i18n)

---

## 🤝 Contributing

Contributions and suggestions are welcome!

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-improvement`.
3. Commit your changes with a clear message.
4. Run `npm run lint` to keep the code tidy.
5. Open a pull request describing what and why.

---

## 📄 License

Released under the **MIT License**. You're free to use, modify, and distribute this project — see below.

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

---

<div align="center">

Built with ❤️ for students who learn better together.

</div>
