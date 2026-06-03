document.addEventListener('DOMContentLoaded', async () => {
  /*  1. ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ВКЛАДОК (TABS) */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.dataset.tab;
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  /* 2. ГЛОБАЛЬНЫЕ ДАННЫЕ И ИНИЦИАЛИЗАЦИЯ ИНТЕРФЕЙСА */
  let zoneData = {};
  let words = [];

  // DOM-элементы Тренажера 2
  const koColumn = document.getElementById('korean-column');
  const ruColumn = document.getElementById('russian-column');
  const gameStatus = document.getElementById('game-status');
  const restartWrapper = document.getElementById('restart-wrapper');
  const restartBtn = document.getElementById('restart-btn');

  // Состояние Тренажера 2
  let selectedKoBtn = null;
  let selectedRuBtn = null;
  let matchedCount = 0;
  let errorsCount = 0;
  let isProcessing = false;

  /* 3. АСИНХРОННАЯ ЗАГРУЗКА И ВАЛИДАЦИЯ JSON-ДАННЫХ */
  async function loadAllData() {
    try {
      const response = await fetch('json/training.json');
      if (!response.ok) {
        throw new Error(`Не удалось загрузить файл данных (Статус: ${response.status})`);
      }
      
      const data = await response.json();

      // --- Валидация Тренажера 1 (Зоны атаки) ---
      const validatedZones = {};
      const ZONE_FIELDS = ['title', 'allowed', 'points', 'penalty'];
      
      if (data.zones) {
        for (const [zoneKey, zoneValue] of Object.entries(data.zones)) {
          const missingFields = ZONE_FIELDS.filter(field => !(field in zoneValue));
          if (missingFields.length > 0) {
            console.warn(`[Тренажер 1] В зоне "${zoneKey}" отсутствуют поля: [${missingFields.join(', ')}]. Применены заглушки.`);
          }
          validatedZones[zoneKey] = {
            title: zoneValue.title || "⚠️ Название не указано",
            allowed: zoneValue.allowed || "Данные отсутствуют.",
            points: zoneValue.points || "Оценка отсутствует.",
            penalty: zoneValue.penalty || "Информация отсутствует."
          };
        }
      }
      zoneData = validatedZones;

      // --- Валидация Тренажера 2 (Словарь терминов) ---
      if (!data.dictionary || !Array.isArray(data.dictionary)) {
        throw new Error("[Тренажер 2] Секция 'dictionary' отсутствует или не является массивом");
      }

      // Фильтруем элементы словаря: пропускаем только те, где есть заполненные 'ko' и 'ru'
      words = data.dictionary.filter((item, index) => {
        const hasKo = 'ko' in item && typeof item.ko === 'string' && item.ko.trim() !== '';
        const hasRu = 'ru' in item && typeof item.ru === 'string' && item.ru.trim() !== '';
        
        if (!hasKo || !hasRu) {
          console.warn(`[Тренажер 2] Элемент под индексом ${index} пропущен: отсутствует поле 'ko' или 'ru'.`);
          return false;
        }
        return true;
      });

      if (words.length === 0) {
        throw new Error("[Тренажер 2] Не найдено ни одного валидного термина для игры.");
      }

    } catch (error) {
      console.error("Критическая ошибка конфигурации приложения:", error.message);
    }
  }

  // Сначала дожидаемся полной загрузки и проверки конфигурационного файла
  await loadAllData();

  /* 4. ЛОГИКА ТРЕНАЖЕРА 1: ЗОНЫ НАНЕСЕНИЯ УДАРОВ */
  const svgZones = document.querySelectorAll('.hit-zone');
  const infoBox = document.getElementById('zone-info-box');

  svgZones.forEach(zone => {
    zone.addEventListener('click', () => {
      const zoneKey = zone.dataset.zone;
      const data = zoneData[zoneKey];
      if (!infoBox || !data) return;

      const borderColors = {
        head: '#0056b3',
        torso: '#e63946',
        illegal: '#ffb703'
      };

      infoBox.style.borderLeftColor = borderColors[zoneKey] || '#ccc';
      infoBox.innerHTML = `
        <h4 style="margin: 0 0 15px 0; font-size: 20px; color: #2b2d42; font-weight: 800;">${data.title}</h4>
        <p style="margin: 8px 0; font-size: 14px;"><strong style="color: #495057;">Разрешенная техника:</strong> ${data.allowed}</p>
        <p style="margin: 8px 0; font-size: 14px; color: #155724;"><strong style="color: #155724;">Оценка судей:</strong> ${data.points}</p>
        <p style="margin: 8px 0; font-size: 14px; color: #721c24;"><strong style="color: #721c24;">Нарушения:</strong> ${data.penalty}</p>
      `;
    });
  });

  /* 5. ЛОГИКА ТРЕНАЖЕРА 2: ИГРА-СОПОСТАВЛЕНИЕ ТЕРМИНОВ */
  // Функция честного перемешивания Фишера-Йетса
  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Функция для сопоставления выбранных кнопок
  function checkMatch(koBtn, ruBtn) {
    isProcessing = true;

    // Успешное совпадение парных значений
    if (ruBtn.dataset.match === koBtn.dataset.value) {
      koBtn.classList.remove('selected');
      ruBtn.classList.remove('selected');
      
      koBtn.classList.add('matched');
      ruBtn.classList.add('matched');
      
      selectedKoBtn = null;
      selectedRuBtn = null;
      matchedCount++;
      isProcessing = false;

      // Проверка условия победы
      if (matchedCount === words.length) {
        if (gameStatus) {
          let scoreMessage = '';
          if (errorsCount === 0) {
            scoreMessage = `<br><span style="color: #155724; font-size: 16px; font-weight: 600;">🏆 Идеально! Вы не совершили ни одной ошибки!</span>`;
          } else {
            scoreMessage = `<br><span style="color: #721c24; font-size: 16px; font-weight: 600;">Сделано ошибок: ${errorsCount}. Попробуйте еще раз, чтобы улучшить результат!</span>`;
          }

          gameStatus.innerHTML = `🎉 Поздравляем! Вы освоили базовые команды тренера! ${scoreMessage}`;
          gameStatus.classList.add('fade-in');
        }
        if (restartWrapper) {
          restartWrapper.style.display = 'block';
          restartWrapper.classList.add('fade-in');
        }
      }
    } 
    // Ошибка сопоставления (элементы выбраны неверно)
    else {
      koBtn.classList.add('error');
      ruBtn.classList.add('error');
      koBtn.classList.remove('selected');
      ruBtn.classList.remove('selected');

      errorsCount++; // Инкремент счетчика промахов

      setTimeout(() => {
        koBtn.classList.remove('error');
        ruBtn.classList.remove('error');
        selectedKoBtn = null;
        selectedRuBtn = null;
        isProcessing = false;
      }, 600);
    }
  }

  // Генерация игрового поля и перемешивание списков
  function initGame() {
    if (!koColumn || !ruColumn || words.length === 0) return;

    koColumn.innerHTML = '';
    ruColumn.innerHTML = '';

    if (gameStatus) {
      gameStatus.innerHTML = '';
      gameStatus.classList.remove('fade-in');
    }
    if (restartWrapper) {
      restartWrapper.style.display = 'none';
      restartWrapper.classList.remove('fade-in');
    }

    selectedKoBtn = null;
    selectedRuBtn = null;
    matchedCount = 0;
    errorsCount = 0;
    isProcessing = false;

    const shuffledKo = shuffle(words);
    const shuffledRu = shuffle(words);

    // Генерация корейских кнопок (Левая колонка)
    shuffledKo.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'game-btn';
      btn.textContent = item.ko;
      btn.dataset.value = item.ko;
      
      btn.addEventListener('click', () => {
        if (isProcessing || btn.classList.contains('matched')) return;

        const currentActive = koColumn.querySelector('.selected');
        if (currentActive) currentActive.classList.remove('selected');
        
        btn.classList.add('selected');
        selectedKoBtn = btn;

        // Если правая колонка уже имеет выбранную кнопку — запускаем сопоставление
        if (selectedRuBtn) {
          checkMatch(selectedKoBtn, selectedRuBtn);
        }
      });
      koColumn.appendChild(btn);
    });

    // Генерация русских кнопок (Правая колонка)
    shuffledRu.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'game-btn';
      btn.textContent = item.ru;
      btn.dataset.match = item.ko;
      
      btn.addEventListener('click', () => {
        if (isProcessing || btn.classList.contains('matched')) return;

        const currentActive = ruColumn.querySelector('.selected');
        if (currentActive) currentActive.classList.remove('selected');
        
        btn.classList.add('selected');
        selectedRuBtn = btn;

        // Если левая колонка уже имеет выбранную кнопку — запускаем сопоставление
        if (selectedKoBtn) {
          checkMatch(selectedKoBtn, selectedRuBtn);
        }
      });
      ruColumn.appendChild(btn);
    });
  }

  // Первичный запуск игры при загрузке документа
  if (koColumn && ruColumn) {
    initGame();
  }
  
  // Привязка обработчика перезапуска к кнопке
  if (restartBtn) {
    restartBtn.addEventListener('click', initGame);
  }
});
