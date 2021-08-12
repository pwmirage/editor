/* Taken from https://github.com/dfabulich/service-worker-refresh-sample
 * ... and modified
 */

const showRefreshUI = async (registration) => {
	await sleep(1000);

	const ok = await confirm('There is an updated version of this website available.',
			'Click OK to reload it on all your open tabs.');

	if (!ok) {
		return;
	}

	registration.waiting.postMessage('skipWaiting');
	notify('success', 'Page updated!');
};

const onNewServiceWorker = (registration, callback) => {
	if (registration.waiting) {
		// SW is waiting to activate. Can occur if multiple clients open and
		// one of the clients is refreshed.
		return callback();
	}

	const listenInstalledStateChange = () => {
		registration.installing.addEventListener('statechange', (event) => {
			if (event.target.state === 'installed') {
				// A new service worker is available, inform the user
				callback();
			}
		});
	};

	if (registration.installing) {
		return listenInstalledStateChange();
	}

	// We are currently controlled so a new SW may be found...
	// Add a listener in case a new SW is found,
	registration.addEventListener('updatefound', listenInstalledStateChange);
}

let g_sw_refreshing;
// When the user asks to refresh the UI, we'll need to reload the window
navigator.serviceWorker.addEventListener('controllerchange', (event) => {
	if (g_sw_refreshing) return; // prevent infinite refresh loop when you use "Update on Reload"
	g_sw_refreshing = true;
	window.location.reload();
});

navigator.serviceWorker.register('/sw.js')
	.then((registration) => {
		// Track updates to the Service Worker.
		if (!navigator.serviceWorker.controller) {
			// The window client isn't currently controlled so it's a new service
			// worker that will activate immediately
			return;
		}
		registration.update();

		onNewServiceWorker(registration, () => {
			showRefreshUI(registration);
		});
	});
