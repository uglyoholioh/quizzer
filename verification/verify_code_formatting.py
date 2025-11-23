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
        file_input.set_input_files(os.path.abspath('sample_quiz.json'))

        # Click upload button
        page.click("#upload-btn")

        # Wait for the quiz section to be visible
        expect(page.locator("#quiz-section")).to_be_visible()

        # Wait for the first question to appear
        expect(page.locator("#question-text")).to_contain_text("What is the capital of France?")

        # Click Next Question to get to the code snippet question (Question 2)
        # First we must answer Q1 correctly to proceed? No, my logic allows next whenever an option is picked.
        # But wait, the 'Next' button is hidden until an option is selected.

        # Answer Q1
        page.click("button:has-text('Paris')")
        page.click("#next-btn")

        # Now we should be on Question 2 which has code.
        expect(page.locator("#question-text")).to_contain_text("What is the output of the following Python code?")

        # Check if code block exists and is highlighted (highlight.js adds class 'hljs')
        # Depending on how marked.js renders, it usually puts <pre><code>...</code></pre>
        # And highlight.js adds classes to the <code> element.
        expect(page.locator("pre code")).to_be_visible()

        # Take a screenshot to verify code formatting
        page.screenshot(path="verification/step4_code_formatting.png")

        print("Verification script completed successfully.")

        browser.close()

if __name__ == '__main__':
    run()
