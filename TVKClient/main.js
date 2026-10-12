(() => {
    'use strict';
    if (window.__tvkMain) return;
    window.__tvkMain = true;
    const patterns = { read: [], typing: [] };

    window.addEventListener('message', e => {
        if (e.source !== window || e.data?.source !== 'tvk-isolated') return;
        patterns.read = Array.isArray(e.data.read) ? e.data.read.map(String) : [];
        patterns.typing = Array.isArray(e.data.typing) ? e.data.typing.map(String) : [];
    });
    window.postMessage({ source: 'tvk-main', ready: true }, '*');

    const isActive = () => patterns.read.length > 0 || patterns.typing.length > 0;

    const stringify = data => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        if (data instanceof URLSearchParams) return data.toString();
        if (data instanceof FormData) return [...data.entries()].map(([k, v]) => `${k}=${typeof v === 'string' ? v : ''}`).join('&');
        return '';
    };

    const shouldBlock = (url, body) => {
        if (!isActive()) return false;
        const haystack = `${url || ''}&${stringify(body)}`;
        return [...patterns.read, ...patterns.typing].some(p => haystack.includes(p));
    };

    const FAKE_BODY = '{"response":1}';
    const fakeResponse = () => new Response(FAKE_BODY, { status: 200, headers: { 'Content-Type': 'application/json' } });

    const nativeFetch = window.fetch;
    window.fetch = function (resource, init) {
        const isRequest = resource instanceof Request;
        const url = isRequest ? resource.url : String(resource);
        if (shouldBlock(url, init?.body)) return Promise.resolve(fakeResponse());
        if (isRequest && !init?.body && resource.method !== 'GET' && isActive()) {
            return resource.clone().text()
                .then(body => (shouldBlock(url, body) ? fakeResponse() : nativeFetch.apply(this, arguments)),
                      () => nativeFetch.apply(this, arguments));
        }
        return nativeFetch.apply(this, arguments);
    };

    const XHR = XMLHttpRequest.prototype;
    const nativeOpen = XHR.open;
    const nativeSend = XHR.send;
    const urls = new WeakMap();

    XHR.open = function (method, url) {
        urls.set(this, String(url));
        return nativeOpen.apply(this, arguments);
    };

    XHR.send = function (body) {
        if (!shouldBlock(urls.get(this), body)) return nativeSend.apply(this, arguments);
        const fake = { readyState: 4, status: 200, statusText: 'OK', responseText: FAKE_BODY, response: FAKE_BODY, responseURL: urls.get(this) };
        for (const [k, v] of Object.entries(fake)) Object.defineProperty(this, k, { get: () => v, configurable: true });
        this.getResponseHeader = name => (/^content-type$/i.test(name) ? 'application/json' : null);
        this.getAllResponseHeaders = () => 'content-type: application/json\r\n';
        setTimeout(() => ['readystatechange', 'load', 'loadend'].forEach(t => this.dispatchEvent(new ProgressEvent(t))), 0);
    };
})();
