from playwright.sync_api import sync_playwright, expect
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to the home page
        page.goto('http://127.0.0.1:5000')

        # Check title
        expect(page).to_have_title("Quiz Generator")

        # Upload the file
        file_input = page.locator("#file-input")
        # Ensure we provide an absolute path to the file
        file_input.set_input_files(os.path.abspath('sample_quiz.json'))

        # Click upload button
        page.click("#upload-btn")

        # Wait for the quiz section to be visible
        expect(page.locator("#quiz-section")).to_be_visible()

        # Wait for the first question to appear
        expect(page.locator("#question-text")).to_contain_text("What is the capital of France?")

        # Take a screenshot of the initial question
        page.screenshot(path="verification/step1_question.png")

        # Select the correct answer (Paris)
        page.click("button:text('Paris')")

        # Wait for feedback
        expect(page.locator("#feedback")).to_be_visible()
        expect(page.locator("#feedback-text")).to_contain_text("Correct!")

        # Take a screenshot of the feedback
        page.screenshot(path="verification/step2_correct_answer.png")

        # Click Next Question
        page.click("#next-btn")

        # Wait for next question
        expect(page.locator("#question-text")).to_contain_text("Which planet is known as the Red Planet?")

        # Select incorrect answer (Earth)
        page.click("button:text('Earth')")

        # Wait for feedback
        expect(page.locator("#feedback")).to_be_visible()
        expect(page.locator("#feedback-text")).to_contain_text("Incorrect")

        # Take a screenshot of incorrect feedback
        page.screenshot(path="verification/step3_incorrect_answer.png")

        browser.close()

if __name__ == '__main__':
    run()
