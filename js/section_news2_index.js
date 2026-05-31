const NEWS2_DATA_PATH = 'json/section_news2_index.json'; 

// Асинхронная функция для загрузки JSON-файла
async function loadNews2Data() {
    const grid = document.getElementById('news2-grid'); 
    if (!grid) return;

    // Включаем обновленный индикатор загрузки
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

// Функция для защиты от XSS 
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;'); 
}

// Функция инициализации Intersection Observer для мобильных устройств
function initMobileScrollAnimation() {
    const cards = document.querySelectorAll('.news2-card'); 
    if (!cards.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.35 // Срабатывает, когда 35% карточки появилось на экране смартфона
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, observerOptions);

    cards.forEach(card => observer.observe(card));
}



// Валидация URL для защиты от XSS через javascript: и vbscript:
function safeURL2(url) {
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


function renderNews2Short(news2Items, grid) {
    if (!Array.isArray(news2Items) || news2Items.length === 0) {
        grid.innerHTML = '<p class="news2-empty">Новости временно недоступны.</p>';
        return;
    }

    const htmlContent2 = news2Items.map(item => {
        const safeItem2 = item || {}; 
        const link2 = safeURL2(safeItem2.url);
        
        return `
        <a href="${escapeHTML(link2)}" class="news2-card" rel="noopener noreferrer">
          <div class="news2-card__image-wrap">
            <img src="${escapeHTML(safeItem2.image || '')}" alt="${escapeHTML(safeItem2.alt || '')}" class="news2-card__image" loading="lazy">
          </div>
          <div class="news2-card__content">
            <div class="news2-card__header">
              <h3 class="news2-card__title">${escapeHTML(safeItem2.title || 'Без названия')}</h3>
            </div>
            <p class="news2-card__text">${escapeHTML(safeItem2.text || '')}</p>
          </div>
        </a>
        `;
    }).join('');

    grid.innerHTML = htmlContent2;
    // Включаем слежку за скроллом на смартфонах
    initMobileScrollAnimation();
    
}


// Запуск при полной загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNews2Data);
} else {
    loadNews2Data();
}

