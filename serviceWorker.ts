export function registerServiceWorker() {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker
			.register('/cache-worker.ts', { scope: '/' })
			.then(function () {
				console.log('Service worker registered')
			})
		navigator.serviceWorker.ready.then(function () {
			console.log('Service worker ready')
		})
	}
}
