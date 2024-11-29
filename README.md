# Simple Service Worker Example

This repository demonstrates a basic implementation of a Service Worker that caches static assets for offline use. It includes functionality to exclude specific requests from being cached and provides a fallback response for these excluded requests.

## Features

- **Static Caching:** Caches predefined static assets during the Service Worker `install` phase.
- **Exclusion List:** Requests matching URLs in the `EXCLUDE` array are not cached.
- **Fallback Response:** For excluded requests made while offline, a fallback response is returned.

### Service Worker Usage

The Service Worker is registered in the application using the `registerServiceWorker` function:

First install `vite-plugin-pwa` plugin and configure `vite.config.ts`

### Installing plugin

```bash
yarn add -D vite-plugin-pwa
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), VitePWA()],
})
```

### cache-worker.ts

Create and export register function

```typescript
export function registerServiceWorker() {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker
			.register('/cache-worker.ts', { scope: '/' })
			.then(() => {
				console.log('Service worker registered')
			})
		navigator.serviceWorker.ready.then(() => {
			console.log('Service worker ready')
		})
	}
}
```

### main.tsx

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { registerServiceWorker } from '../serviceWorker.ts'

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>
)
```

### cache-worker.ts

```typescript
/// <reference lib="webworker" />

const CACHE_NAME = 'my-cache'
const EXCLUDE = ['https://bank.gov.ua']

self.addEventListener('install', (event: ExtendableEvent) => {
	console.log('installing service worker!!')
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache
				.addAll([
					'/',
					'/index.html',
					'https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				])
				.then(() => self.skipWaiting())
		})
	)
})

self.addEventListener('activate', (event: ExtendableEvent) => {
	console.log('Activation service worker')
	event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', function (event: FetchEvent) {
	const url = new URL(event.request.url)

	// Exclude
	const isExcluded = EXCLUDE.some((excludePath) =>
		url.href.startsWith(excludePath)
	)

	if (isExcluded) {
		console.log(isExcluded)
		console.log(`Skipping cache for endpoint: ${event.request.url}`)
		return
	}

	console.log(`fetching ${event.request.url}`)
	if (navigator.onLine) {
		const fetchRequest = event.request.clone()

		// Check if we received a valid response
		return fetch(fetchRequest).then(function (response) {
			if (!response || response.status !== 200) {
				return response
			}
			const responseToCache = response.clone()

			caches.open(CACHE_NAME).then(function (cache) {
				cache.put(event.request, responseToCache)
			})

			return response
		})
	}
	if (!navigator.onLine) {
		event.respondWith(
			caches.match(event.request).then(function (response) {
				if (response) {
					// Return from cache if response exists
					return response
				}
				// Thumb if no response
				return new Response('Offline: Resource not available', {
					status: 404,
					statusText: 'Not Found',
					headers: { 'Content-Type': 'text/plain' },
				})
			})
		)
	}
})
```
