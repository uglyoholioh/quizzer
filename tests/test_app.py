import unittest
import app
import json
from unittest.mock import patch

class TestQuizApp(unittest.TestCase):

    def setUp(self):
        app.app.testing = True
        self.client = app.app.test_client()

    def test_index_route(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'DevQuiz', response.data)

    def test_get_sample_quiz(self):
        response = self.client.get('/sample-quiz')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('quiz_data', data)
        self.assertTrue(isinstance(data['quiz_data'], list))

    def test_parse_quiz_valid(self):
        # Create a dummy file object
        data = {
            "question": "Test Question",
            "options": ["A", "B", "C", "D"],
            "answer": "A",
            "explanation": "Because A"
        }
        json_data = json.dumps([data])

        from io import BytesIO
        file = BytesIO(json_data.encode('utf-8'))

        data = {
            'file': (file, 'test_quiz.json')
        }
        response = self.client.post('/upload', data=data, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.data)
        self.assertEqual(json_response['quiz_data'][0]['question'], "Test Question")

    def test_upload_no_file(self):
        response = self.client.post('/upload', data={}, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 400)
        json_response = json.loads(response.data)
        self.assertIn('error', json_response)

if __name__ == '__main__':
    unittest.main()
