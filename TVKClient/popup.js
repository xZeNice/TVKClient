'use strict';

const $ = id => document.getElementById(id);
const storage = chrome.storage.sync;
const inputs = new Map();

function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;
    else delete root.dataset.theme;
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === theme));
}

function createRow(feature) {
    const row = document.createElement('label');
    row.className = 'row';
    row.innerHTML = `
        <span class="text"><span class="title"></span><span class="hint"></span></span>
        <span class="switch"><input type="checkbox"><span></span></span>`;
    row.querySelector('.title').textContent = feature.title;
    row.querySelector('.hint').textContent = feature.hint;
    const input = row.querySelector('input');
    input.addEventListener('change', () => { storage.set({ [feature.key]: input.checked }); updateCounters(); });
    inputs.set(feature.key, input);
    return row;
}

function renderSections() {
    for (const section of TVK_SECTIONS) {
        const group = document.createElement('section');
        group.className = 'group';
        group.innerHTML = '<h2><span></span><small></small></h2><div class="card"></div>';
        group.querySelector('h2 span').textContent = section.title;
        group.dataset.keys = section.features.map(f => f.key).join(',');
        section.features.forEach(f => group.querySelector('.card').appendChild(createRow(f)));
        $('sections').appendChild(group);
    }
}

function updateCounters() {
    document.querySelectorAll('#sections .group').forEach(group => {
        const keys = group.dataset.keys.split(',');
        const on = keys.filter(k => inputs.get(k).checked).length;
        group.querySelector('small').textContent = `${on} из ${keys.length}`;
    });
}

function applySettings(settings) {
    for (const [key, input] of inputs) input.checked = !!settings[key];
    $('enabled').checked = settings.enabled;
    $('stopWords').value = settings.stopWords;
    setEnabled(settings.enabled);
    applyTheme(settings.theme || 'auto');
    updateCounters();
}

function setEnabled(enabled) {
    $('status').querySelector('b').textContent = enabled ? 'Работает' : 'На паузе';
    document.body.classList.toggle('paused', !enabled);
}

const normalizeWords = value => value.split(',').map(w => w.trim()).filter(Boolean).join(', ');

function bindStopWords() {
    const field = $('stopWords');
    let timer;
    const save = () => { clearTimeout(timer); storage.set({ stopWords: normalizeWords(field.value) }); };
    field.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(save, 500); });
    field.addEventListener('blur', () => { field.value = normalizeWords(field.value); save(); });
}

let toastTimer;
function toast(text) {
    const el = $('toast');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

function bindModal() {
    const modal = $('modal');
    const open = () => { modal.hidden = false; requestAnimationFrame(() => modal.classList.add('open')); $('modalCancel').focus(); };
    const close = () => { modal.classList.remove('open'); setTimeout(() => { modal.hidden = true; }, 150); $('reset').focus(); };
    $('reset').addEventListener('click', open);
    $('modalCancel').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });
    $('modalConfirm').addEventListener('click', async () => {
        await storage.clear();
        applySettings(TVK_DEFAULTS);
        close();
        toast('Настройки сброшены');
    });
}

function bindTheme() {
    $('themeRow').addEventListener('click', e => {
        const btn = e.target.closest('.theme-btn');
        if (!btn) return;
        applyTheme(btn.dataset.theme);
        storage.set({ theme: btn.dataset.theme });
    });
}

function renderFooter() {
    $('version').textContent = `v${chrome.runtime.getManifest().version}`;
    document.querySelector('.credit').textContent = `by ${TVK_META.author}`;
    const donate = $('donate');
    donate.href = TVK_META.donateUrl;
    donate.textContent = TVK_META.donateText;
}

renderSections();
renderFooter();
bindStopWords();
bindModal();
bindTheme();
$('enabled').addEventListener('change', e => { setEnabled(e.target.checked); storage.set({ enabled: e.target.checked }); });

storage.get(TVK_DEFAULTS, applySettings);
