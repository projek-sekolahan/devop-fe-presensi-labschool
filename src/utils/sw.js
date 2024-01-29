const cacheName = "labschool-unesa";
const preCache = ["/"];

self.addEventListener("install", (e) => {
	console.log("service worker installed");
	e.waitUntil(
		(async () => {
			const cache = await caches.open(cacheName);
			cache.addAll(preCache);
		})()
	);
});
self.addEventListener("activate", () => {
	console.log("service worker ready");
});
// self.addEventListener("install", () => {
//     console.log("service worker installed")
// })
// self.addEventListener("install", () => {
//     console.log("service worker installed")
// })
