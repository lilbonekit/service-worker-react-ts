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
