from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

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

            # Validation
            if not isinstance(content, list):
                 return jsonify({'error': 'JSON must be a list of questions'}), 400

            for item in content:
                required_fields = ['question', 'options', 'answer', 'explanation']
                if not all(field in item for field in required_fields):
                     return jsonify({'error': 'Each question must have question, options, answer, and explanation fields'}), 400
                if not isinstance(item['options'], list):
                    return jsonify({'error': 'Options must be a list'}), 400

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
        return jsonify({'quiz_data': content}), 200
    except Exception as e:
        return jsonify({'error': 'Could not load sample quiz'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
