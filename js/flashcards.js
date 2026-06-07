// Функция для создания DOM-структуры карточки
function createCardDOM(data) {
  const flashcard = document.createElement('div');
  flashcard.classList.add('flashcard');

  // Делаем карточку доступной для клавиатуры
  flashcard.setAttribute('role', 'button');
  flashcard.setAttribute('tabindex', '0');

  // Создаем лицевую сторону
  const frontSide = document.createElement('div');
  frontSide.classList.add('card-side', 'front');

  const term = document.createElement('h3');
  term.textContent = data.term || '';
  frontSide.appendChild(term);

  if (data.transcription) {
    const transcription = document.createElement('p');
    transcription.textContent = data.transcription;
    frontSide.appendChild(transcription);
  }

  if (data.hint) {
    const hint = document.createElement('span');
    hint.classList.add('hint');
    hint.textContent = data.hint;
    frontSide.appendChild(hint);
  }

  // Создаем обратную сторону
  const backSide = document.createElement('div');
  backSide.classList.add('card-side', 'back');

  const translation = document.createElement('h3');
  translation.textContent = data.translation || '';
  backSide.appendChild(translation);

  if (data.description) {
    const description = document.createElement('p');
    description.textContent = data.description;
    backSide.appendChild(description);
  }

  // Собираем карточку воедино
  flashcard.appendChild(frontSide);
  flashcard.appendChild(backSide);

  // Функция переворота
  const toggleFlip = (e) => {
    // Предотвращаем переворот, если кликнули на ссылку, кнопку или выделили текст
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
    flashcard.classList.toggle('flipped');
  };

  // События переворота (клик и клавиатура)
  flashcard.addEventListener('click', toggleFlip);
  flashcard.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // Запрещаем прокрутку страницы при нажатии пробела
      toggleFlip(e);
    }
  });

  return flashcard;
}

// Загрузка данных из JSON и рендеринг
async function initCards() {
  const container = document.getElementById('cardContainer');
  if (!container) return;

  try {
    const response = await fetch('json/flashcards.json');
    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);

    const cardsData = await response.json();

    // Очищаем контейнер безопасным способом
    container.textContent = '';

    // Используем фрагмент для оптимизации работы с DOM
    const fragment = document.createDocumentFragment();

    cardsData.forEach(data => {
      const cardElement = createCardDOM(data);
      fragment.appendChild(cardElement);
    });

    // Добавляем все карточки одной операцией
    container.appendChild(fragment);

  } catch (error) {
    console.error('Не удалось загрузить карточки:', error);
    // Для вывода ошибки создаем элемент, избегая innerHTML
    const errorMsg = document.createElement('p');
    errorMsg.style.color = 'red';
    errorMsg.textContent = 'Ошибка загрузки карточек. Попробуйте позже.';
    container.textContent = '';
    container.appendChild(errorMsg);
  }
}

// Запуск инициализации при загрузке страницы
document.addEventListener('DOMContentLoaded', initCards);