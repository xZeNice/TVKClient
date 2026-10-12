'use strict';

var TVK_META = {
    author: 'xZeNice',
    donateUrl: 'https://finance.ozon.ru/apps/sbp/ozonbankpay/019b2417-8720-7b4b-a781-fc891511fdad',
    donateText: 'Поддержать'
};

var TVK_SECTIONS = [
    {
        title: 'Реклама',
        features: [
            { key: 'blockAdNetworks', title: 'Рекламные сети', hint: 'Блокирует загрузку рекламы и видеорекламы', def: true },
            { key: 'hideFeedAds', title: 'Реклама в ленте', hint: 'Рекламные и промо-посты', def: true },
            { key: 'hideSidebarAds', title: 'Баннеры в меню', hint: 'Рекламный блок под левым меню', def: true },
            { key: 'hidePromoBanners', title: 'Навязчивые баннеры', hint: 'VK Pay, Donut, привязка телефона, советы', def: true },
            { key: 'hideMusicPromo', title: 'Промо в музыке', hint: 'Предложения подписки в аудио', def: true }
        ]
    },
    {
        title: 'Лента',
        features: [
            { key: 'hideRecommendations', title: 'Рекомендации', hint: 'Подборки, «Возможные друзья», сообщества', def: false },
            { key: 'hideStories', title: 'Истории', hint: 'Блок историй над лентой', def: false },
            { key: 'hidePostingBlock', title: 'Блок «Что у вас нового»', hint: 'Создание поста, клипа, статьи', def: false }
        ]
    },
    {
        title: 'Приватность',
        features: [
            { key: 'blockTrackers', title: 'Анти-трекинг', hint: 'Метрика, пиксели, счётчики', def: false },
            { key: 'blockRead', title: 'Не читать сообщения', hint: 'Собеседник не увидит, что вы прочитали', def: false },
            { key: 'blockTyping', title: 'Скрыть «печатает…»', hint: 'Собеседник не увидит набор текста', def: false },
            { key: 'directLinks', title: 'Прямые ссылки', hint: 'Без перехода через away.php', def: false }
        ]
    },
    {
        title: 'Интерфейс',
        features: [
            { key: 'hideStatusEmojis', title: 'Эмодзи-статусы', hint: 'Скрыть значки у имён', def: false },
            { key: 'fixSidebar', title: 'Закрепить меню', hint: 'Левое меню не уезжает при прокрутке', def: false }
        ]
    }
];

var TVK_CSS = {
    "hideFeedAds": [
        "[data-ad-view]",
        ".wall_item > .wi_body > .ads_mark",
        ".post:has(.wall_marked_as_ads)",
        "._post:has(.wall_marked_as_ads)",
        "article:has(.ads_mark)",
        "[class^=\"_ads_block_data_w\"]",
        "article:has([data-role=\"disclaimer\"])",
        "article:has([class*=\"PostAdDisclaimer\"])",
        "article:has([data-ad-data])",
        "article:has([data-promo-post-hash])",
        "article:has(a[href*=\"r0.mail.ru/redir\"])",
        "article:has(img[src*=\"yabs\"])",
        "article:has(img[src*=\"adfox\"])",
        "article:has(img[src*=\"get-direct\"])"
    ],
    "hideSidebarAds": [
        "#ads_left",
        "[id^=\"ads_left\"]",
        "#ads_with_extra",
        ".ads_ads_box",
        ".ads_ad_box"
    ],
    "hidePromoBanners": [
        "#settings_ps_promo_big_banner_container",
        "#settings_vkpay_promo_big_banner_container",
        ".settings_vkpay_promo_banner_link_a",
        ".stories_feed_preview_item.story_feed_new_item_promo",
        ".ReplyBoxDonut",
        "#react_rootCheckValidationPhone",
        ".group_settings_advice"
    ],
    "hideMusicPromo": [
        ".audio_subscribe_promo",
        ".audio_promo",
        ".CatalogBlock__subscription",
        ".CatalogSection__rightColumn > .CatalogSection__stickyColumn .CatalogBlock__separator",
        ".CatalogSection__my .CatalogSection__rightColumn > .CatalogSection__stickyColumn > .CatalogBlock:last-child"
    ],
    "hideRecommendations": [
        "article:has([data-testid*=\"recommendationblockheader\"])",
        "[data-testid*=\"recommended\"]",
        ".vkitRecommendationBlock__blockGroupPadding--YPN51",
        ".wall_item.feedAssistance",
        ".wall_item.post_exploreBait",
        ".wall_item.post_withExtraHeader",
        ".apps_feedRightAppsBlock",
        "#friends_right_blocks_root",
        "section:has([title=\"Популярное\"])",
        "section:has([aria-label*=\"Популярное\"])"
    ],
    "hideStories": [
        "[data-testid=\"stories_feed\"]",
        "[data-testid=\"story_card_stories\"]",
        "[data-testid=\"story-create\"]",
        "a[data-type=\"story_card_stories\"]",
        ".stories_feed_wrap",
        ".stories_block",
        ".Stories__root",
        ".StoriesFeed__root",
        ".StoryBlock__noIslandsContainer--PQXwt"
    ],
    "hidePostingBlock": [
        "[data-testid=\"feed_publish_block\"]",
        "[data-testid=\"posting_create_post_button\"]",
        "[data-testid=\"posting_create_clip_button\"]",
        "[data-testid=\"posting_create_article_button\"]"
    ],
    "hideStatusEmojis": [
        ".StatusIcon--size-14",
        ".image_status__status",
        ".PostHeaderTitle__imageStatus",
        "[data-testid=\"user-image-status\"]"
    ]
};

var TVK_FIXED_SIDEBAR_CSS = "#layout_sidebar{position:sticky!important;top:45px;max-height:calc(100vh - 70px);overflow-y:auto;z-index:100}";

var TVK_AD_RULES = ["||adfox.ru^", "||doubleclick.net^", "||googleadservices.com^", "||ads.vk.com^", "||ads-api.vk.com^", "||ads.vk.ru^", "||mytarget.ru^", "||target.my.com^", "||ads.mail.ru^", "||ad.mail.ru^", "||advmaker.ru^", "||an.yandex.ru^", "||banner.yandex.ru^", "/ads_rotate", "al_video.php?act=ads_stat", "||r.mradx.net^", "||adriver.ru^", "||adhigh.net^", "||buzzoola.com^", "||betweendigital.com^", "||otm-r.com^", "||getintent.com^", "||hybrid.ai^", "||googlesyndication.com^", "||adservice.google.com^", "||imasdk.googleapis.com^", "||yandex.ru/ads/", "||yastatic.net/partner-code"];

var TVK_TRACKER_RULES = ["||vk.com/rtrg", "||vk.ru/rtrg", "||top-fwz1.mail.ru^", "||top.mail.ru^", "||mc.yandex.ru^", "||appmetrica.yandex.ru^", "||google-analytics.com^", "||googletagmanager.com^", "||facebook.com/tr", "||analytics.tiktok.com^", "||stats.vk-portal.net^", "||tns-counter.ru^", "||scorecardresearch.com^"];

var TVK_MESSENGER = {"read": ["messages.markAsRead", "act=a_mark_read"], "typing": ["messages.setActivity", "act=a_activity"]};

var TVK_DEFAULTS = { enabled: true, stopWords: '', theme: 'auto' };
TVK_SECTIONS.forEach(function (s) {
    s.features.forEach(function (f) { TVK_DEFAULTS[f.key] = f.def; });
});
