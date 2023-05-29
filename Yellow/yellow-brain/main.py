import os

from flask import Flask, request
from flask_cors import CORS

import openai

from dotenv import load_dotenv

load_dotenv()

ELEVEN_LABS_API_KEY = os.environ.get("ELEVEN_LABS_API_KEY")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
OPENAI_ORG_ID = os.environ.get("OPENAI_ORG_ID")

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes


@app.route("/")
def hello_world():
    """Example Hello World route."""
    name = os.environ.get("NAME", "World")
    return f"Hello :! {name}!"


@app.route("/call", methods=["POST"])
def call():
    """This forwards the text to openai completion endpoint and forwards stream back to the user"""
    text = request.get_json()["text"]

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Respond in under 25 words, always"},
            {"role": "user", "content": text},
        ],
        temperature=0,
        stream=True,  # this time, we set stream=True
    )

    for chunk in response:
        yield (chunk)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
