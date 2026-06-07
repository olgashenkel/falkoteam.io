/* Скрипт детального просмотра новости
Этот скрипт смотрит на адресную строку браузера (например, ?id=news_001), находит нужную новость в JSON, отрисовывает её полный текст (fullText), строит галерею изображений, если передан массив images, и автоматически разворачивает под ней блок комментариев.

Этот скрипт выполняет всю работу: парсит JSON, защищает от XSS, подставляет заглушки при отсутствии полей, а в конце — динамически создает тег <script> с точными параметрами репозитория Giscus, привязывая обсуждения к pathname (адресу) новости
*/

const NEWS1_DATA_PATH = 'json/section_news1_index.json';
const DEFAULT_IMAGE = 'image/content/new1_content/default.jpg';

async function loadSingleNews() {
    const titleEl = document.getElementById('single-title');
    const dateEl = document.getElementById('single-date');
    const contentEl = document.getElementById('single-content');
    const galleryEl = document.getElementById('single-gallery');

    if (!titleEl || !contentEl) return;

    // 1. Получаем ID новости из параметров URL-строки браузера
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');

    if (!newsId) {
        renderError('Новость не указана');
        return;
    }

    try {
        const response = await fetch(NEWS1_DATA_PATH);
        if (!response.ok) throw new Error('Ошибка чтения данных');
        const newsItems = await response.json();

        // 2. Ищем новость с совпадающим ID
        const currentNews = newsItems.find(item => item.id === newsId);

        if (!currentNews) {
            renderError('Публикация не найдена или удалена');
            return;
        }

        // 3. Валидация и отрисовка текстовых данных с заглушками
        titleEl.textContent = currentNews.title && currentNews.title.trim() ? currentNews.title : 'Новость FalkoTeam';
        if (dateEl) dateEl.textContent = currentNews.date && currentNews.date.trim() ? currentNews.date : '';
        
        // Превращаем переносы строк \n в HTML-теги <br> для красоты текста
        const rawFullText = currentNews.fullText || currentNews.text || 'Текст публикации отсутствует.';
        contentEl.innerHTML = rawFullText.replace(/\n/g, '<br>');

        // 4. Отрисовка галереи картинок (проверка на массивы и одиночные изображения)
        let imageList = [];
        if (Array.isArray(currentNews.images) && currentNews.images.length > 0) {
            imageList = currentNews.images;
        } else if (currentNews.image && currentNews.image.trim()) {
            imageList = [currentNews.image];
        } else {
            imageList = [DEFAULT_IMAGE]; // Заглушка, если картинок нет вообще
        }

        if (galleryEl) {
            galleryEl.innerHTML = imageList.map(imgSrc => `
                <img src="${imgSrc}" style="max-width:100%; height:300px; object-fit:cover; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);" alt="Иллюстрация">
            `).join('');
        }

        // 5. Динамическое подключение Giscus комментариев через GitHub
        initGiscus();

    } catch (error) {
        console.error(error);
        renderError('Не удалось загрузить текст новости');
    }
}

function renderError(message) {
    document.getElementById('single-title').textContent = 'Ошибка';
    document.getElementById('single-content').innerHTML = `<p style="color:red; text-align:center;">${message}</p>`;
}

// Функция динамической сборки и внедрения скрипта Giscus в DOM
function initGiscus() {
    const commentsContainer = document.querySelector('.giscus-comments-wrap');
    if (!commentsContainer) return;

    const giscusScript = document.createElement('script');
    giscusScript.src = "https://giscus.app/client.js";
    
    // Переносим все уникальные параметры из разметки
    giscusScript.setAttribute('data-repo', 'olgashenkel/falkoteam.io');
    giscusScript.setAttribute('data-repo-id', 'R_kgDOSqZCdQ');
    giscusScript.setAttribute('data-category', 'Announcements');
    giscusScript.setAttribute('data-category-id', 'DIC_kwDOSqZCdc4C-sR3');
    giscusScript.setAttribute('data-mapping', 'pathname'); // Привязка обсуждения к URL конкретной новости
    giscusScript.setAttribute('data-strict', '0');
    giscusScript.setAttribute('data-reactions-enabled', '1');
    giscusScript.setAttribute('data-emit-metadata', '0');
    giscusScript.setAttribute('data-input-position', 'top');
    giscusScript.setAttribute('data-theme', 'light');
    giscusScript.setAttribute('data-lang', 'ru');
    giscusScript.setAttribute('crossorigin', 'anonymous');
    giscusScript.async = true;

    // Вставляем скрипт внутрь контейнера комментариев
    commentsContainer.appendChild(giscusScript);
}

// Безопасный запуск при полной готовности DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSingleNews);
} else {
    loadSingleNews();
}
