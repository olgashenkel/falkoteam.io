const CSS_PATH = 'css/style.css';
const CSS_PATH_HEADER = 'css/header.css';
const CSS_PATH_HEADER_MOBILE = 'css/media_mobile.css';


class SiteHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({
      mode: 'open'
    });
    this.handleScroll = this.handleScroll.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this); // Привязка контекста для удаления слушателей

  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
    <link rel="stylesheet" href="${CSS_PATH}">
    <link rel="stylesheet" href="${CSS_PATH_HEADER}">
    <link rel="stylesheet" href="${CSS_PATH_HEADER_MOBILE}" media="screen and (max-width: 425px)">

    <header id="header" class="header">
      <div class="header-menu" id="navbar">
        <div class="header-menu__navbar left">
          <div>
            <a class="header-menu__logo" href="#">
              <picture>
                <source media="(max-width: 425px)" srcset="image/header/title_header_mobile.png">
                <img class="header-menu__imglogo" src="image/header/title_header.png" alt="Falko Taekwondo Team">
              </picture>
            </a>
          </div>
        </div>
        
        <div class="header-menu__navbar right">
          <div class="header-menu__nav-item">
            <a href="#">
              <img class="header-menu__img-nav-item" src="image/header/magnifier_icon.png" alt="Поиск на сайте">
            </a>
          </div>
          <div class="header-menu__nav-item">
            <a href="#">
              <img class="header-menu__img-nav-item" src="image/header/profile_icon.png" alt="Профиль">
            </a>
          </div>
          <div class="header-menu__nav-item">
            <button class="header-menu__burger" id="burgerMenu" aria-label="Открыть меню">
              <span class="header-menu__burger line"></span>
              <span class="header-menu__burger line"></span>
              <span class="header-menu__burger line"></span>
            </button>

            <nav class="header-menu__burger_side-menu">
              <ul>
                <li><a href="/">Главная</a></li>
                <li><a href="#">Новости</a></li>
                <li><a href="#">О тхэквондо</a></li>
                <li><a href="#">Достижения</a></li>
                <li><a href="#">Расписание, адреса залов</a></li>
                <li><a href="#">Контакты</a></li>
              </ul>
            </nav>
            <div class="header-menu__burger_menu-overlay"></div>
          </div>
        </div>
      </div>
    </header>
    `;

    this.initMenu();
    window.addEventListener('scroll', this.handleScroll, {
      passive: true
    }); // passive увеличивает плавность скролла
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.handleScroll);
    this.removeMenuListeners(); // Удаление слушателей для предотвращения утечек памяти
  }

  handleScroll() {
    const navbar = this.shadowRoot.getElementById('navbar');
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
  }

  toggleMenu() {
    const burgerMenu = this.shadowRoot.getElementById('burgerMenu');
    const sideMenu = this.shadowRoot.querySelector('.header-menu__burger_side-menu');
    const overlay = this.shadowRoot.querySelector('.header-menu__burger_menu-overlay');

    if (burgerMenu && sideMenu && overlay) {
      burgerMenu.classList.toggle('active');
      sideMenu.classList.toggle('active');
      overlay.classList.toggle('active');
    }
  }

  initMenu() {
    const burgerMenu = this.shadowRoot.getElementById('burgerMenu');
    const overlay = this.shadowRoot.querySelector('.header-menu__burger_menu-overlay');
    const menuLinks = this.shadowRoot.querySelectorAll('.header-menu__burger_side-menu a');

    if (!burgerMenu || !overlay) return;

    // Используем правильный метод класса, привязанный через bind()
    burgerMenu.addEventListener('click', this.toggleMenu);
    overlay.addEventListener('click', this.toggleMenu);
    menuLinks.forEach(link => link.addEventListener('click', this.toggleMenu));
  }

  removeMenuListeners() {
    const burgerMenu = this.shadowRoot.getElementById('burgerMenu');
    const overlay = this.shadowRoot.querySelector('.header-menu__burger_menu-overlay');
    const menuLinks = this.shadowRoot.querySelectorAll('.header-menu__burger_side-menu a');

    if (burgerMenu) burgerMenu.removeEventListener('click', this.toggleMenu);
    if (overlay) overlay.removeEventListener('click', this.toggleMenu);
    if (menuLinks) menuLinks.forEach(link => link.removeEventListener('click', this.toggleMenu));
  }
}

customElements.define('site-header', SiteHeader);