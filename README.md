# Disaster Response Hub - AI-Powered Emergency Coordination System

A modern, high-performance Next.js application with a premium neon-themed UI for real-time disaster response and resource allocation.

## Features

- **Real-Time Dashboard**: Live disaster tracking with interactive map
- **Resource Management**: Track and allocate resources efficiently
- **Emergency Requests**: Create, track, and prioritize requests
- **AI Assistant**: Intelligent chatbot for decision support
- **Authentication**: Secure Google Sign-In via Firebase
- **Responsive Design**: Optimized for desktop and mobile
- **Neon UI**: Futuristic cyber-style design with glassmorphism

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom neon theme
- **Maps**: React Leaflet
- **Authentication**: Firebase (Google Sign-In)
- **State Management**: React Context API
- **Icons**: Lucide React

## Performance Optimizations

- React.memo for component memoization
- useCallback for function memoization
- useMemo for expensive computations
- Proper useEffect cleanup
- No unnecessary re-renders
- Optimized bundle size
- CSS-only animations (no heavy animation libraries)

## Project Structure

```
app/
├── components/
│   ├── Navbar.tsx           # Navigation bar
│   ├── Sidebar.tsx          # Sidebar menu
│   ├── MapComponent.tsx     # Interactive map
│   ├── RequestList.tsx      # Emergency requests
│   ├── ResourceList.tsx     # Available resources
│   ├── AllocationPanel.tsx  # Resource allocation
│   ├── Chatbot.tsx          # AI assistant
│   └── RequestForm.tsx      # Request creation form
├── dashboard/
│   └── page.tsx             # Main dashboard
├── login/
│   └── page.tsx             # Login page
├── globals.css              # Global styles
├── layout.tsx               # Root layout
└── page.tsx                 # Home redirect

lib/
├── auth-context.tsx         # Auth provider
└── firebase.ts              # Firebase config
```

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Google Authentication
3. Add your Firebase config to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Usage Guide

### Authentication

1. Navigate to login page
2. Click "Sign in with Google"
3. You'll be redirected to the dashboard

### Dashboard Navigation

- **Navbar**: Shows project title and user profile
- **Sidebar**: Menu navigation (mobile-responsive)
- **Map**: Interactive disaster and resource tracking
- **Right Panel**: Active requests and resources
- **Bottom Section**: Resource allocation and AI chat

### Creating a Request

1. Click "New Request" button
2. Fill request details
3. Submit the form

### Resource Allocation

1. Select resources and requests
2. Enter allocation quantity
3. Click "Allocate Resources"

## Component Documentation

### Navbar
- Sticky navigation with user profile
- Logout functionality
- Mobile menu toggle

### Sidebar
- Active route highlighting
- Static menu configuration
- System status indicator

### MapComponent
- React Leaflet integration
- Custom disaster/resource markers
- Interactive popups

### RequestList
- Sorted by priority
- Status indicators
- Memoized for performance

### ResourceList
- Resource grouping
- Status tracking
- Available quantity display

### AllocationPanel
- Request form interface
- Allocation history
- Status tracking

### Chatbot
- AI conversation interface
- Message history
- Real-time responses

### RequestForm
- Form validation
- Modal interface
- Error handling

## Styling

### Neon Theme Colors

```css
Cyan:    #00ffff
Purple:  #a855f7
Blue:    #3b82f6
Pink:    #ec4899
```

### CSS Classes

- `.neon-card`: Glowing card container
- `.neon-button`: Outlined button
- `.neon-button-primary`: Filled button
- `.neon-input`: Text input field
- `.gradient-text`: Gradient text effect

## Performance Best Practices

### Used in This Project

- **React.memo**: Prevents unnecessary re-renders
- **useCallback**: Memoizes event handlers
- **useMemo**: Caches computed values
- **Proper useEffect**: Dependencies and cleanup
- **CSS-only animations**: Hardware accelerated
- **Code splitting**: Route-based code splitting

### Example: Optimized Component

```typescript
const MyComponent: React.FC<Props> = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    // Expensive computation
    return data.filter(...);
  }, [data]);

  const handleClick = useCallback(() => {
    // Handler logic
  }, []);

  return <div>{/* JSX */}</div>;
});
```

## Firebase Setup Guide

### Create Firebase Project

1. Go to [firebase.google.com](https://firebase.google.com)
2. Click "Go to console"
3. Create new project
4. Wait for project creation

### Enable Google Authentication

1. Go to Authentication section
2. Click "Get started"
3. Select "Google" provider
4. Enter your email and save

### Get Firebase Config

1. Go to Project Settings
2. Find Firebase Config
3. Copy all credentials to `.env.local`

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables

Add these to Vercel dashboard for production:

- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID

## Troubleshooting

### Firebase Errors

- **"apiKey not valid"**: Check Firebase config in `.env.local`
- **"Auth domain not configured"**: Add domain to Firebase auth settings
- **"Sign-in popup blocked"**: Check browser popup settings

### Map Not Showing

- Verify Leaflet CSS is loaded
- Check browser console for errors
- Ensure React Leaflet installed correctly

### Build Errors

- Delete `.next` folder
- Run `npm install` again
- Check TypeScript errors: `npm run build`

## Customization

### Add New Components

1. Create component in `app/components/`
2. Implement with React.memo
3. Use useCallback for handlers
4. Import in dashboard

### Modify Neon Theme

Edit `tailwind.config.ts`:

```typescript
colors: {
  neon: {
    cyan: "#00ffff",
    purple: "#a855f7",
    blue: "#3b82f6",
  }
}
```

### Change Color Scheme

Edit `app/globals.css` to modify shadow and glow effects.

## API Integration

To connect backend APIs:

```typescript
useEffect(() => {
  const fetchData = async () => {
    const response = await fetch('/api/endpoint');
    const data = await response.json();
    setData(data);
  };
  
  fetchData();
}, []);
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Future Enhancements

- Firestore integration
- Push notifications
- Advanced analytics
- ML optimization
- Offline support
- Multi-language support

## License

MIT License - Free to use and modify

## Support

For issues:
1. Check troubleshooting section
2. Review Next.js docs
3. Check Firebase docs
4. Review React docs

---

**Built with Modern Web Standards**
**Version**: 1.0.0
**Last Updated**: April 2026
# DisasterHub
