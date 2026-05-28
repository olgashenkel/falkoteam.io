const JSON_NEW_FACTS = './new_facts.json';

const track = document.getElementById('track');
const dotsContainer = document.getElementById('dotsContainer');

let currentIndex = 1; // Начинаем с 1 из-за клона в начале
let slidesData = [];
let isTransitioning = false;
let autoPlayTimer = null; // Переменная для хранения таймера

// 1. Загрузка данных из JSON
async function loadCarousel() {
  try {
    const response = await fetch(`${JSON_NEW_FACTS}`);
    if (!response.ok) throw new Error('Ошибка при чтении JSON');
    slidesData = await response.json();

    if (slidesData.length > 0) {
      renderCarousel();
      renderDots();
      updateDots();
      startAutoPlay(); // Запускаем автоматическое переключение
    }
  } catch (error) {
    console.error(error);
  }
}

// 2. Сборка структуры через методы DOM (оригиналы + клоны)
function renderCarousel() {
// Очищаем контейнер перед добавлением новых элементов
  track.textContent = ''; 

  const firstClone = slidesData[0];
  const lastClone = slidesData[slidesData.length - 1];
  const finalSlides = [lastClone, ...slidesData, firstClone];

  // Создаем фрагмент для оптимизации вставки в DOM
  const fragment = document.createDocumentFragment();

  finalSlides.forEach(slide => {
    const slideDiv = document.createElement('div');
    slideDiv.classList.add('carousel-slide');

    const img = document.createElement('img');
    img.src = slide.image;
    img.alt = slide.title;

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('slide-content');

    const h2 = document.createElement('h2');
    h2.textContent = slide.title;

    const p = document.createElement('p');
    p.textContent = slide.desc;

    contentDiv.appendChild(h2);
    contentDiv.appendChild(p);
    slideDiv.appendChild(img);
    slideDiv.appendChild(contentDiv);

    fragment.appendChild(slideDiv);
  });

  track.appendChild(fragment);
  updatePositionWithoutAnimation();
}

// 3. Создание точек с помощью DOM-методов и навешивание событий
function renderDots() {
  dotsContainer.textContent = '';

  const fragment = document.createDocumentFragment();

  slidesData.forEach((_, index) => {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    
    // Рассчитываем целевой индекс для функции клика
    const targetIndex = index + 1;
    dot.addEventListener('click', () => handleDotClick(targetIndex));

    fragment.appendChild(dot);
  });

  dotsContainer.appendChild(fragment);
}

// 4. Обновление активной точки
function updateDots() {
  const dots = document.querySelectorAll('.dot');
  if (dots.length === 0) return;

  dots.forEach(dot => dot.classList.remove('active'));

  let dotIndex = currentIndex - 1;
  if (currentIndex === slidesData.length + 1) dotIndex = 0;
  if (currentIndex === 0) dotIndex = slidesData.length - 1;

  dots[dotIndex].classList.add('active');
}

// 5. Функции перемещения ленты
function moveTrack() {
  track.style.transition = "transform 0.5s ease-in-out";
  track.style.transform = `translateX(-${currentIndex * 100}%)`;
  updateDots();
}

function updatePositionWithoutAnimation() {
  track.style.transition = "none";
  track.style.transform = `translateX(-${currentIndex * 100}%)`;
}

// 6. Управление таймером автопрокрутки
function startAutoPlay() {
  stopAutoPlay(); // Очищаем старый таймер на всякий случай
  autoPlayTimer = setInterval(() => {
    changeSlide(1);
  }, 7000); // 7000 миллисекунд
}

function stopAutoPlay() {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
  }
}

// 7. Переключение кнопками стрелок (с перезапуском таймера)
function handleNavClick(direction) {
  if (isTransitioning) return;
  stopAutoPlay(); // Останавливаем автопрокрутку при ручном действии
  changeSlide(direction);
  startAutoPlay(); // Запускаем заново с чистыми 10 секундами
}

function changeSlide(direction) {
  if (isTransitioning) return;
  isTransitioning = true;

  currentIndex += direction;
  moveTrack();
}

// 8. Клик по точке (с перезапуском таймера)
function handleDotClick(targetIndex) {
  if (isTransitioning || currentIndex === targetIndex) return;
  isTransitioning = true;

  stopAutoPlay(); // Сбрасываем таймер
  currentIndex = targetIndex;
  moveTrack();
  startAutoPlay(); // Перезапускаем таймер
}

// 9. Обработка бесшовного перемещения после конца анимации
track.addEventListener('transitionend', () => {
  isTransitioning = false;

  if (currentIndex === slidesData.length + 1) {
    currentIndex = 1;
    updatePositionWithoutAnimation();
  }

  if (currentIndex === 0) {
    currentIndex = slidesData.length;
    updatePositionWithoutAnimation();
  }
});

// Слушатели для стрелок с обработчиком ручного клика
document.getElementById('nextBtn').addEventListener('click', () => handleNavClick(1));
document.getElementById('prevBtn').addEventListener('click', () => handleNavClick(-1));

// Инициализация
loadCarousel();