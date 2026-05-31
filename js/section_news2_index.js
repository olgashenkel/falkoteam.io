const NEWS2_DATA_PATH = 'json/section_news2_index.json'; 

// Глобальная переменная для хранения экземпляра наблюдателя
let news2Observer = null;

// Экранирование HTML-символов 
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;'); 
}

// Валидация URL на стороне клиента 
function sanitizeURL(url) {
    if (!url) return '#';
    const trimmed = url.trim();
    
    // Блокируем протокол javascript и ссылки вида //javascript:
    if (/^(javascript|data|vbscript):/i.test(trimmed) || /^\/\/+javascript/i.test(trimmed)) {
        return '#';
    }

    if ((trimmed.startsWith('/') && !trimmed.startsWith('//')) || trimmed.startsWith('.')) {
        return trimmed;
    }

    try {
        const parsed = new URL(trimmed, window.location.origin);
        if (['http:', 'https:'].includes(parsed.protocol)) { 
            return parsed.href;
        }
        return '#';
    } catch (e) {
        return '#'; 
    }
}

// Асинхронная функция для загрузки JSON-файла
async function loadNews2Data() {
    const grid = document.getElementById('news2-grid'); 
    if (!grid) return;

    grid.innerHTML = '<div class="news2-spinner">Загрузка...</div>';

    try {
        const response = await fetch(NEWS2_DATA_PATH);
        
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.status}`);
        }
        
        const news2Items = await response.json();
        renderNews2Short(news2Items, grid);
    } catch (error) {
        console.error('Не удалось загрузить новости:', error);
        grid.innerHTML = '<p class="news2-empty">Не удалось загрузить новости.</p>';
    }
}

// Инициализация Intersection Observer
function initMobileScrollAnimation() {
    if (news2Observer) {
        news2Observer.disconnect();
    }

    const cards = document.querySelectorAll('.news2-card'); 
    if (!cards.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.4 
    };

    news2Observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                news2Observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    cards.forEach(card => news2Observer.observe(card));
}

// Отрисовка карточек
function renderNews2Short(news2Items, grid) {
    if (!Array.isArray(news2Items) || news2Items.length === 0) {
        grid.innerHTML = '<p class="news2-empty">Новости временно недоступны.</p>';
        return;
    }

    const htmlContent = news2Items.map(item => {
        const url = escapeHTML(sanitizeURL(item.url));
        const image = escapeHTML(sanitizeURL(item.image));
        
        const title = escapeHTML(item.title || 'Без названия');
        const alt = escapeHTML(item.alt || title);
        const text = escapeHTML(item.text || '');

        const imageTag = (image !== '#') 
            ? `<img src="${image}" alt="${alt}" class="news2-card__image" loading="lazy">` 
            : '';

        return `
            <a href="${url}" class="news2-card" aria-label="${alt}">
              <div class="news2-card__image-wrap">
                ${imageTag}
              </div>
              <div class="news2-card__content">
                <div class="news2-card__header">
                  <h3 class="news2-card__title">${title}</h3>
                </div>
                <p class="news2-card__text">${text}</p>
              </div>
            </a>
        `;
    }).join('');

    grid.innerHTML = htmlContent;

    requestAnimationFrame(initMobileScrollAnimation);
}

// Запуск процесса
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNews2Data);
} else {
    loadNews2Data();
}
