# Interactive Quiz Generator ⚡

Welcome to **DevQuiz**, a modern web application designed to help you practice coding concepts through interactive quizzes. This tool transforms simple text files into a beautiful, functional quiz experience with code highlighting, explanations, and progress tracking.

Whether you're studying for a final exam or just brushing up on your skills, DevQuiz makes it easy.

---

## 🚀 Getting Started (Beginner's Guide)

Follow these steps to get the program running on your computer.

### 1. Prerequisites
Before you start, make sure you have **Python** installed.
- **Check if you have Python**: Open your terminal (Command Prompt on Windows, Terminal on Mac/Linux) and type:
  ```bash
  python --version
  ```
  (Or `python3 --version`). If you see a version number (like `Python 3.10.0`), you are good to go!
- **If not installed**: Download it from [python.org](https://www.python.org/downloads/).

### 2. Installation
It is recommended to use a "virtual environment" to keep your project clean.

**Step A: Open your terminal in the project folder.**

**Step B: Create a virtual environment.**
- **Windows**:
  ```bash
  python -m venv venv
  ```
- **Mac/Linux**:
  ```bash
  python3 -m venv venv
  ```

**Step C: Activate the environment.**
- **Windows**:
  ```bash
  venv\Scripts\activate
  ```
- **Mac/Linux**:
  ```bash
  source venv/bin/activate
  ```
*(You should see `(venv)` appear at the start of your command line.)*

**Step D: Install the required tools.**
Run this command to install Flask (the web server):
```bash
pip install -r requirements.txt
```

### 3. Running the App
Once installed, you can start the program anytime with:

```bash
python app.py
```

You will see output that looks like `Running on http://127.0.0.1:5000`.
Open your web browser (Chrome, Firefox, Safari) and go to that address:
👉 **http://127.0.0.1:5000**

---

## 🎮 How to Use

### 🏠 Home Screen
- **Upload Quiz Data**: If you have your own quiz file (JSON format), click "Choose File" and then "Start Quiz".
- **Try Sample Quiz**: Don't have a file yet? Click **"Try Sample Quiz"** to load a built-in set of practice questions immediately.

### ⚙️ Settings
Click the **Settings** button in the top right to customize your experience:
- **Timer Duration**: Change how many seconds you have per question.
- **Shuffle Questions**: Randomize the order of questions.
- **Shuffle Options**: Randomize the order of answers (A, B, C, D).
- **Light Mode / Dark Mode**: Toggle between the "Cyber Dark" and "Tech Light" themes to suit your preference.

*Note: Settings are saved automatically for your next visit!*

### 📝 Creating Your Own Quiz
You can write your own quizzes using a simple text file format called JSON.
Create a file named `my_quiz.json` and paste this structure:

```json
[
  {
    "id": 1,
    "question": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "answer": "Paris",
    "explanation": "Paris is the capital of France."
  },
  {
    "id": 2,
    "question": "Which Python keyword defines a function?",
    "options": ["func", "def", "function", "define"],
    "answer": "def",
    "explanation": "The `def` keyword is used in Python."
  }
]
```
- **Markdown**: You can use Markdown in your questions (e.g., `**bold**`, `` `code` ``) for better formatting.

---

## ❓ Troubleshooting

- **"Command not found"**: Ensure Python is added to your system PATH during installation.
- **"No module named flask"**: Make sure you activated your virtual environment (Step 2C) and ran the install command (Step 2D).
- **Browser won't connect**: Ensure the terminal window where you ran `python app.py` is still open and running.

---

## 🛠 Tech Stack
- **Backend**: Python (Flask)
- **Frontend**: HTML5, CSS3, JavaScript
- **Styling**: Custom CSS with Glassmorphism
- **External Libraries**: `marked.js` (Markdown), `highlight.js` (Syntax Highlighting)
