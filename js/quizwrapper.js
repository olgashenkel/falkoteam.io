let quizData = [];

const quizContainer = document.getElementById('quiz-container');
const submitBtn = document.getElementById('submit-btn');
const resultBox = document.getElementById('result-box');
const resetBtn = document.getElementById('reset-btn');

submitBtn.addEventListener('click', checkAnswers);
if (resetBtn) {
    resetBtn.addEventListener('click', resetQuiz);
}

// Шаг 1: Загрузка вопросов из внешнего JSON файла
async function initQuiz() {
    try {
        const response = await fetch('json/quizwrapper.json'); 
        if (!response.ok) throw new Error('Сетевая ошибка при загрузке данных');
        
        quizData = await response.json();
        renderQuiz();
    } catch (error) {
        quizContainer.innerHTML = `<p style="color: red;">Не удалось загрузить вопросы теста: ${error.message}</p>`;
        submitBtn.style.display = 'none';
        if (resetBtn) resetBtn.style.display = 'none';
    }
}

// Шаг 2: Генерация HTML структуры теста на странице
function renderQuiz() {
    quizContainer.innerHTML = '';

    quizData.forEach((qData, qIndex) => {
        const questionBlock = document.createElement('div');
        questionBlock.classList.add('question-block');
        // Добавляем ID для удобного поиска блока вопроса при валидации
        questionBlock.id = `question-block-${qIndex}`;

        const questionTitle = document.createElement('div');
        questionTitle.classList.add('question-title');
        questionTitle.innerText = `${qIndex + 1}. ${qData.question}`;
        questionBlock.appendChild(questionTitle);

        qData.options.forEach((option, oIndex) => {
            const label = document.createElement('label');
            label.classList.add('option-label');
            label.id = `label-q${qIndex}-o${oIndex}`;

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `question-${qIndex}`;
            input.value = oIndex;
            
            // Убираем подсветку ошибки с вопроса, как только пользователь выберет вариант
            input.addEventListener('change', () => {
                questionBlock.classList.remove('question-error');
                if (resultBox.classList.contains('warning')) {
                    resultBox.classList.add('hidden');
                }
            });

            label.appendChild(input);
            label.appendChild(document.createTextNode(` ${option}`));
            questionBlock.appendChild(label);
        });

        const explanationDiv = document.createElement('div');
        explanationDiv.id = `explanation-q${qIndex}`;
        explanationDiv.classList.add('explanation-box', 'hidden');
        questionBlock.appendChild(explanationDiv);

        quizContainer.appendChild(questionBlock);
    });
}

// Шаг 3: Проверка результатов
function checkAnswers() {
    let score = 0;
    let firstUnansweredBlock = null;

    // Сбрасываем старые ошибки валидации перед новой проверкой
    quizData.forEach((_, qIndex) => {
        document.getElementById(`question-block-${qIndex}`).classList.remove('question-error');
    });

    // Проверяем, на все ли вопросы даны ответы
    quizData.forEach((_, qIndex) => {
        const selectedInput = document.querySelector(`input[name="question-${qIndex}"]:checked`);
        if (!selectedInput) {
            const qBlock = document.getElementById(`question-block-${qIndex}`);
            qBlock.classList.add('question-error'); // Подсвечиваем неотвеченный вопрос
            if (!firstUnansweredBlock) {
                firstUnansweredBlock = qBlock;
            }
        }
    });

    // ЗАМЕНА ALERT: вывод предупреждения в resultBox
    if (firstUnansweredBlock) {
        resultBox.classList.remove('hidden', 'success', 'fail');
        resultBox.classList.add('warning');
        resultBox.innerText = 'Пожалуйста, ответьте на все выделенные вопросы перед проверкой!';
        
        // Плавно скроллим к первому пропущенному вопросу
        firstUnansweredBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // Блокируем радиокнопки
    const allInputs = quizContainer.querySelectorAll('input[type="radio"]');
    allInputs.forEach(input => input.disabled = true);
    
    // Блокируем кнопку проверки
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
    submitBtn.style.cursor = 'not-allowed';

    if (resetBtn) {
        resetBtn.classList.remove('hidden');
        resetBtn.style.display = 'inline-block'; 
    }

    quizData.forEach((qData, qIndex) => {
        const correctIndex = qData.hasOwnProperty('correctIndex') ? qData.correctIndex : qData.correct;
        const selectedInput = document.querySelector(`input[name="question-${qIndex}"]:checked`);
        const userIndex = parseInt(selectedInput.value);

        const userLabel = document.getElementById(`label-q${qIndex}-o${userIndex}`);
        const correctLabel = document.getElementById(`label-q${qIndex}-o${correctIndex}`);

        if (userIndex === correctIndex) {
            score++;
            userLabel.classList.add('correct-answer');
        } else {
            userLabel.classList.add('wrong-answer');
            if (correctLabel) correctLabel.classList.add('correct-answer'); 
        }

        const explanationDiv = document.getElementById(`explanation-q${qIndex}`);
        const explanationText = qData.explanation ? qData.explanation : "Объяснение отсутствует.";
        
        explanationDiv.innerHTML = `
            <strong>Правильный ответ:</strong> ${qData.options[correctIndex]}<br>
            <strong>Объяснение:</strong> ${explanationText}
        `;
        explanationDiv.classList.remove('hidden');
    });

    const percent = Math.round((score / quizData.length) * 100);
    resultBox.classList.remove('hidden', 'success', 'fail', 'warning'); 
    
    if (percent >= 70) {
        resultBox.classList.add('success');
        resultBox.innerText = `Тест сдан! Ваш результат: ${score} из ${quizData.length} (${percent}%)`;
    } else {
        resultBox.classList.add('fail');
        resultBox.innerText = `Тест не сдан. Ваш результат: ${score} из ${quizData.length} (${percent}%)`;
    }

    resultBox.scrollIntoView({ behavior: 'smooth' });
}

// Шаг 4: Сброс теста в начальное состояние
function resetQuiz() {
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    submitBtn.style.cursor = 'pointer';

    resultBox.classList.add('hidden');
    resultBox.classList.remove('success', 'fail', 'warning');
    resultBox.innerText = '';

    quizData.forEach((_, qIndex) => {
        const inputs = quizContainer.querySelectorAll(`input[name="question-${qIndex}"]`);
        inputs.forEach(input => {
            input.checked = false;
            input.disabled = false;
        });

        const explanationDiv = document.getElementById(`explanation-q${qIndex}`);
        if (explanationDiv) {
            explanationDiv.classList.add('hidden');
            explanationDiv.innerHTML = '';
        }

        const qBlock = document.getElementById(`question-block-${qIndex}`);
        qBlock.classList.remove('question-error');
        
        const labels = qBlock.querySelectorAll('.option-label');
        labels.forEach(label => {
            label.classList.remove('correct-answer', 'wrong-answer');
        });
    });

    if (resetBtn) {
        resetBtn.classList.add('hidden');
    }

    quizContainer.scrollIntoView({ behavior: 'smooth' });
}

initQuiz();
