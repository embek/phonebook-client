# React Phonebook App

A responsive React application for managing contacts with offline capabilities and avatar management.

## Features

- CRUD operations for contacts (name, phone number, avatar)
- Responsive design for mobile, tablet and desktop
- Offline functionality with session storage
- Infinite scroll pagination
- Search and sort contacts
- Avatar image upload and preview
- Failed operation retry mechanism
- Input validation

## Tech Stack

- React 18
- Redux Toolkit for state management
- React Router v6
- Axios for API calls
- FontAwesome icons
- Session Storage for offline capability
- CSS3 with media queries

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Running instance of [phonebook-server](https://github.com/embek/phonebook-server)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/phonebook-client.git
   cd phonebook-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the API endpoint:
   - Create a `.env` file in the root directory
   - Add the following environment variables:
     ```
     REACT_APP_API_URL=http://localhost:3000
     REACT_APP_BASE_URL=http://localhost:3001
     ```

4. Start the development server:
   ```bash
   npm start
   ```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production

## Core Features

### Contact Management
![Phonebook Page](https://github.com/embek/phonebook-client/blob/main/public/screenshots/desktop-view.png)
- View contacts with name, phone number and avatar
- Add, edit, and delete contacts
- Infinite scroll for large contact lists
- Confirmation dialog for deletions

### Offline Support
![Offline](https://github.com/embek/phonebook-client/blob/main/public/screenshots/offline-mode-with-retry.png)
- Full functionality without internet connection
- Local storage for pending changes
- Automatic retry of failed operations
- Visual status indicators

### Search & Sort
![Search Sort](https://github.com/embek/phonebook-client/blob/main/public/screenshots/mobile-view.png)
- Search by name or phone number
- Sort in ascending/descending order
- Real-time filtering

### Avatar Management
![Avatar Page](https://github.com/embek/phonebook-client/blob/main/public/screenshots/avatar-page-with-preview.png)
- Image upload and preview
- Default avatar fallback
- Responsive image handling

## Project Structure

```
src/
├── features/              # Feature-based organization
│   ├── AddPage.js         # New contact form
│   ├── AvatarPage.js      # Avatar management
│   ├── ContactItem.js     # Contact card component
│   ├── DeleteModal.js     # Delete confirmation
│   ├── PhonebookPage.js   # Main page
│   └── phonebookSlice.js  # Redux slice
├── services/
│   └── api.js             # API configuration
├── store.js               # Redux store setup
├── components/
│   └── ErrorPage.js       # Error handling
├── App.js                 # Root component
└── App.css                # Global styles
```

## State Management

The application uses Redux Toolkit for state management with the following features:

- Centralized store for contacts and UI state
- Async thunks for API operations
- Offline-first approach using session storage
- Optimistic updates for better UX
- Error handling and retry mechanisms
