# Development Environment Setup

## Overview

This document describes the development environment configuration for the Wheel of Flavours app and important setup considerations.

## Recent Changes

### Fixed: MSW Service Worker Registration Issue

**Problem:** The development server was configured to use `--experimental-https` flag, which caused MSW (Mock Service Worker) to fail registration due to self-signed certificate issues. Service workers cannot be registered on HTTPS connections with invalid certificates.

**Solution:** Removed the `--experimental-https` flag from the `dev` script in `package.json`.

```diff
- "dev": "next dev --turbopack --experimental-https"
+ "dev": "next dev --turbopack"
```

**Impact:**
- The development server now runs on `http://localhost:3000` instead of `https://localhost:3000`
- MSW service worker can now register successfully
- The mock Google Places API endpoint is properly intercepted

**Verification:**
When MSW is enabled (via `MSW_ENABLED=true` cookie), you should see these console messages:
```
[MSW] Mocking enabled.
[MSW] Mock Service Worker started
```

## Current Setup Status

### ✅ Working Components

1. **Next.js Server**: Running successfully on `http://localhost:3000`
2. **MSW Configuration**: Service worker registers and mocks Places API endpoint
3. **App Structure**: Layout, header, and UI components render correctly
4. **Mock Data**: 20+ restaurant/bar locations available in `src/mocks/data.ts`

### ⚠️ Pending Configuration

**Google Maps API Key Required**

The app currently uses a placeholder API key (`PLACEHOLDER_KEY_FOR_DEV`) which prevents the Google Maps JavaScript API from loading properly.

**What's Affected:**
- Map visualization (shows "Loading map..." indefinitely)
- Place markers cannot be displayed on the map
- User interaction with map features is blocked

**To Fix:**
1. Obtain a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable these APIs for your project:
   - Maps JavaScript API
   - Places API (New)
3. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=your_map_id_here
   ```
4. Restart the development server

**Note:** Even with MSW enabled, the map visualization requires a valid API key. MSW only mocks the Places API HTTP endpoint (`places.googleapis.com/v1/places:searchNearby`), not the core Maps JavaScript API which is loaded via script tag.

## Running the App

### Prerequisites
- Node.js and npm installed
- Clone the repository

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual Google Maps API key
   ```

3. **Enable MSW (Optional for Development)**
   
   To use mock data instead of real API calls:
   - Open the app in your browser
   - Open Developer Console (F12)
   - Run: `document.cookie = "MSW_ENABLED=true"`
   - Reload the page

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the App**
   - Open `http://localhost:3000` in your browser
   - Allow location access when prompted

## Architecture Notes

### MSW Implementation

The app uses MSW to mock the Google Places API for development:

- **Handler Location**: `src/mocks/handlers.ts`
- **Mock Data**: `src/mocks/data.ts` (20 Melbourne-area restaurants/bars)
- **Provider**: `src/components/msw-provider.tsx`
- **Activation**: Requires `MSW_ENABLED=true` cookie + development environment

### Why HTTP Instead of HTTPS?

While HTTPS is required for production and provides better security, the development environment uses HTTP because:

1. **Service Worker Limitation**: Service workers cannot register on HTTPS with self-signed certificates
2. **MSW Dependency**: MSW requires service workers to intercept HTTP requests
3. **Local Development**: `localhost` is considered a secure context even on HTTP
4. **Simplicity**: Avoids certificate management complexity in local development

For production deployment, the app should run on proper HTTPS with valid certificates, and MSW should be disabled.

## Troubleshooting

### Map Shows "Loading map..." Forever

**Cause**: Missing or invalid Google Maps API key

**Solution**: Add a valid API key to `.env.local` (see "Pending Configuration" above)

### MSW Not Working

**Symptoms**: Real API calls instead of mock responses, or service worker registration errors

**Solution**:
1. Verify you're using HTTP, not HTTPS: `http://localhost:3000`
2. Check MSW cookie is set: `document.cookie = "MSW_ENABLED=true"`
3. Look for `[MSW] Mock Service Worker started` in console
4. Hard reload the page (Ctrl+Shift+R)

### Geolocation Not Working

**Cause**: Browser needs permission to access location

**Solution**: Click "Allow" when the browser prompts for location permission

## Next Steps

1. **Get API Key**: Obtain Google Maps API credentials
2. **Test Map**: Verify map loads and displays user location
3. **Test Places**: Confirm nearby places populate the list
4. **Test Wheel**: Navigate to spin page and test the wheel functionality

## Related Documentation

- [MSW Documentation](https://mswjs.io/)
- [Google Maps Platform](https://developers.google.com/maps)
- [Next.js Documentation](https://nextjs.org/docs)
