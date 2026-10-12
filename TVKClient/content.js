(() => {
    'use strict';

    const AD_LABEL = /^(реклама|рекламная запись|промо|sponsored|advertisement|ad)(\s*[·•]?\s*\d{1,2}\+)?$/i;
    const POST = 'article, ._post, .post[data-post-id]';
    const COMMENTS = '.replies, [class*="Comment"], [class*="Reply"]';
    const MAX_LABEL_CANDIDATES = 300;
    const HIDE_ATTR = 'data-tvk-hide';
    const CHECKED_ATTR = 'data-tvk-checked';

    let settings = { ...TVK_DEFAULTS };
    let stopWords = [];
    let scanScheduled = false;
    let ready = false;
    const style = document.createElement('style');
    style.id = 'tvk-style';

    const isOn = key => settings.enabled && settings[key];

    const renderCss = () => {
        let css = `[${HIDE_ATTR}]{display:none!important}`;
        for (const [key, selectors] of Object.entries(TVK_CSS)) {
            if (isOn(key)) css += `\n${selectors.join(',')}{display:none!important}`;
        }
        if (isOn('fixSidebar')) css += `\n${TVK_FIXED_SIDEBAR_CSS}`;
        style.textContent = css;
        if (!style.isConnected) document.documentElement.appendChild(style);
    };

    const hasAdLabel = post => {
        let checked = 0;
        for (const el of post.querySelectorAll('span, a, div')) {
            if (el.childElementCount || el.closest(COMMENTS)) continue;
            const text = el.textContent.trim();
            if (text.length < 30 && AD_LABEL.test(text)) return true;
            if (++checked > MAX_LABEL_CANDIDATES) break;
        }
        return !!post.querySelector('a[href*="utm_source=vk_ads"]');
    };

    const checkPost = post => {
        post.setAttribute(CHECKED_ATTR, '');
        if (post.parentElement?.closest(POST)) return;
        try {
            if (isOn('hideFeedAds') && hasAdLabel(post)) {
                post.setAttribute(HIDE_ATTR, 'ad');
            } else if (settings.enabled && stopWords.length) {
                const text = post.textContent.toLowerCase();
                if (stopWords.some(w => text.includes(w))) post.setAttribute(HIDE_ATTR, 'stop-word');
            }
        } catch {}
    };

    const toDirectLink = a => {
        try {
            const url = new URL(a.href);
            if (url.pathname !== '/away.php') return;
            const target = new URL(url.searchParams.get('to'));
            if (target.protocol !== 'http:' && target.protocol !== 'https:') return;
            if (!a.dataset.tvkOrig) a.dataset.tvkOrig = a.getAttribute('href');
            a.href = target.href;
            a.rel = 'noreferrer noopener';
            a.removeAttribute('onclick');
        } catch {}
    };

    const scan = () => {
        scanScheduled = false;
        if (!ready) return;
        if (!style.isConnected) document.documentElement.appendChild(style);
        document.querySelectorAll(`:is(${POST}):not([${CHECKED_ATTR}])`).forEach(checkPost);
        if (isOn('directLinks')) document.querySelectorAll('a[href*="away.php"]').forEach(toDirectLink);
    };

    const scheduleScan = () => {
        if (scanScheduled) return;
        scanScheduled = true;
        requestAnimationFrame(scan);
    };

    const resetDom = () => {
        document.querySelectorAll(`[${CHECKED_ATTR}]`).forEach(el => el.removeAttribute(CHECKED_ATTR));
        document.querySelectorAll(`[${HIDE_ATTR}]`).forEach(el => el.removeAttribute(HIDE_ATTR));
        if (!isOn('directLinks')) {
            document.querySelectorAll('a[data-tvk-orig]').forEach(a => {
                a.setAttribute('href', a.dataset.tvkOrig);
                delete a.dataset.tvkOrig;
            });
        }
    };

    const syncMainWorld = () => {
        window.postMessage({
            source: 'tvk-isolated',
            read: isOn('blockRead') ? TVK_MESSENGER.read : [],
            typing: isOn('blockTyping') ? TVK_MESSENGER.typing : []
        }, '*');
    };

    const apply = next => {
        ready = true;
        settings = { ...TVK_DEFAULTS, ...next };
        stopWords = settings.stopWords.split(',').map(w => w.trim().toLowerCase()).filter(Boolean);
        renderCss();
        syncMainWorld();
        resetDom();
        scheduleScan();
    };

    const onMutations = records => {
        for (const { target } of records) {
            let post = target.nodeType === 1 ? target.closest(POST) : null;
            while (post?.parentElement?.closest(POST)) post = post.parentElement.closest(POST);
            if (post?.hasAttribute(CHECKED_ATTR) && !post.hasAttribute(HIDE_ATTR)) post.removeAttribute(CHECKED_ATTR);
        }
        scheduleScan();
    };

    window.addEventListener('message', e => {
        if (e.source === window && e.data?.source === 'tvk-main') syncMainWorld();
    });

    chrome.storage.sync.get(TVK_DEFAULTS, apply);
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'sync') return;
        const next = { ...settings };
        for (const [key, { newValue }] of Object.entries(changes)) next[key] = newValue ?? TVK_DEFAULTS[key];
        apply(next);
    });

    renderCss();
    new MutationObserver(onMutations).observe(document, { childList: true, subtree: true });
})();
