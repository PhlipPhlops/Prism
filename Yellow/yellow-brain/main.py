import os
import json

from flask import Flask, request, Response
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
    data = request.get_json()
    if not data:
        return "No data provided to payload body", 400
    text = data.get("text")
    if not text:
        return "No text field provided in payload data", 400

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Respond in under 25 words, always"},
            {"role": "user", "content": text},
        ],
        temperature=0,
        stream=True,  # this time, we set stream=True
    )

    def generate():
        # create variables to collect the stream of chunks
        collected_chunks = []
        collected_messages = []
        # iterate through the stream of events
        for chunk in response:
            collected_chunks.append(chunk)  # save the event response
            chunk_message = chunk["choices"][0]["delta"]
            # check if chunk_message has "content" key
            if "content" in chunk_message:
                message = chunk_message["content"]
                collected_messages.append(message)  # save the message
                print(message)
                yield message  # yield the message to the client

    return Response(generate(), mimetype="application/json")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
