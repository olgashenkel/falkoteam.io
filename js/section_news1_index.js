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
        .replace(/'/g, '&#39;');
}

// Валидация URL для защиты от XSS через javascript: и vbscript:
function safeURL(url) {
    if (!url) return '#';

    const trimmedUrl = url.trim();

    // Разрешаем только относительные пути или безопасные веб-протоколы (http, https)
    // Это полностью исключает javascript:, vbscript:, data: и другие опасные схемы
    const isSafeScheme = /^(https?:\/\/|\/|\.\/)/i.test(trimmedUrl);

    // Если это не внешняя ссылка http/https и не относительный путь, проверяем на опасные схемы
    if (!isSafeScheme) {
        // Очищаем строку от невидимых управляющих символов (ASCII 0-32), которые могут использовать для обхода
        const sanitizedUrl = trimmedUrl.replace(/[\x00-\x20]/g, '').toLowerCase();
        if (/^(javascript|vbscript|data):/.test(sanitizedUrl)) {
            return '#';
        }
    }

    return trimmedUrl;
}

// Функция отрисовки карточек в DOM (с полной защитой от отсутствующих данных)

function renderNews1Short(news1Items, grid) {
    if (!Array.isArray(news1Items) || news1Items.length === 0) {
        grid.innerHTML = '<p class="news1-empty">Новости временно недоступны.</p>';
        return;
    }

    const htmlContent = news1Items.map(item => {
        const safeItem = item || {};

        const rawLink = safeItem.id ? `./article.html?id=${encodeURIComponent(safeItem.id)}` : (safeItem.url || '#');
        const link = safeURL(rawLink);

        const titleText = safeItem.title ? safeItem.title.trim() : 'Без названия';
        const bodyText = safeItem.text ? safeItem.text.trim() : '';
        const altText = safeItem.alt || titleText;

        // ИСПРАВЛЕНИЕ: Универсальное получение картинки для превью на главной
        let imageSrc = '';
        if (Array.isArray(safeItem.images) && safeItem.images.length > 0) {
            // Если это новый формат (массив) — берем самую первую картинку [0]
            imageSrc = safeItem.images[0]; 
        } else if (safeItem.image) {
            // Если это старый формат (одиночная строка) — берем её, чтобы остальные карточки не ломались
            imageSrc = safeItem.image;
        }

        return `
        <a href="${escapeHTML(link)}" class="news1-card" rel="noopener noreferrer">
          ${imageSrc ? `
          <div class="news1-card__image-wrap">
            <img src="${escapeHTML(imageSrc)}" alt="${escapeHTML(altText)}" class="news1-card__image" loading="lazy">
          </div>
          ` : ''}
          <div class="news1-card__content">
            <div class="news1-card__header">
              <h3 class="news1-card__title">${escapeHTML(titleText)}</h3>
            </div>
            ${bodyText ? `<p class="news1-card__text">${escapeHTML(bodyText)}</p>` : ''}
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