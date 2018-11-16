self.addEventListener("fetch", event => {
  if (event.request.method === "POST") {
    return;
  }
  if (event.request.url.indexOf("/api/") !== -1) {
    return;
  }

  event.respondWith(
    caches.open("cache").then(cache => {
      return cache.match(event.request).then(response => {
        var fetchPromise = fetch(event.request).then(networkResponse => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        return response || fetchPromise;
      });
    })
  );
});
