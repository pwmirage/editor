/* SPDX-License-Identifier: MIT
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */
'use strict';

const levenshtein = (a, b) => {
	let i, j, cost;
	const d = [];

	if (a === '' || b === '') {
		return 999;
	}

	const alen = a.length;
	const blen = b.length;
	for (i = 0; i <= alen; i++) {
		d[i] = [];
		d[i][0] = i;
	}

	for (j = 0; j <= blen; j++) {
		d[0][j] = j;
	}

	for (i = 1; i <= alen; i++) {
		for (j = 1; j <= blen; j++) {
			if (a.charAt(i - 1) == b.charAt(j - 1)) {
				/* uppercase or number */
				cost = a.charAt(i - 1) < 'a' ? -5 : 0;
			} else {
				cost = 1;
			}

			d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);

			if (i > 1 && j > 1 &&  a.charAt(i - 1) == b.charAt(j-2) && a.charAt(i-2) == b.charAt(j-1)) {
				d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost)
			}
		}
	}

	return d[alen][blen];
}

const fuzzysort = {
	index: (arr, { key }) => {
		const index = [];
		for (const obj of arr) {
			if (!obj) {
				continue;
			}

			const words = obj[key].split(' ');
			const entry = { obj, words, dist: 999 };
			index.push(entry);
		}

		return index;
	},
	go: (search, index, { threshold = 3 } = {}) => {
		if (!search) {
			const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
			return index.filter(e => e.obj.name).sort((a, b) => collator.compare(a.obj.name, b.obj.name));
		}

		const search_words = search.trim().split(' ');
		for (const entry of index) {
			let total_dist = 0;
			const matched_words = [];
			for (const sword of search_words) {
				let dmin = 999;
				for (const eword of entry.words) {
					const d = levenshtein(sword, eword);
					if (d < dmin) {
						dmin = d;
					}
				}
				total_dist += dmin;
			}
			entry.dist = total_dist;
		}

		/* we need to make a copy of the array, filter it just along the way */
		const HARD_THRESHOLD = 100;
		const results = index.filter(e => e.dist < HARD_THRESHOLD);

		results.sort((a, b) => {
			return a.dist > b.dist ? 1: (a.dist < b.dist ? -1 : 0);
		});

		let count = 0;
		let prev_dist = results[0]?.dist || 999;
		for (const e of results) {
			if (e.dist - prev_dist >= threshold) {
				break;
			}

			prev_dist = e.dist;
			count++;
		}

		results.length = count;
		return results;
	},

}
