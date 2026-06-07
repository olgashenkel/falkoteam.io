/* Скрипт для страницы Архива
Идентичен скрипту (section_news1_index.js), но выгружает абсолютно весь список новостей без ограничения в 6 штук. 
*/

const NEWS1_DATA_PATH = 'json/section_news1_index.json';
const DEFAULT_IMAGE = 'image/content/new1_content/default.jpg';

async function loadArchiveData() {
    const grid = document.getElementById('archive-news-grid');
    if (!grid) return;
    grid.innerHTML = '<div class="news1-spinner">Загрузка архива...</div>';
    
    try {
        const response = await fetch(NEWS1_DATA_PATH);
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        const newsItems = await response.json();
        renderArchive(newsItems, grid);
    } catch (error) {
        console.error(error);
        grid.innerHTML = '<p class="news1-empty">Не удалось загрузить архив новостей.</p>';
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function safeURL(url) {
    if (!url) return '#';
    const trimmedUrl = url.trim();
    if (!/^(https?:\/\/|\/|\.\/)/i.test(trimmedUrl)) {
        const sanitizedUrl = trimmedUrl.replace(/[\x00-\x20]/g, '').toLowerCase();
        if (/^(javascript|vbscript|data):/.test(sanitizedUrl)) return '#';
    }
    return trimmedUrl;
}

function renderArchive(newsItems, grid) {
    if (!Array.isArray(newsItems) || newsItems.length === 0) {
        grid.innerHTML = '<p class="news1-empty">Архив новостей пуст.</p>';
        return;
    }
    grid.innerHTML = newsItems.map(item => {
        const safeItem = item || {};
        
        // ВАЛИДАЦИЯ И ЗАГЛУШКИ
        const title = safeItem.title && safeItem.title.trim() ? safeItem.title : 'Новость FalkoTeam';
        const text = safeItem.text && safeItem.text.trim() ? safeItem.text : 'Подробности читайте на странице публикации.';
        const altText = safeItem.alt && safeItem.alt.trim() ? safeItem.alt : title;
        const date = safeItem.date && safeItem.date.trim() ? safeItem.date : '';

        let finalImage = DEFAULT_IMAGE;
        if (safeItem.image && safeItem.image.trim()) {
            finalImage = safeItem.image;
        } else if (Array.isArray(safeItem.images) && safeItem.images.length > 0 && safeItem.images[0].trim()) {
            finalImage = safeItem.images[0];
        }

        return `
            <a href="${escapeHTML(safeURL(safeItem.url))}" class="news1-card" rel="noopener noreferrer">
                <div class="news1-card__image-wrap">
                    <img src="${escapeHTML(finalImage)}" alt="${escapeHTML(altText)}" class="news1-card__image" loading="lazy">
                </div>
                <div class="news1-card__content">
                    <div class="news1-card__header">
                        <h3 class="news1-card__title">${escapeHTML(title)}</h3>
                        ${date ? `<span class="news1-card__date" style="font-size:0.8rem; opacity:0.8; font-weight:bold; text-shadow: 0 1px 2px #000;">${escapeHTML(date)}</span>` : ''}
                    </div>
                    <p class="news1-card__text">${escapeHTML(text)}</p>
                </div>
            </a>
        `;
    }).join('');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadArchiveData);
} else {
    loadArchiveData();
}