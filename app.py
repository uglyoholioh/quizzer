from flask import Flask, render_template, request, jsonify
import json
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configure Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def validate_quiz_data(content):
    if not isinstance(content, list):
        return 'JSON must be a list of questions'

    for item in content:
        if 'type' not in item:
            item['type'] = 'multiple_choice' # Default

        q_type = item['type']

        if 'question' not in item or 'explanation' not in item:
             return 'Each question must have question and explanation fields'

        if q_type == 'multiple_choice':
            if 'options' not in item or 'answer' not in item:
                return 'Multiple choice questions need options and answer'
            if not isinstance(item['options'], list):
                return 'Options must be a list'

        elif q_type == 'open_ended':
            if 'answer' not in item:
                return 'Open ended questions need a model answer'

        elif q_type == 'matching':
            if 'pairs' not in item:
                return 'Matching questions need pairs'
            if not isinstance(item['pairs'], dict):
                return 'Pairs must be a dictionary'

    return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    data = request.json
    prompt_text = data.get('prompt')
    user_api_key = data.get('apiKey') # allow client-side key

    if not prompt_text:
        return jsonify({'error': 'No prompt provided'}), 400

    api_key = user_api_key if user_api_key else GEMINI_API_KEY

    if not api_key:
         # Fallback Mock for Demo if no key provided
         return jsonify({'quiz_data': [
            {
                "type": "multiple_choice",
                "question": "This is a MOCK response because no Gemini API Key was found. What is the capital of Mars?",
                "options": ["Red City", "Phobos", "Olympus Mons", "None"],
                "answer": "None",
                "explanation": "Mars has no capital."
            },
            {
                "type": "open_ended",
                "question": "Explain why this is a mock.",
                "answer": "Because the API key is missing.",
                "explanation": "Without an API Key, we cannot contact Gemini."
            },
            {
                 "type": "matching",
                 "question": "Match the entities",
                 "pairs": {"AI": "Gemini", "Search": "Google", "Social": "YouTube"},
                 "explanation": "Google owns these."
            }
         ], 'note': 'Mock Data Used'}), 200

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')

        system_prompt = """
        You are a quiz generator. Generate a quiz based on the user's prompt.
        Output PURE JSON only. No markdown formatting.
        The output must be a list of question objects.

        Supported question types: 'multiple_choice', 'open_ended', 'matching'.

        Schema per type:
        1. Multiple Choice:
           {"type": "multiple_choice", "question": "...", "options": ["A", "B", "C", "D"], "answer": "Correct Option String", "explanation": "..."}

        2. Open Ended:
           {"type": "open_ended", "question": "...", "answer": "Model Answer", "explanation": "..."}

        3. Matching:
           {"type": "matching", "question": "...", "pairs": {"Key1": "Val1", "Key2": "Val2"}, "explanation": "..."}

        Generate 5 varied questions (mix of types if appropriate, but mostly what fits the prompt).
        """

        response = model.generate_content(f"{system_prompt}\n\nUser Prompt: {prompt_text}")
        text = response.text

        # Clean up potential markdown code blocks
        if text.startswith('```json'):
            text = text[7:]
        elif text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]

        quiz_data = json.loads(text)

        validation_error = validate_quiz_data(quiz_data)
        if validation_error:
             return jsonify({'error': f"AI Generation Error: {validation_error}"}), 500

        return jsonify({'quiz_data': quiz_data})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and file.filename.endswith('.json'):
        try:
            content = json.load(file)
            error = validate_quiz_data(content)
            if error:
                return jsonify({'error': error}), 400

            return jsonify({'quiz_data': content}), 200
        except json.JSONDecodeError:
            return jsonify({'error': 'Invalid JSON file'}), 400
    return jsonify({'error': 'Invalid file type, please upload a JSON file'}), 400

@app.route('/sample-quiz')
def sample_quiz():
    try:
        sample_path = os.path.join(app.root_path, 'sample_quiz.json')
        with open(sample_path, 'r') as f:
            content = json.load(f)
            # Ensure sample quiz has types
            for item in content:
                if 'type' not in item: item['type'] = 'multiple_choice'
        return jsonify({'quiz_data': content}), 200
    except Exception as e:
        return jsonify({'error': 'Could not load sample quiz'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
