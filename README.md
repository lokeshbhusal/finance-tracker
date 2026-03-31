# 💰 Finance Tracker

A production-ready **Personal Finance Tracker** web application built with **Angular 17+** and **Firebase**.

![Angular](https://img.shields.io/badge/Angular-17+-red?style=flat-square&logo=angular)
![Firebase](https://img.shields.io/badge/Firebase-10-orange?style=flat-square&logo=firebase)
![Angular Material](https://img.shields.io/badge/Angular%20Material-17-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)

## ✨ Features

- 🔐 **Authentication** — Email/Password + Google Sign-In
- 📊 **Dashboard** — Summary cards, income vs expenses chart, category breakdown
- 💸 **Transactions** — Full CRUD with search, filter, and sort
- 🎯 **Budget** — Set monthly limits with visual progress bars
- 📈 **Reports** — Monthly summaries and category analytics

## 🛠️ Tech Stack

| Technology | Version |
|---|---|
| Angular | 17+ |
| Angular Material | 17 |
| Firebase SDK | 10 |
| AngularFire | 17 |
| ng2-charts | 5 |
| Chart.js | 4 |

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- Angular CLI 17: `npm install -g @angular/cli`
- Firebase account

### 1. Clone the Repository
```bash
git clone https://github.com/lokeshbhusal/finance-tracker.git
cd finance-tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** (Email/Password + Google)
4. Create a **Firestore Database**
5. Copy your Firebase config to `src/environments/environment.ts`

### 4. Run the App
```bash
ng serve
```
Open http://localhost:4200

## 🚀 Deploy to Firebase Hosting

```bash
npm run build
firebase login
firebase deploy
```

## 📁 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/        # Data interfaces
│   │   ├── services/      # Firebase services
│   │   └── guards/        # Route protection
│   └── features/
│       ├── auth/          # Login & Register
│       ├── dashboard/     # Overview & charts
│       ├── transactions/  # CRUD operations
│       ├── budget/        # Budget management
│       └── reports/       # Analytics
└── environments/          # Firebase config
```

## 📄 License

MIT
