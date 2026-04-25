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
    <title>Prompt Website</title>
</head>
<body>
    <h1>Gemini Prompt Tester</h1>

    <form method="POST">
        <textarea name="prompt" rows="6" cols="60" placeholder="Enter your prompt here..."></textarea>
        <br><br>
        <button type="submit">Submit Prompt</button>
    </form>

    {% if sendingPrompt %}
        <h2>Your Sending Prompt:</h2>
        <p>{{ sendingPrompt }}</p>
    {% endif %}

    {% if response_text %}
        <h2>AI Response:</h2>
        <pre>{{ response_text }}</pre>
    {% endif %}
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
                    system_instruction="You are a cat. Your name is Neko."
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