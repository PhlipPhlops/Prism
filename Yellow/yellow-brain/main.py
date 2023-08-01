import os
import json
import random
import requests

from flask import Flask, request, Response
from flask_cors import CORS

import openai
from nltk.tokenize import sent_tokenize

from twilio.twiml.messaging_response import MessagingResponse
from twilio.twiml.voice_response import VoiceResponse

from dotenv import load_dotenv

load_dotenv()

ELEVEN_LABS_API_KEY = os.environ.get("ELEVEN_LABS_API_KEY")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
OPENAI_ORG_ID = os.environ.get("OPENAI_ORG_ID")

openai.api_key = OPENAI_API_KEY
openai.organization = OPENAI_ORG_ID

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

jarvis_prompt = """
Model your tone after Jarvis, the AI assistant in the Tony Stark house.
You are classy, wise, clever, smart, and witty, but by no means do you behave in a dorky way.
You are extraordinarily talented at packing highly dense information into the shortest few words.
As a conversational voice assistant, engage the user in an informal, occasionally humorous, and supportive dialogue,
but remember to remain brief, as your responses will transformed into audio.
You are the worlds foremost brilliant expert on technology, business, market understanding,
practical applications of science, physics, mechanics, software, engineering, and psychology,
with the goal of educating the user to build meaningful businesses, relationships, and software products.
Provide brief responses suitable for audio format, and adapt to the user's level of understanding.
Remember that all text formatting will be lost in the audio format,
so any technical specifics should be kept to the word-level and not be too in the weeds
Offer a single response to each user input.
Encourage critical thinking and expand the user's mind by presenting alternative perspectives,
interesting tidbits of knowledge, and new concepts where appropriate.
"""


def get_elevenlabs_reading(text, i="z"):
    print(f"--Getting reading for: {text}")

    data = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {"stability": 0, "similarity_boost": 0},
    }

    headers = {
        "accept": "audio/mpeg",
        "xi-api-key": ELEVEN_LABS_API_KEY,
        "Content-Type": "application/json",
    }

    response = requests.post(
        "https://api.elevenlabs.io/v1/text-to-speech/p4dzzPG0TDEU8sBmNMlC/stream",
        headers=headers,
        data=json.dumps(data),
        stream=True,
    )

    if response.status_code == 200:
        return response.content
    else:
        print(f"Request failed with status code {response.status_code}")


def random_pause_word_audio():
    pause_words = "ah, er, uh, umm, hmm, eh, hah, oh, mmm"
    pause_words = pause_words.split(", ")
    word = random.choice(pause_words)
    get_elevenlabs_reading(word)


def to_bytes(dict):
    return json.dumps(dict).encode("utf-8")


@app.route("/")
def hello_world():
    """Example Hello World route."""
    name = os.environ.get("NAME", "World")
    return f"Hello :! {name}!"


@app.route("/speak", methods=["POST"])
def speak():
    """This forwards the text to openai completion endpoint and forwards stream back to the user"""
    data = request.get_json()
    if not data:
        return "No data provided to payload body", 400
    text = data.get("text")
    if not text:
        return "No text field provided in payload data", 400

    return Response(get_elevenlabs_reading(text), mimetype="audio/mpeg")


@app.route("/sms", methods=['GET', 'POST'])
def sms_reply(request):
    """Respond to incoming calls with a simple text message."""
    # Start our TwiML response
    resp = MessagingResponse()

    text = request.body.Body
    if not text:
        return "No text field provided in payload data", 400

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": jarvis_prompt,
            },
            {"role": "user", "content": text},
        ],
        temperature=0,
    )

    # Add a message
    resp.message(response.choices[0].text)

    return str(resp)

@app.route("/voice", methods=['GET', 'POST'])
def voice_reply():
    """Respond to incoming calls with a simple text message."""
    # Start our TwiML response
    response = VoiceResponse()
    response.play('https://docs.google.com/file/d/0B-klwLEjaXWcZHR5SmJJWEwtYnc/edit?pli=1&resourcekey=0-D33DYWMxjVde0g1m7qsoZw')

    return str(response)

@app.route("/voice2", methods=['GET', 'POST'])
def voice_reply():
    """Respond to incoming calls with a simple text message."""
    # Start our TwiML response
    response = VoiceResponse()
    response.play('https://api.twilio.com/cowbell.mp3')

    return str(response)


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
            {
                "role": "system",
                "content": jarvis_prompt,
            },
            {"role": "user", "content": text},
        ],
        temperature=0,
        stream=True,  # this time, we set stream=True
    )

    def generate():
        # create variables to collect the stream of chunks
        collected_content = ""
        collected_sentences = []
        num_sentences = 1
        # iterate through the stream of events
        for chunk in response:
            if chunk["choices"][0]["finish_reason"] == "stop":
                print("gpt stream done")
                # get the reading of the final sentence
                yield to_bytes(
                    {
                        "sentence": collected_sentences[num_sentences - 1],
                        "index": num_sentences - 1,
                    }
                )
                return to_bytes({"sentence": "", "index": -1})

            chunk_message = chunk["choices"][0]["delta"]
            # check if chunk_message has "content" key
            if "content" in chunk_message:
                message = chunk_message["content"]  # left to keep, right to yield
                collected_content += message

                # chunk the content into sentences
                collected_sentences = sent_tokenize(collected_content)
                # print(collected_sentences)
                while len(collected_sentences) > num_sentences:
                    num_sentences += 1  # increment the counter
                    # yield the last, now completed sentence
                    yield to_bytes(
                        {
                            "sentence": collected_sentences[num_sentences - 2],
                            "index": num_sentences - 2,
                        }
                    )

                print(chunk_message)
                yield to_bytes(chunk_message)  # yield the message to the client
                # returns format {"content": <message>}

    return Response(generate(), mimetype="application/json")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
