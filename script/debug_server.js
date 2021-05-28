const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
	ws.on('message', (message) => {
		console.log('received: %s', message);
	});

	const updated = {};
	let update_scheduled = false;

	const try_notify_updated = () => {
		if (update_scheduled) {
			return;
		}

		update_scheduled = true;
		setTimeout(() => {
			update_scheduled = false;
			for (const f in updated) {
				if (!updated[f]) {
					continue;
				}

				ws.send(f);
				updated[f] = 0;
			}

		}, 100);

	}

	const watch_dir = (path) => {
		fs.watch(path, (event, filename) => {
			if (!filename ||
				(!filename.endsWith('.tpl') && !filename.endsWith('.js') && !filename.endsWith('.css'))) {
				return;
			}
			updated[path + '/' + filename] = 1;
			try_notify_updated();
		});
	};

	watch_dir('script');
	watch_dir('script/window');
	watch_dir('script/page');
	watch_dir('tpl');
	watch_dir('tpl/window');
	watch_dir('tpl/preview');
	watch_dir('tpl/page');
	watch_dir('css');
});
