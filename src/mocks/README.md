# MSW (Mock Service Worker) Setup

This project uses MSW to mock Google Places API requests during development.

## Setup Instructions

1. **Install MSW** (if not already installed):
   ```bash
   npm install --save-dev msw
   ```

2. **Initialize the service worker**:
   ```bash
   npm run msw:init
   ```
   This will create the service worker file in the `public/` directory.

3. **Start the development server**:
   ```bash
   npm run dev
   ```

MSW will automatically start in development mode and intercept all requests to the Google Places API (`https://places.googleapis.com/v1/places:searchNearby`).

## Files Structure

- `src/mocks/data.ts` - Mock places data
- `src/mocks/handlers.ts` - MSW request handlers
- `src/mocks/browser.ts` - Browser worker setup
- `src/mocks/server.ts` - Node.js server setup (for testing)
- `src/mocks/index.ts` - Exports for easy importing

## Configuration

MSW is automatically enabled in development mode. To enable it in other environments, set:
```
NEXT_PUBLIC_ENABLE_MSW=true
```

## Mock Data

The mock data includes 20 sample places matching the structure returned by the Google Places API. All fields requested in the API call are included in the mock response.

