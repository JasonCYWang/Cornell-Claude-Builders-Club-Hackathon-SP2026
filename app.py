from flask import Flask, render_template_string, request
from google import genai
from google.genai import types
import os

app = Flask(__name__)

# Your working client setup (unchanged)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>Journaling for Your Future Self</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            background: #f6f7fb;
            color: #222;
        }

        header {
            background: #4f46e5;
            color: white;
            padding: 20px 40px;
        }

        .container {
            display: flex;
            min-height: calc(100vh - 80px);
        }

        .sidebar {
            width: 220px;
            background: white;
            padding: 20px;
            border-right: 1px solid #ddd;
        }

        .tab-button {
            display: block;
            width: 100%;
            padding: 12px;
            margin-bottom: 10px;
            border: none;
            background: #eef0ff;
            cursor: pointer;
            border-radius: 8px;
            text-align: left;
            font-size: 15px;
        }

        .tab-button:hover {
            background: #dfe3ff;
        }

        .tab-button.active {
            background: #4f46e5;
            color: white;
        }

        .content {
            flex: 1;
            padding: 30px;
        }

        .tab-content {
            display: none;
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .tab-content.active {
            display: block;
        }

        textarea, input {
            width: 100%;
            max-width: 700px;
            padding: 12px;
            margin-top: 8px;
            border-radius: 8px;
            border: 1px solid #ccc;
            font-size: 15px;
        }

        button.submit-btn {
            margin-top: 15px;
            padding: 12px 18px;
            border: none;
            background: #4f46e5;
            color: white;
            border-radius: 8px;
            cursor: pointer;
        }

        .journal-card {
            background: #f6f7fb;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 12px;
        }

        .placeholder {
            color: #666;
            font-style: italic;
        }

        pre {
            white-space: pre-wrap;
            background: #f6f7fb;
            padding: 15px;
            border-radius: 10px;
        }
    </style>
</head>

<body>
    <header>
        <h1>Journaling for Your Future Self</h1>
        <p>Reflect today. Hear from the person you are becoming.</p>
    </header>

    <div class="container">
        <nav class="sidebar">
            <button class="tab-button active" onclick="openTab('journals', this)">Journals</button>
            <button class="tab-button" onclick="openTab('suggestions', this)">Suggestions</button>
            <button class="tab-button" onclick="openTab('habits', this)">Habit Tracker</button>
            <button class="tab-button" onclick="openTab('questionnaire', this)">Questionnaire</button>
            <button class="tab-button" onclick="openTab('futureSelf', this)">Future Self</button>
        </nav>

        <main class="content">

            <section id="journals" class="tab-content active">
                <h2>Journal Entries</h2>
                <p>Write a new entry or view previous reflections.</p>

                <form method="POST">
                    <label for="prompt"><strong>New Journal Entry</strong></label>
                    <textarea name="prompt" rows="7" placeholder="Write about your day, worries, goals, or thoughts..."></textarea>
                    <br>
                    <button class="submit-btn" type="submit">Save / Reflect</button>
                </form>

                {% if sendingPrompt %}
                    <h3>Latest Entry</h3>
                    <div class="journal-card">
                        <strong>Date:</strong> Today<br>
                        <p>{{ sendingPrompt }}</p>
                    </div>
                {% endif %}

                <h3>Previous Entries</h3>
                <div class="journal-card">
                    <strong>Example Entry</strong>
                    <p class="placeholder">Previous journal entries will appear here later.</p>
                </div>

                {% if response_text %}
                    <h3>AI Reflection</h3>
                    <pre>{{ response_text }}</pre>
                {% endif %}
            </section>

            <section id="suggestions" class="tab-content">
                <h2>Suggestions</h2>
                <p class="placeholder">AI-generated suggestions will go here later.</p>

                <div class="journal-card">
                    <strong>Example Suggestion</strong>
                    <p>Take one small step toward your goal today.</p>
                </div>
            </section>

            <section id="habits" class="tab-content">
                <h2>Habit Tracker</h2>
                <p class="placeholder">Habit tracking functionality will be added later.</p>

                <div class="journal-card">
                    <label><input type="checkbox"> Drink water</label><br>
                    <label><input type="checkbox"> Study for 30 minutes</label><br>
                    <label><input type="checkbox"> Journal today</label>
                </div>
            </section>

            <section id="questionnaire" class="tab-content">
                <h2>Questionnaire</h2>
                <p>These questions can help personalize future reflections.</p>

                <label>What do you imagine yourself doing in 10 years?</label>
                <textarea rows="4" placeholder="Example: working as a doctor, building games, helping others..."></textarea>

                <label>What matters most to you right now?</label>
                <textarea rows="4" placeholder="Example: family, school, creativity, health..."></textarea>
            </section>

            <section id="futureSelf" class="tab-content">
                <h2>Talk to Your Future Self</h2>
                <p class="placeholder">This tab can later become a chat-style interface.</p>

                <div class="journal-card">
                    <strong>Future Self Preview</strong>
                    <p>Your future self responses will appear here.</p>
                </div>
            </section>

        </main>
    </div>

    <script>
        function openTab(tabId, button) {
            const tabs = document.querySelectorAll(".tab-content");
            const buttons = document.querySelectorAll(".tab-button");

            tabs.forEach(tab => tab.classList.remove("active"));
            buttons.forEach(btn => btn.classList.remove("active"));

            document.getElementById(tabId).classList.add("active");
            button.classList.add("active");
        }
    </script>
</body>
</html>
"""

@app.route("/", methods=["GET", "POST"])
def home():
    sendingPrompt = ""
    response_text = ""

    if request.method == "POST":
        sendingPrompt = request.form.get("prompt")
        print("sending prompt is:", sendingPrompt)

        try:
            response = client.models.generate_content(
                model="gemini-3-flash-preview",
                config=types.GenerateContentConfig(
                    system_instruction="you are the users"
                ),
                contents=sendingPrompt
            )

            response_text = response.text
            print("response is:", response_text)

        except Exception as e:
            response_text = "ERROR: " + str(e)
            print(response_text)

    return render_template_string(
        HTML,
        sendingPrompt=sendingPrompt,
        response_text=response_text
    )

if __name__ == "__main__":
    app.run(debug=True)