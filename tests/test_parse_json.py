import unittest
import json
from app import app

class TestApp(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_parse_json_valid(self):
        valid_json = json.dumps([
            {
                "type": "multiple_choice",
                "question": "Q1",
                "options": ["A", "B"],
                "answer": "A",
                "explanation": "Exp"
            }
        ])
        response = self.app.post('/parse-json',
                                 data=json.dumps({'json_content': valid_json}),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('quiz_data', data)
        self.assertEqual(len(data['quiz_data']), 1)

    def test_parse_json_invalid_structure(self):
        invalid_json = json.dumps([
            {
                "type": "multiple_choice",
                "question": "Q1"
                # Missing options and answer
            }
        ])
        response = self.app.post('/parse-json',
                                 data=json.dumps({'json_content': invalid_json}),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)

    def test_parse_json_malformed_syntax(self):
        malformed_json = "[{'question': 'Q1' ... " # Invalid JSON syntax
        response = self.app.post('/parse-json',
                                 data=json.dumps({'json_content': malformed_json}),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertEqual(data['error'], 'Invalid JSON format')

if __name__ == '__main__':
    unittest.main()
