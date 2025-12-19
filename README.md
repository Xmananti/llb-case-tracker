# AdvocatePro


A comprehensive case management application built with Next.js, Firebase, and TypeScript.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Storage
5. Get your Firebase config from Project Settings > General > Your apps > Web app config

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase configuration:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your Firebase values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- ✅ User Authentication (Login/Register)
- ✅ Case Management (CRUD operations)
- ✅ Document Upload & Management
- ✅ Hearings Management
- ✅ Tasks Management
- ✅ Real-time Updates
- ✅ Responsive UI

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Forms**: React Hook Form

## Project Structure

```
llb-case-tracker/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   └── api/               # API routes
├── components/            # Reusable UI components
├── context/               # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── firebase/         # Firebase configuration & utilities
│   └── utils/            # Helper functions
└── public/               # Static assets
```

## Firebase Setup Checklist

- [ ] Create Firebase project
- [ ] Enable Email/Password authentication
- [ ] Create Firestore database
- [ ] Enable Storage
- [ ] Configure Firestore security rules
- [ ] Configure Storage security rules
- [ ] Add environment variables to `.env.local`

## License

MIT
