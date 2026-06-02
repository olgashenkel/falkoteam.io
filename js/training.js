document.addEventListener('DOMContentLoaded', () => {
    /* 
    ==========================================================================
    ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ВКЛАДОК (TABS)
    ========================================================================== */
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

    /* ТРЕНАЖЕР 1: ЗОНЫ НАНЕСЕНИЯ УДАРОВ */
    const zoneData = {
        head: {
            title: "🔵 Атака в голову (Электронный шлем)",
            allowed: "Разрешено атаковать исключительно ногами. Любые удары руками запрещены.",
            points: "3 балла — за точный технический удар; 5 баллов — за удар с вращением (в прыжке с разворота).",
            penalty: "Удар кулаком в лицо карается немедленным объявлением 'Гам-джом' (штрафной балл сопернику)."
        },
        torso: {
            title: "🔴 Атака в корпус (Электронный жилет)",
            allowed: "Разрешено атаковать как кулаками, так и стопами в область, закрытую защитным протектором.",
            points: "1 балл — за мощный пробивающий удар кулаком; 2 балла — за стандартный удар ногой; 4 балла — за удар с вращением.",
            penalty: "Удары ниже пояса, захваты экипировки или удары в область позвоночника запрещены регламентом соревнований WT."
        },
        illegal: {
            title: "🚫 Запрещенная зона (Ниже уровня пояса)", 
            allowed: "Атаки в эту область полностью запрещены. Нельзя бить по ногам, коленям или в область паха.",
            points: "0 баллов — набранные очки за удары в запрещенные зоны не засчитываются автоматической электронной системой.",
            penalty: "Рефери останавливает бой и выносит штрафной балл 'Гам-джом' нарушителю. Сопернику начисляется +1 балл."
        }
    };

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

            infoBox.style.borderLeftColor = borderColors[zoneKey];
            infoBox.innerHTML = `
                <h4 style="margin: 0 0 15px 0; font-size: 20px; color: #2b2d42; font-weight: 800;">${data.title}</h4>
                <p style="margin: 8px 0; font-size: 14px;"><strong style="color: #495057;">Разрешенная техника:</strong> ${data.allowed}</p>
                <p style="margin: 8px 0; font-size: 14px; color: #155724;"><strong style="color: #155724;">Оценка судей:</strong> ${data.points}</p>
                <p style="margin: 8px 0; font-size: 14px; color: #721c24;"><strong style="color: #721c24;">Нарушения:</strong> ${data.penalty}</p>
            `;
        });
    });

/* ТРЕНАЖЕР 2: ИГРА-СОПОСТАВЛЕНИЕ ТЕРМИНОВ */
    const words = [
        { ko: "Чаpёт (Charyeot)", ru: "Команда: «Внимание!»" },
        { ko: "Кёнэ (Kyeonge)", ru: "Команда: «Поклон!»" },
        { ko: "Чунби (Chunbi)", ru: "Команда: «Готовность!»" },
        { ko: "Сидзак (Sijak)", ru: "Команда: «Начать бой!»" },
        { ko: "Додян (Dojang)", ru: "Спортивный зал для тренировок" }
    ];

    let selectedKoBtn = null;
    let matchedCount = 0;
    let isProcessing = false;

    const koColumn = document.getElementById('korean-column');
    const ruColumn = document.getElementById('russian-column');
    const gameStatus = document.getElementById('game-status');
    const restartWrapper = document.getElementById('restart-wrapper');
    const restartBtn = document.getElementById('restart-btn');

    // Функция честного перемешивания Фишера-Йетса
    function shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function initGame() {
        // 1. Безопасная проверка: если главных колонок нет, сразу выходим
        if (!koColumn || !ruColumn) return;

        // 2. Очищаем колонки от старых кнопок
        koColumn.innerHTML = '';
        ruColumn.innerHTML = '';
        
        // 3. Безопасно очищаем статус и скрываем обертку кнопки перезапуска
        if (gameStatus) {
            gameStatus.innerHTML = '';
            gameStatus.classList.remove('fade-in');
        }
        if (restartWrapper) {
            restartWrapper.style.display = 'none';
            restartWrapper.classList.remove('fade-in');
        }
        
        // 4. Сбрасываем состояние игры
        selectedKoBtn = null;
        matchedCount = 0;
        isProcessing = false;

        // 5. ИСПРАВЛЕНО: Теперь используется честная функция shuffle для перемешивания списков
        const shuffledKo = shuffle(words);
        const shuffledRu = shuffle(words);

        // 6. Генерация корейских кнопок
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
            });
            koColumn.appendChild(btn);
        });

        // 7. Генерация русских кнопок
        shuffledRu.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'game-btn';
            btn.textContent = item.ru;
            btn.dataset.match = item.ko;
            btn.addEventListener('click', () => {
                if (isProcessing || btn.classList.contains('matched')) return;
                if (!selectedKoBtn) {
                    btn.classList.add('error-pulse');
                    setTimeout(() => btn.classList.remove('error-pulse'), 500);
                    return;
                }

                // Успешное сопоставление
                if (btn.dataset.match === selectedKoBtn.dataset.value) {
                    btn.classList.add('matched');
                    selectedKoBtn.classList.add('matched');
                    selectedKoBtn.classList.remove('selected');
                    selectedKoBtn = null;
                    matchedCount++;

                    // Проверка победы
                    if (matchedCount === words.length) {
                        if (gameStatus) {
                            gameStatus.innerHTML = "🎉 Поздравляем! Вы идеально освоили базовые команды тренера!";
                            gameStatus.classList.add('fade-in');
                        }
                        if (restartWrapper) {
                            restartWrapper.style.display = 'block';
                            restartWrapper.classList.add('fade-in');
                        }
                    }
                }
                // Ошибка сопоставления
                else {
                    isProcessing = true;
                    btn.classList.add('error');
                    selectedKoBtn.classList.add('error');
                    selectedKoBtn.classList.remove('selected');
                    setTimeout(() => {
                        btn.classList.remove('error');
                        selectedKoBtn.classList.remove('error');
                        selectedKoBtn = null;
                        isProcessing = false;
                    }, 600);
                }
            });
            ruColumn.appendChild(btn);
        });
    }

    // Запуск игры
    if (koColumn && ruColumn) {
        initGame();
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', initGame);
    }
});
