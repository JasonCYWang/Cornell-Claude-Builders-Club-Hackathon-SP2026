from flask import Flask, render_template_string, request, jsonify
from google import genai
from google.genai import types
import os
from journal import Journal

journal = Journal()
app = Flask(__name__)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

futureselfInstructions = "You are the chatters future self in 10 years. You are going to look at what they are saying and how things have turned out or how the chatter should think. You should be positive about the future and not give any specific details of their life in the future"

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
            <button class="tab-button" onclick="openFutureSelfTab(this)">Future Self</button>
        </nav>

        <main class="content">
            <section id="journals" class="tab-content active">
                <h2>Journal Entries</h2>
                <p>Write a new entry or view previous reflections.</p>

                <form method="POST">
                    <label for="prompt"><strong>New Journal Entry</strong></label>
                    <textarea name="prompt" rows="7" placeholder="Write about your day, worries, goals, or thoughts..."></textarea>
                    <br>
                    <button class="submit-btn" type="submit">Save Journal Entry</button>
                </form>

                <h3>Previous Entries</h3>

                {% if entries %}
                    {% for entry in entries %}
                        <div class="journal-card">
                            <strong>{{ entry.timestamp }}</strong>
                            <p>{{ entry.text }}</p>
                        </div>
                    {% endfor %}
                {% else %}
                    <p class="placeholder">No journal entries yet.</p>
                {% endif %}
            </section>

            <section id="suggestions" class="tab-content">
                <h2>Suggestions</h2>
                <p class="placeholder">AI-generated suggestions will go here later.</p>
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
                <p>Your future self will look at your saved journal entries and respond.</p>

                <div class="journal-card">
                    <strong>Future Self Response</strong>
                    <pre id="futureSelfResponse">Click the Future Self tab to generate a response.</pre>
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

        async function openFutureSelfTab(button) {
            openTab('futureSelf', button);

            const responseBox = document.getElementById("futureSelfResponse");
            responseBox.textContent = "Thinking as your future self...";

            try {
                const response = await fetch("/future-self", {
                    method: "POST"
                });

                const data = await response.json();
                responseBox.textContent = data.response;
            } catch (error) {
                responseBox.textContent = "ERROR: " + error;
            }
        }
    </script>
</body>
</html>
"""

@app.route("/", methods=["GET", "POST"])
def home():
    entries = journal.get_entries()

    if request.method == "POST":
        sendingPrompt = request.form.get("prompt")
        print("journal entry is:", sendingPrompt)

        if sendingPrompt:
            journal.add_entry(sendingPrompt)
            entries = journal.get_entries()

    return render_template_string(
        HTML,
        entries=entries
    )

@app.route("/future-self", methods=["POST"])
def future_self():
    entries = journal.get_entries()

    if not entries:
        return jsonify({
            "response": "Write at least one journal entry first, then come back to hear from your future self."
        })

    journal_text = ""
    for entry in entries:
        journal_text += f"{entry['timestamp']} - {entry['text']}\\n"

    try:
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            config=types.GenerateContentConfig(
                system_instruction=futureselfInstructions
            ),
            contents=journal_text
        )

        return jsonify({
            "response": response.text
        })

    except Exception as e:
        return jsonify({
            "response": "ERROR: " + str(e)
        })

if __name__ == "__main__":
    app.run(debug=True)