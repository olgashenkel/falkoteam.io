const CSS_BUTTON = 'css/style_button_up.css';

class ScrollToTop extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({
            mode: 'open'
        });

        // Записываем разметку и подключение внешнего CSS прямо в Shadow DOM
        this.shadowRoot.innerHTML = `
      <!-- Подключаем файл стилей кнопки внутрь изолированного Shadow DOM -->
      <link rel="stylesheet" href="${CSS_BUTTON}">
      
      <!-- HTML-структура самой кнопки -->
      <button id="scrollToTop" class="scroll-to-top" aria-label="Вернуться наверх">
        <svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
      </button>
    `;

        // Находим кнопку внутри Shadow DOM (через this.shadowRoot)
        this.btn = this.shadowRoot.getElementById('scrollToTop');
        this.isScrolling = false; // Флаг для контроля анимации

        // Фиксируем контекст один раз в конструкторе
        this.checkScrollHandler = this.checkScrollHandler.bind(this);
        this.scrollToTop = this.scrollToTop.bind(this);
    }

    // Метод жизненного цикла: вызывается, когда элемент добавляется на страницу
    connectedCallback() {
        window.addEventListener('scroll', this.checkScrollHandler, { passive: true });
        this.btn.addEventListener('click', this.scrollToTop);
        
        // Сразу проверяем положение, если страница уже прокручена при загрузке
        this.checkScroll(); 
    }

    // Метод жизненного цикла: вызывается при удалении элемента (для чистоты памяти)
    disconnectedCallback() {
        window.removeEventListener('scroll', this.checkScrollHandler);
        this.btn.removeEventListener('click', this.scrollToTop);
    }

    // Оптимизированный вызов через requestAnimationFrame
    checkScrollHandler() {
        if (this.isScrolling) return;

        this.isScrolling = true;
        window.requestAnimationFrame(() => {
            this.checkScroll();
            this.isScrolling = false;
        });
    }


    // Логика проверки прокрутки (появление на 30% экрана)
    checkScroll() {
        const thirtyPercentOfScreen = window.innerHeight * 0.3;
        // Безопасное получение позиции скролла для всех браузеров
        const scrolled = window.scrollY ?? window.pageYOffset ?? document.documentElement.scrollTop;

        if (scrolled >= thirtyPercentOfScreen) {
            this.btn.classList.add('show');
        } else {
            this.btn.classList.remove('show');
        }
    }

    // Логика плавного скролла наверх
      scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

customElements.define('scroll-to-top', ScrollToTop);
