document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('upload-btn');
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

    // New UI Elements
    const progressBar = document.getElementById('progress-bar');
    const currentQuestionNum = document.getElementById('current-question-num');
    const totalQuestionsCount = document.getElementById('total-questions-count');
    const currentScoreSpan = document.getElementById('current-score');
    const fileNameSpan = document.getElementById('file-name');

    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;

    // File input change handler
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileNameSpan.textContent = e.target.files[0].name;
        } else {
            fileNameSpan.textContent = "No file chosen";
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

    function startQuiz() {
        if (!currentQuestions || currentQuestions.length === 0) {
            errorMessage.textContent = "The quiz file is empty or invalid.";
            return;
        }

        currentQuestionIndex = 0;
        score = 0;

        uploadSection.classList.add('hidden');
        resultsSection.classList.add('hidden');
        quizSection.classList.remove('hidden');
        questionContainer.classList.remove('hidden');

        // Initialize UI stats
        totalQuestionsCount.textContent = currentQuestions.length;
        currentScoreSpan.textContent = 0;

        showQuestion();
    }

    function updateProgress() {
        const progress = ((currentQuestionIndex) / currentQuestions.length) * 100;
        progressBar.style.width = `${progress}%`;
        currentQuestionNum.textContent = currentQuestionIndex + 1;
        currentScoreSpan.textContent = score;
    }

    function showQuestion() {
        updateProgress();
        const question = currentQuestions[currentQuestionIndex];

        // Parse markdown for question text
        questionText.innerHTML = marked.parse(question.question);

        optionsContainer.innerHTML = '';
        feedbackDiv.classList.add('hidden');
        nextBtn.classList.add('hidden');

        // Optional: Randomize options for better practice
        // const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);

        question.options.forEach(option => {
            const btn = document.createElement('button');
            // Parse markdown for options (incase they contain code or formatting)
            btn.innerHTML = marked.parseInline(option);
            btn.classList.add('option-btn');
            btn.addEventListener('click', () => selectOption(option, question.answer, question.explanation));
            optionsContainer.appendChild(btn);
        });

        // Apply syntax highlighting
        hljs.highlightAll();
    }

    function selectOption(selected, correct, explanation) {
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

        // Scroll to feedback
        feedbackDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Apply syntax highlighting to explanation
        hljs.highlightAll();

        // Highlight selected and correct answers
        const question = currentQuestions[currentQuestionIndex];
        buttons.forEach((btn, index) => {
             const optionOriginal = question.options[index];
             if (optionOriginal === correct) {
                 btn.classList.add('correct');
             }
             if (optionOriginal === selected && !isCorrect) {
                 btn.classList.add('incorrect');
             }
        });
    }

    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestions.length) {
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
        totalQuestionsSpan.textContent = currentQuestions.length;

        const percentage = (score / currentQuestions.length) * 100;
        document.querySelector('.score-circle').style.setProperty('--score-pct', percentage);

        const message = document.getElementById('score-message');
        if (percentage >= 80) message.textContent = "Great job! You're ready for the finals! 🎉";
        else if (percentage >= 50) message.textContent = "Good effort, but keep practicing! 💪";
        else message.textContent = "Don't give up! Study the explanations and try again. 📚";
    }

    restartBtn.addEventListener('click', () => {
        resultsSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        errorMessage.textContent = '';
        fileInput.value = '';
        fileNameSpan.textContent = "No file chosen";
    });
});
