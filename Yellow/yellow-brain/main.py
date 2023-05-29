import os

from flask import Flask, request
from flask_cors import CORS

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
    """Example Hello World route."""
    # grab the text from the request body
    text = request.get_json()["text"]

    return f"You rang? ;) {text}!"


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
