import Vue from 'vue'
const Mixin = Vue.mixin({
	methods: {
		async $get(url, config = null) {
			const extrasArray = config && config.extras ? config.extras : null;
			const progress = config && config.progress ? config.progress : null;
			const traitement = config && config.traitement ? config.traitement : null;
			const limitPage = config && config.limitPage ? config.limitPage : null;
			const itemsPerPage = config && config.itemsPerPage ? config.itemsPerPage : null;
			const limit = config && config.limit ? config.limit : false;

			let data = await apiplatformGet(this, url, progress, traitement, limitPage, itemsPerPage, limit).catch(error => {
				throw error;
			});
			if (extrasArray) {
				data = extras(this, data, extrasArray);
			}
			return data;
		},
	},
});

export default {
	install(Vue, options) {
	  Vue.mixin(Mixin)
	}
  }

async function apiplatformGet(context, url, progress, traitement, limitPage, itemsPerPage, limit) {
	url = url.replace("/api", "");
	if (itemsPerPage) {
		url += (url.includes("?") ? "&" : "?") + "itemsPerPage=" + itemsPerPage
	}
	const { data } = await context.$axios.get(url).catch(error => {
		throw error;
	});
	if (!data['hydra:member']) {
		if (traitement) {
			if (Array.isArray(data)) data.forEach(traitement)
			else traitement(data)
		}
		if (progress) progress({
			data,
			current: 1,
			total: 1,
		})
		return data;
	}

	let datas = data['hydra:member'];
	if (traitement) {
		if (Array.isArray(datas)) datas.forEach(traitement)
		else traitement(datas)
	}

	if (progress) progress({
		data: datas,
		current: datas.length,
		total: (limitPage) ? datas.length : data['hydra:totalItems'],
	})

	if (!limit && data["hydra:view"] && data["hydra:view"]["hydra:next"]) {
		let first = null;
		let last = null;
		try {
			first = /[?&]page=(\d+)$/.exec(data["hydra:view"]["hydra:next"])[1];
			last = /[?&]page=(\d+)$/.exec(data["hydra:view"]["hydra:last"])[1];
			if (limitPage) last = Math.min(last, limitPage);
		} catch (error) {
			console.error("Pluggin api-platform.js / Regex / " + error);
			return null;
		}
		url = data["hydra:view"]["hydra:next"].replace("/api", "");
		const promises = [];
		for (let page = parseInt(first); page <= parseInt(last); page++) {
			url = url.replace(/([?&])page=(\d+)/, "$1page=" + page);
			const promise = context.$axios.get(url).then(value => {
				const data = value.data["hydra:member"];
				if (traitement) {
					if (Array.isArray(data)) data.forEach(traitement)
					else traitement(data)
				}
				datas = datas.concat(data);
				if (progress) progress({
					data: datas,
					current: datas.length,
					total: (limitPage === page) ? datas.length : value.data['hydra:totalItems'],
				})
			}).catch(error => {
				throw error;
			});
			promises.push(promise);
		}
		return Promise.all(promises).then(() => {
			return datas;
		});
	}
	return datas;
}

function extras(context, datas, extrasArray) {
	if (typeof extrasArray === "string") extrasArray = [extrasArray];
	if (!Array.isArray(datas)) datas = [datas];
	if (datas.length === 0) return datas;
	let promises = []
	datas.forEach((data, index) => {
		extrasArray.forEach((extra) => {
			promises = promises.concat(extrasValues(context, data, extra.split("."), "[" + index + "]"))
		});
	});

	return Promise.all(promises).then((values) => {
		values.forEach(value => {
			if (!value) return;
			// eslint-disable-next-line
			eval("datas" + value.trace + "=JSON.parse(atob('" + btoa(JSON.stringify(value.value)) + "'))");
		})
		return datas;
	});
}

function extrasValues(context, value, fields, trace) {
	if (fields.length === 0) {
		if (typeof value.replace !== 'function') return null;
		return apiplatformGet(context, value.replace('/api', '')).then((value) => {
			return {
				value,
				trace,
			}
		})
	}
	const field = fields[0];

	if (value[field] === undefined) {
		console.error("API-PLATFORM PLUGGIN: " + field + " not found", value);
		return;
	}

	value = value[field];
	if (["array", 'object'].includes(typeof value)) {
		if (value.length === 0) return;
		let promises = []
		if (typeof value.forEach !== 'function') return null;
		value.forEach((v, index) => {
			const promise = extrasValues(context, v, fields.slice(1), trace + "['" + field + "'][" + index + "]");
			if (promise) {
				if (typeof promise.then !== 'function') promises = promises.concat(promise)
				else promises.push(promise);
			}
		})
		return promises;
	} else {
		return [extrasValues(context, value, fields.slice(1), trace + "['" + field + "']")];
	}
}