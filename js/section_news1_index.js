const NEWS_DATA_PATH = 'json/section_news1_index.json'; 

// Асинхронная функция для загрузки JSON-файла
async function loadNewsData() {
    const grid = document.getElementById('news-grid');
    if (!grid) return;

    // Включаем индикатор загрузки перед запросом
    grid.innerHTML = '<div class="news-spinner">Загрузка...</div>';

    try {
        const response = await fetch(NEWS_DATA_PATH);
        
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.status}`);
        }
        
        const newsItems = await response.json();
        renderNewsShort(newsItems, grid);
    } catch (error) {
        console.error('Не удалось загрузить новости:', error);
        grid.innerHTML = '<p class="news-empty">Не удалось загрузить новости.</p>';
    }
}

// Функция для защиты от XSS
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Функция отрисовки карточек в DOM
function renderNewsShort(newsItems, grid) {
    if (!Array.isArray(newsItems) || newsItems.length === 0) {
        grid.innerHTML = '<p class="news-empty">Новости временно недоступны.</p>';
        return;
    }

    // Очищаем spinner и выводим ВСЕ карточки из массива newsItems
    grid.innerHTML = newsItems.map(item => `
        <a href="${escapeHTML(item.url || '#')}" class="news-card">
          <div class="news-card__image-wrap">
            <img src="${escapeHTML(item.image || '')}" alt="${escapeHTML(item.alt || '')}" class="news-card__image" loading="lazy">
          </div>
          <div class="news-card__content">
            <div class="news-card__header">
              <h3 class="news-card__title">${escapeHTML(item.title || 'Без названия')}</h3>
            
            </div>
            <p class="news-card__text">${escapeHTML(item.text || '')}</p>
          </div>
        </a>
    `).join('');
}

// Запуск при полной загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    loadNewsData(); 
});
