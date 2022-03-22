/**
 * Based on WoltLabSuite/Core/Date/Time/Relative.js
 */
class DateTime {
	static _isActive;
	static _isPending;
	static _offset;
	static _elements;
	static Language;
	static DateUtil;

	static onVisibilityChange() {
		if (document.hidden) {
			DateTime._isActive = false;
			DateTime._isPending = false;
		} else {
			DateTime._isActive = true;
			// force immediate refresh
			if (DateTime._isPending) {
				DateTime.refresh();
				DateTime._isPending = false;
			}
		}
	}

	static new(unix_ts) {
		if (!unix_ts) {
			return newElement('<span>-</span>');
		}

		const el = DateTime.DateUtil.getTimeElement(new Date(unix_ts * 1000));
		const date = new Date();
		const timestamp = (date.getTime() - date.getMilliseconds()) / 1000;
		DateTime.rebuild(el, date, timestamp);
		const ref = new WeakRef(el);
		DateTime._elements.add(ref);
		return el;
	}

	static refresh() {
		// activity is suspended while the tab is hidden, but force an
		// immediate refresh once the page is active again
		if (!DateTime._isActive) {
			if (!DateTime._isPending)
				DateTime._isPending = true;
			return;
		}
		const date = new Date();
		const timestamp = (date.getTime() - date.getMilliseconds()) / 1000;
		for (const ref of DateTime._elements) {
			const el = ref.deref();
			if (el) {
				DateTime.rebuild(el, date, timestamp);
			} else {
				/* element no longer in DOM, stop tracking it */
				DateTime._elements.delete(ref);
			}
		};

	}
	static rebuild(element, date, timestamp) {
		if (!element.classList.contains("datetime") || element.dataset.isFutureDate) {
			return;
		}
		const elTimestamp = parseInt(element.dataset.timestamp, 10) + DateTime._offset;
		const elDate = element.dataset.date;
		const elTime = element.dataset.time;
		const elOffset = element.dataset.offset;
		if (!element.title) {
			element.title = DateTime.Language.get("wcf.date.dateTimeFormat")
				.replace(/%date%/, elDate)
				.replace(/%time%/, elTime);
		}
		// timestamp is less than 60 seconds ago
		if (elTimestamp >= timestamp || timestamp < elTimestamp + 60) {
			element.textContent = DateTime.Language.get("wcf.date.relative.now");
		}
		// timestamp is less than 60 minutes ago (display 1 hour ago rather than 60 minutes ago)
		else if (timestamp < elTimestamp + 3540) {
			const minutes = Math.max(Math.round((timestamp - elTimestamp) / 60), 1);
			element.textContent = DateTime.Language.get("wcf.date.relative.minutes", { minutes: minutes });
		}
		// timestamp is less than 24 hours ago
		else if (timestamp < elTimestamp + 86400) {
			const hours = Math.round((timestamp - elTimestamp) / 3600);
			element.textContent = DateTime.Language.get("wcf.date.relative.hours", { hours: hours });
		}
		// timestamp is less than 6 days ago
		else if (timestamp < elTimestamp + 518400) {
			const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
			const days = Math.ceil((midnight.getTime() / 1000 - elTimestamp) / 86400);
			// get day of week
			const dateObj = DateTime.DateUtil.getTimezoneDate(elTimestamp * 1000, parseInt(elOffset, 10) * 1000);
			const dow = dateObj.getDay();
			const day = DateTime.Language.get("__days")[dow];
			element.textContent = DateTime.Language.get("wcf.date.relative.pastDays", { days: days, day: day, time: elTime });
		}
		// timestamp is between ~700 million years BC and last week
		else {
			element.textContent = DateTime.Language.get("wcf.date.shortDateTimeFormat")
				.replace(/%date%/, elDate)
				.replace(/%time%/, elTime);
		}
	}
	/**
	 * Transforms <time> elements on init and binds event listeners.
	 */
	static setup() {
		DateTime._isActive = true;
		DateTime._isPending = false;
		DateTime._offset = Math.trunc(Date.now() / 1000 - window.TIME_NOW);
		DateTime._elements = new Set();

		return new Promise((resolve) => {
			require(['WoltLabSuite/Core/Language', 'WoltLabSuite/Core/Date/Util'], (Language, DateUtil) => {
				DateTime.Language = Language;
				DateTime.DateUtil = DateUtil;
				setInterval(DateTime.refresh, 60 * 1000);
				document.addEventListener("visibilitychange", DateTime.onVisibilityChange);
				resolve();
			});
		});
	}
};

