import { get, sleep, ROOT_URL, VERSION, on_version_ready } from './Util.mjs';
import { newStyle } from './DomUtil.mjs'
import Map from './Map.mjs';

console.log('Editor initializing');

const g_map = new Map();
const g_load = (async () => {
	console.log('Editor loading');
	await Map.add_elements(document.querySelector('#mgeArea'));
})();

document.body.classList.add('mge-fullscreen');

document.mgeEdit = async ({ id }) => {
	console.log('Editor open');
	await g_load;
	await g_map.reinit('world');
};
