# FinTrack — Personal Finance Tracker

A personal finance tracking app I built with **Angular 19** and **Firebase** to manage expenses, budgets, and get insights into spending habits.

## Features

- **Authentication** — Email/Password and Google Sign-In via Firebase Auth
- **Dashboard** — Personalized greeting, summary cards, income vs expenses chart, category breakdown
- **Transactions** — Add, edit, delete transactions with search, filter, and sort
- **Budget Management** — Set monthly category budgets with progress tracking
- **Reports** — Monthly summaries and category-level analytics

## Tech Stack

- Angular 19 with standalone components
- Angular Material for UI
- Firebase (Auth + Firestore)
- Chart.js + ng2-charts for data visualization
- SCSS for styling

## Recent Changes

- Added personalized greeting banner on dashboard (time-based: morning/afternoon/evening)
- Renamed app branding to "FinTrack"
- Added footer with author credit
- Added new transaction categories: "Side Hustle" (income), "Subscriptions" (expense)
- Updated loading messages for better UX
- General cleanup and polish

## Getting Started

### Prerequisites

- Node.js 18+
- Angular CLI: `npm install -g @angular/cli`
- A Firebase project with Auth and Firestore enabled

### Setup

```bash
git clone https://github.com/lokeshbhusal/finance-tracker.git
cd finance-tracker
npm install
```

Add your Firebase config to `src/environments/environment.ts`, then:

```bash
ng serve
```

Open http://localhost:4200

### Deploy

```bash
ng build
firebase deploy
```

## Project Structure

```
src/app/
├── core/
│   ├── models/        # TypeScript interfaces
│   ├── services/      # Firebase service layer
│   └── guards/        # Auth route guard
├── features/
│   ├── auth/          # Login & Register pages
│   ├── dashboard/     # Main overview with charts
│   ├── transactions/  # CRUD for transactions
│   ├── budget/        # Budget management
│   └── reports/       # Spending analytics
└── environments/      # Firebase config
```

## License

MIT
