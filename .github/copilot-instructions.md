# Budget Sharing Website for Couple - Project Instructions

This is a modern React application for budget sharing between Arthur and Valeria.

## Tech Stack
- React 18 + Vite 5
- Tailwind CSS v3 (dark theme, responsive)
- Framer Motion (animations)
- Firebase 10+ (Auth + Firestore + Realtime Database + Hosting)
- React Router v7 (navigation)
- Recharts (analytics and charts)
- Zustand (state management)
- ShadCN UI (modern ready-made components)
- Lucide Icons (interface icons)
- ESLint + Prettier (code quality)

## Project Structure
```
/src
  /assets        → icons, images
  /components    → reusable components (Header, Menu, Cards, ProgressBar, Charts)
  /pages         → pages (Home, Goals, Categories, Limits, Analytics, Settings)
  /firebase      → Firebase configuration and functions
  /styles        → global and custom styles
  /context       → global state (balance, FamilyID)
  /hooks         → custom hooks for Firebase and state
main.jsx
App.jsx
index.css
```

## Features
1. Dashboard with balance cards for Arthur and Valeria
2. Categories management
3. Budget limits per category
4. Operations tracking (income/expenses)
5. Goals tracking with progress bars
6. Analytics with charts
7. Settings (theme, colors, fonts)
8. Firebase Auth with FamilyID sync
9. Mobile responsive design
10. Smooth animations with Framer Motion

## Completed Steps
- [x] Project structure created
- [x] Dependencies configured
- [x] Basic architecture setup