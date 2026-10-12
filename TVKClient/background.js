'use strict';
importScripts('settings.js');

const LEGACY_KEYS = {
    disableAds: ['blockAdNetworks', 'hideFeedAds', 'hideSidebarAds', 'hidePromoBanners', 'hideMusicPromo'],
    antiTracking: ['blockTrackers'],
    smartFeed: ['hideRecommendations'],
    disableTyping: ['blockTyping'],
    disableRead: ['blockRead'],
    vkDirectLinks: ['directLinks'],
    removeStatusEmojis: ['hideStatusEmojis'],
    feedStopWords: ['stopWords']
};

async function migrate() {
    const old = await chrome.storage.sync.get(Object.keys(LEGACY_KEYS));
    const patch = {};
    for (const [oldKey, newKeys] of Object.entries(LEGACY_KEYS)) {
        if (oldKey in old) newKeys.forEach(k => { patch[k] = old[oldKey]; });
    }
    if (Object.keys(patch).length) {
        await chrome.storage.sync.set(patch);
        await chrome.storage.sync.remove(Object.keys(old));
    }
}

async function syncRulesets() {
    const s = await chrome.storage.sync.get(TVK_DEFAULTS);
    const on = id => s.enabled && (id === 'ads' ? s.blockAdNetworks : s.blockTrackers);
    const ids = ['ads', 'trackers'];
    await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ids.filter(on),
        disableRulesetIds: ids.filter(id => !on(id))
    });
}

chrome.runtime.onInstalled.addListener(() => migrate().then(syncRulesets));
chrome.runtime.onStartup.addListener(syncRulesets);
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && ('enabled' in changes || 'blockAdNetworks' in changes || 'blockTrackers' in changes)) {
        syncRulesets();
    }
});
