# Video Player Application

## Overview
A modern React video player with a beautiful purple-themed UI, featuring playback controls, volume management, fullscreen support, playback speed settings, quality selection, and playlist management.

## Recent Changes
- November 27, 2025: Initial project setup with React, Tailwind CSS, and lucide-react icons

## Project Architecture

### Tech Stack
- **Frontend**: React (Create React App)
- **Styling**: Tailwind CSS v3
- **Icons**: lucide-react

### Project Structure
```
/my-app
  /node_modules
  /public
  /src
      App.js           - Main application component
      VideoPlayer.jsx  - Custom video player component with full controls
      index.js         - React entry point
      index.css        - Tailwind CSS imports
  package.json
  tailwind.config.js
  postcss.config.js
```

### Features
- Play/Pause controls
- Volume control with mute toggle
- Progress bar with seek functionality
- Skip forward/backward (10 seconds)
- Playback speed control (0.5x - 2x)
- Quality selection (360p - 2160p)
- Fullscreen toggle
- Playlist sidebar
- Auto-hiding controls during playback
- Responsive design

### Running the Project
The React development server runs on port 5000. Use the workflow "React App" to start the application.

```bash
cd my-app && PORT=5000 npm start
```

## User Preferences
- None specified yet
