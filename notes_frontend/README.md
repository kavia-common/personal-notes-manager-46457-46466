# Personal Notes Frontend (React)

A simple web-based notes application that enables users to create, edit, and delete notes. The UI follows the "Ocean Professional" theme (blue and amber accents), is responsive, and persists notes in localStorage by default.

## Features

- Create, edit, delete notes with instant updates
- LocalStorage persistence (standalone, no backend required)
- API-ready structure (optional) using `REACT_APP_API_BASE`
- Responsive layout: list and form side-by-side on desktop, stacked on mobile
- Inline validation (title required)
- Accessible controls with focus states and ARIA roles
- Ocean Professional theme with subtle gradients and transitions

## Getting Started

In the project directory, you can run:

### `npm install`
Install dependencies (first run only).

### `npm start`
Runs the app in development mode at http://localhost:3000

### `npm test`
Launches the test runner.

### `npm run build`
Builds the app for production into the `build` folder.

## Environment Variables

You can optionally configure an API backend by setting:

- `REACT_APP_API_BASE` — Base URL for the notes API (if provided and reachable, the code can be adapted to use it).

Other variables in this container (not directly used by this app but available if needed):
- `REACT_APP_BACKEND_URL`, `REACT_APP_FRONTEND_URL`, `REACT_APP_WS_URL`,
- `REACT_APP_NODE_ENV`, `REACT_APP_NEXT_TELEMETRY_DISABLED`,
- `REACT_APP_ENABLE_SOURCE_MAPS`, `REACT_APP_PORT`, `REACT_APP_TRUST_PROXY`,
- `REACT_APP_LOG_LEVEL`, `REACT_APP_HEALTHCHECK_PATH`,
- `REACT_APP_FEATURE_FLAGS`, `REACT_APP_EXPERIMENTS_ENABLED`

## Styling

Theme variables and component styles are in `src/App.css`. The app uses CSS variables to implement:
- primary: `#2563EB`
- secondary/success: `#F59E0B`
- error: `#EF4444`
- background: `#f9fafb`
- surface: `#ffffff`
- text: `#111827`

## Notes

- By default, the app stores and reads notes from `localStorage`.
- The code is structured to easily switch to API calls in `useNotesService` if `REACT_APP_API_BASE` is set.
