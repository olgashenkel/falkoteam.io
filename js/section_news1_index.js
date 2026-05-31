const NEWS1_DATA_PATH = 'json/section_news1_index.json'; 

// Асинхронная функция для загрузки JSON-файла
async function loadNews1Data() {
    const grid = document.getElementById('news1-grid');
    if (!grid) return;

    grid.innerHTML = '<div class="news1-spinner">Загрузка...</div>';

    try {
        const response = await fetch(NEWS1_DATA_PATH);
        
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.status}`);
        }
        
        const news1Items = await response.json();
        renderNews1Short(news1Items, grid);
    } catch (error) {
        console.error('Не удалось загрузить новости:', error);
        grid.innerHTML = '<p class="news1-empty">Не удалось загрузить новости.</p>';
    }
}

// функция для защиты от XSS
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;'); // ИСПРАВЛЕНО: синтаксис и замена на безопасный код
}

// Валидация URL для защиты от javascript: и vbscript:
function safeURL(url) {
    if (!url) return '#';
    const trimmed = url.trim().toLowerCase();
    if (trimmed.startsWith('javascript:') || trimmed.startsWith('vbscript:')) {
        return '#';
    }
    return url;
}

// Функция отрисовки карточек в DOM
function renderNews1Short(news1Items, grid) {
    if (!Array.isArray(news1Items) || news1Items.length === 0) {
        grid.innerHTML = '<p class="news1-empty">Новости временно недоступны.</p>';
        return;
    }

    const htmlContent = news1Items.map(item => {
        const safeItem = item || {}; 
        const link = safeURL(safeItem.url);
        
        return `
        <a href="${escapeHTML(link)}" class="news1-card" rel="noopener noreferrer">
          <div class="news1-card__image-wrap">
            <img src="${escapeHTML(safeItem.image || '')}" alt="${escapeHTML(safeItem.alt || '')}" class="news1-card__image" loading="lazy">
          </div>
          <div class="news1-card__content">
            <div class="news1-card__header">
              <h3 class="news1-card__title">${escapeHTML(safeItem.title || 'Без названия')}</h3>
            </div>
            <p class="news1-card__text">${escapeHTML(safeItem.text || '')}</p>
          </div>
        </a>
        `;
    }).join('');

    grid.innerHTML = htmlContent;
}

// Запуск при полной загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNews1Data);
} else {
    loadNews1Data();
}
