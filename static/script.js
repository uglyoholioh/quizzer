document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('upload-btn');
    const sampleBtn = document.getElementById('sample-btn');
    const fileInput = document.getElementById('file-input');
    const uploadSection = document.getElementById('upload-section');
    const quizSection = document.getElementById('quiz-section');
    const errorMessage = document.getElementById('error-message');

    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackDiv = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');
    const explanationText = document.getElementById('explanation-text');
    const nextBtn = document.getElementById('next-btn');

    const resultsSection = document.getElementById('results-section');
    const questionContainer = document.getElementById('question-container');
    const scoreSpan = document.getElementById('score');
    const totalQuestionsSpan = document.getElementById('total-questions');
    const restartBtn = document.getElementById('restart-btn');

    // Navigation & Settings Elements
    const navHome = document.getElementById('nav-home');
    const navHistory = document.getElementById('nav-history');
    const navSettings = document.getElementById('nav-settings');
    const settingsSection = document.getElementById('settings-section');
    const historySection = document.getElementById('history-section');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    const timerInput = document.getElementById('timer-input');
    const shuffleQuestionsCheckbox = document.getElementById('shuffle-questions');
    const shuffleOptionsCheckbox = document.getElementById('shuffle-options');
    const lightModeToggle = document.getElementById('light-mode-toggle');

    // New UI Elements
    const progressBar = document.getElementById('progress-bar');
    const currentQuestionNum = document.getElementById('current-question-num');
    const totalQuestionsCount = document.getElementById('total-questions-count');
    const currentScoreSpan = document.getElementById('current-score');
    const fileNameSpan = document.getElementById('file-name');
    const timeLeftSpan = document.getElementById('time-left');

    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timerInterval;
    let currentQuizName = "Unknown Quiz";

    // Default Settings
    let quizSettings = {
        timeLimit: 60,
        shuffleQuestions: false,
        shuffleOptions: false,
        lightMode: false
    };

    // Load settings from local storage if available
    const storedSettings = localStorage.getItem('devQuizSettings');
    if (storedSettings) {
        quizSettings = JSON.parse(storedSettings);
        applySettingsToUI();
    }

    function applySettingsToUI() {
        timerInput.value = quizSettings.timeLimit;
        shuffleQuestionsCheckbox.checked = quizSettings.shuffleQuestions;
        shuffleOptionsCheckbox.checked = quizSettings.shuffleOptions;
        lightModeToggle.checked = quizSettings.lightMode;
        if (quizSettings.lightMode) {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
    }

    // Navigation Logic
    function switchSection(sectionId) {
        uploadSection.classList.add('hidden');
        quizSection.classList.add('hidden');
        resultsSection.classList.add('hidden');
        settingsSection.classList.add('hidden');
        historySection.classList.add('hidden');

        document.getElementById(sectionId).classList.remove('hidden');

        // Update active nav link
        navHome.classList.remove('active');
        navHistory.classList.remove('active');
        navSettings.classList.remove('active');

        if (sectionId === 'upload-section' || sectionId === 'results-section') {
             navHome.classList.add('active');
        } else if (sectionId === 'settings-section') {
             navSettings.classList.add('active');
        } else if (sectionId === 'history-section') {
             navHistory.classList.add('active');
        }
    }

    navHome.addEventListener('click', () => {
        if (quizSection.classList.contains('hidden')) {
             switchSection('upload-section');
        } else {
             // If quiz is active, maybe warn? For now just go to upload/home
             if(confirm("Quit current quiz?")) {
                 clearInterval(timerInterval);
                 switchSection('upload-section');
             }
        }
    });

    navHistory.addEventListener('click', () => {
        clearInterval(timerInterval);
        renderHistory();
        switchSection('history-section');
    });

    navSettings.addEventListener('click', () => {
        clearInterval(timerInterval); // Pause/Stop timer when leaving quiz
        switchSection('settings-section');
    });

    saveSettingsBtn.addEventListener('click', () => {
        quizSettings.timeLimit = parseInt(timerInput.value, 10) || 60;
        quizSettings.shuffleQuestions = shuffleQuestionsCheckbox.checked;
        quizSettings.shuffleOptions = shuffleOptionsCheckbox.checked;
        quizSettings.lightMode = lightModeToggle.checked;

        if (quizSettings.lightMode) {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }

        localStorage.setItem('devQuizSettings', JSON.stringify(quizSettings));
        switchSection('upload-section');
    });

    // File input change handler
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileNameSpan.textContent = e.target.files[0].name;
            currentQuizName = e.target.files[0].name;
        } else {
            fileNameSpan.textContent = "No file chosen";
            currentQuizName = "Unknown Quiz";
        }
    });

    uploadBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (!file) {
            errorMessage.textContent = "Please select a file first.";
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        // Simple loading state
        uploadBtn.textContent = "Loading...";
        uploadBtn.disabled = true;

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            uploadBtn.textContent = "Start Quiz";
            uploadBtn.disabled = false;

            if (data.error) {
                errorMessage.textContent = data.error;
            } else {
                currentQuestions = data.quiz_data;
                startQuiz();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            uploadBtn.textContent = "Start Quiz";
            uploadBtn.disabled = false;
            errorMessage.textContent = "An error occurred while uploading the file.";
        });
    });

    sampleBtn.addEventListener('click', () => {
        sampleBtn.textContent = "Loading...";
        sampleBtn.disabled = true;

        fetch('/sample-quiz')
        .then(response => response.json())
        .then(data => {
            sampleBtn.textContent = "Try Sample Quiz";
            sampleBtn.disabled = false;

            if (data.error) {
                errorMessage.textContent = data.error;
            } else {
                currentQuestions = data.quiz_data;
                currentQuizName = "Sample Quiz";
                fileNameSpan.textContent = currentQuizName;
                startQuiz();
            }
        })
        .catch(error => {
             console.error('Error:', error);
             sampleBtn.textContent = "Try Sample Quiz";
             sampleBtn.disabled = false;
             errorMessage.textContent = "Could not load sample quiz.";
        });
    });

    let sessionQuestions = [];

    function startQuiz() {
        if (!currentQuestions || currentQuestions.length === 0) {
            errorMessage.textContent = "The quiz file is empty or invalid.";
            return;
        }

        // Clone questions to avoid mutating original data
        sessionQuestions = JSON.parse(JSON.stringify(currentQuestions));

        // Apply Shuffle Questions Setting
        if (quizSettings.shuffleQuestions) {
             // Fisher-Yates Shuffle
             for (let i = sessionQuestions.length - 1; i > 0; i--) {
                 const j = Math.floor(Math.random() * (i + 1));
                 [sessionQuestions[i], sessionQuestions[j]] = [sessionQuestions[j], sessionQuestions[i]];
             }
        }

        currentQuestionIndex = 0;
        score = 0;

        uploadSection.classList.add('hidden');
        resultsSection.classList.add('hidden');
        settingsSection.classList.add('hidden');
        quizSection.classList.remove('hidden');
        questionContainer.classList.remove('hidden');

        // Initialize UI stats
        totalQuestionsCount.textContent = sessionQuestions.length;
        currentScoreSpan.textContent = 0;

        showQuestion();
    }

    function updateProgress() {
        const progress = ((currentQuestionIndex) / sessionQuestions.length) * 100;
        progressBar.style.width = `${progress}%`;
        currentQuestionNum.textContent = currentQuestionIndex + 1;
        currentScoreSpan.textContent = score;
    }

    function startTimer() {
        clearInterval(timerInterval);
        let timeLeft = quizSettings.timeLimit;
        timeLeftSpan.textContent = timeLeft;

        timerInterval = setInterval(() => {
            timeLeft--;
            timeLeftSpan.textContent = timeLeft;

            if (timeLeft <= 10) {
                 timeLeftSpan.parentElement.style.color = "#dc2626"; // Red warning
            } else {
                 timeLeftSpan.parentElement.style.color = "inherit";
            }

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                handleTimeout();
            }
        }, 1000);
    }

    function handleTimeout() {
         const question = sessionQuestions[currentQuestionIndex];

         const buttons = optionsContainer.querySelectorAll('.option-btn');
         buttons.forEach(btn => btn.disabled = true);

         feedbackText.textContent = "Time's Up!";
         feedbackText.style.color = "#dc2626";
         document.getElementById('feedback-icon').textContent = "⏰";
         feedbackDiv.style.borderColor = "#ef4444";

         explanationText.innerHTML = marked.parse(question.explanation);
         feedbackDiv.classList.remove('hidden');
         nextBtn.classList.remove('hidden');

         if (currentQuestionIndex === sessionQuestions.length - 1) {
             nextBtn.textContent = "Finish Quiz";
         } else {
             nextBtn.textContent = "Next Question ➝";
         }

         // Highlight the correct answer
         buttons.forEach(btn => {
             // We use dataset.optionValue because buttons might be shuffled
             if (btn.dataset.optionValue === question.answer) {
                 btn.classList.add('correct');
             }
         });

         feedbackDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
         hljs.highlightAll();
    }

    function showQuestion() {
        updateProgress();
        const question = sessionQuestions[currentQuestionIndex];

        // Parse markdown for question text
        questionText.innerHTML = marked.parse(question.question);

        optionsContainer.innerHTML = '';
        feedbackDiv.classList.add('hidden');
        nextBtn.classList.add('hidden');
        nextBtn.textContent = "Next Question ➝";

        // Randomize options if setting is enabled
        let displayOptions = question.options.map((opt, index) => ({ opt, originalIndex: index }));
        if (quizSettings.shuffleOptions) {
            displayOptions = displayOptions.sort(() => Math.random() - 0.5);
        }

        displayOptions.forEach(item => {
            const option = item.opt;
            const btn = document.createElement('button');
            btn.dataset.optionValue = option;
            // Parse markdown for options (incase they contain code or formatting)
            btn.innerHTML = marked.parseInline(option);
            btn.classList.add('option-btn');
            btn.addEventListener('click', () => selectOption(option, question.answer, question.explanation));
            optionsContainer.appendChild(btn);
        });

        // Apply syntax highlighting
        hljs.highlightAll();

        startTimer();
    }

    function selectOption(selected, correct, explanation) {
        clearInterval(timerInterval); // Stop timer

        // Disable all buttons
        const buttons = optionsContainer.querySelectorAll('.option-btn');
        buttons.forEach(btn => btn.disabled = true);

        const isCorrect = selected === correct;

        const feedbackIcon = document.getElementById('feedback-icon');

        if (isCorrect) {
            score++;
            feedbackText.textContent = "Correct Answer!";
            feedbackText.style.color = "#059669"; // Green 600
            feedbackIcon.textContent = "✅";
            feedbackDiv.style.borderColor = "#10b981";
        } else {
            feedbackText.textContent = `Incorrect`;
            feedbackText.style.color = "#dc2626"; // Red 600
            feedbackIcon.textContent = "❌";
            feedbackDiv.style.borderColor = "#ef4444";
        }

        currentScoreSpan.textContent = score; // Real-time score update

        // Parse markdown for explanation
        explanationText.innerHTML = marked.parse(explanation);
        feedbackDiv.classList.remove('hidden');
        nextBtn.classList.remove('hidden');

        if (currentQuestionIndex === currentQuestions.length - 1) {
             nextBtn.textContent = "Finish Quiz";
        } else {
             nextBtn.textContent = "Next Question ➝";
        }

        // Scroll to feedback
        feedbackDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Apply syntax highlighting to explanation
        hljs.highlightAll();

        // Highlight selected and correct answers
        const question = sessionQuestions[currentQuestionIndex];
        buttons.forEach(btn => {
             const btnValue = btn.dataset.optionValue;
             if (btnValue === correct) {
                 btn.classList.add('correct');
             }
             if (btnValue === selected && !isCorrect) {
                 btn.classList.add('incorrect');
             }
        });
    }

    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < sessionQuestions.length) {
            showQuestion();
        } else {
            showResults();
        }
    });

    function showResults() {
        questionContainer.classList.add('hidden');
        quizSection.classList.add('hidden'); // Hide the entire quiz section including stats
        resultsSection.classList.remove('hidden');

        scoreSpan.textContent = score;
        totalQuestionsSpan.textContent = sessionQuestions.length;

        const percentage = (score / sessionQuestions.length) * 100;
        document.querySelector('.score-circle').style.setProperty('--score-pct', percentage);

        const message = document.getElementById('score-message');
        if (percentage >= 80) message.textContent = "Great job! You're ready for the finals! 🎉";
        else if (percentage >= 50) message.textContent = "Good effort, but keep practicing! 💪";
        else message.textContent = "Don't give up! Study the explanations and try again. 📚";

        saveToHistory(score, sessionQuestions.length, percentage);
    }

    function saveToHistory(score, total, percentage) {
        const history = JSON.parse(localStorage.getItem('devQuizHistory') || '[]');
        const newEntry = {
            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            score: score,
            total: total,
            percentage: Math.round(percentage),
            fileName: currentQuizName
        };

        // Add to beginning
        history.unshift(newEntry);

        // Keep only last 20
        if (history.length > 20) history.pop();

        localStorage.setItem('devQuizHistory', JSON.stringify(history));
    }

    function renderHistory() {
        const historyList = document.getElementById('history-list');
        const history = JSON.parse(localStorage.getItem('devQuizHistory') || '[]');

        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<p class="empty-state">No quizzes taken yet.</p>';
            return;
        }

        history.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-info">
                    <h4>${entry.fileName}</h4>
                    <span class="history-date">${entry.date}</span>
                </div>
                <div class="history-score">
                    ${entry.score}/${entry.total} <span style="font-size: 0.8em; opacity: 0.7;">(${entry.percentage}%)</span>
                </div>
            `;
            historyList.appendChild(item);
        });
    }

    clearHistoryBtn.addEventListener('click', () => {
        if(confirm("Clear all history?")) {
            localStorage.removeItem('devQuizHistory');
            renderHistory();
        }
    });

    restartBtn.addEventListener('click', () => {
        resultsSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        errorMessage.textContent = '';
        fileInput.value = '';
        fileNameSpan.textContent = "No file chosen";
        currentQuizName = "Unknown Quiz";
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Handle global shortcuts or specific states

        // Results Page: Enter to Restart
        if (!resultsSection.classList.contains('hidden')) {
            if (e.key === 'Enter') {
                restartBtn.click();
            }
            return;
        }

        // Quiz Active
        if (!quizSection.classList.contains('hidden') && !questionContainer.classList.contains('hidden')) {
            // If Feedback is visible, Enter -> Next
            if (!feedbackDiv.classList.contains('hidden')) {
                if (e.key === 'Enter') {
                    nextBtn.click();
                }
                return;
            }

            // If Feedback is NOT visible, Numbers -> Select Option
            const key = e.key;
            if (['1', '2', '3', '4'].includes(key)) {
                const index = parseInt(key) - 1;
                const buttons = optionsContainer.querySelectorAll('.option-btn');
                if (buttons[index] && !buttons[index].disabled) {
                    buttons[index].click();
                }
            }
        }
    });
});
