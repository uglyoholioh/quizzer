# Interactive Quiz Generator

A web-based application that generates interactive multiple-choice quizzes from uploaded JSON files. It is designed for coding practice, featuring syntax highlighting for code snippets and Markdown support.

## Features

-   **Interactive Interface**: Modern, card-based UI with progress tracking and score feedback.
-   **Code Support**: Automatically formats and syntax-highlights code blocks in questions and explanations.
-   **Markdown Support**: Use Markdown for rich text formatting.
-   **Instant Feedback**: immediate validation of answers with explanations.

## Prerequisites

-   Python 3.x installed on your system.

## Installation

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies**:
    You need Flask to run the server.
    ```bash
    pip install flask
    ```

## How to Run

1.  **Start the application**:
    Run the following command in your terminal:
    ```bash
    python3 app.py
    ```

2.  **Access the App**:
    Open your web browser and navigate to:
    ```
    http://127.0.0.1:5000
    ```

## Usage

1.  **Prepare a Quiz JSON**: Create a `.json` file with your questions. (See structure below).
2.  **Upload**: Click "Choose File" on the homepage and select your JSON file.
3.  **Start**: Click "Start Quiz" to begin.
4.  **Take the Quiz**: Select answers, read explanations, and track your progress.

## JSON Data Format

Your JSON file should be a list of objects, each representing a question.

```json
[
  {
    "id": 1,
    "question": "What is the output of `print(10 + 5)` in Python?",
    "options": ["105", "15", "Error", "None"],
    "answer": "15",
    "explanation": "The `+` operator adds the two numbers."
  },
  {
    "id": 2,
    "question": "Identify the loop structure:\n\n```python\nfor i in range(5):\n    print(i)\n```",
    "options": ["While Loop", "For Loop", "Do-While Loop", "If Statement"],
    "answer": "For Loop",
    "explanation": "This is a standard Python `for` loop iterating over a range."
  }
]
```

## Technologies Used

-   **Backend**: Python, Flask
-   **Frontend**: HTML, CSS, JavaScript
-   **Libraries**:
    -   `marked.js` (Markdown parsing)
    -   `highlight.js` (Code syntax highlighting)
    -   `Inter` font (Google Fonts)
