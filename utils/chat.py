import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()


def ask_ai(transcript, question):

    client = Groq(
        api_key=os.getenv("GROQ_API_KEY")
    )

    completion = client.chat.completions.create(

        model="llama-3.3-70b-versatile",

        messages=[

            {
                "role": "system",
                "content":
                "You are MeetingMind AI. "
                "Answer ONLY using the meeting transcript."
            },

            {
                "role": "user",
                "content":
                f"""
Meeting Transcript:

{transcript}

Question:

{question}
"""
            }

        ],

        temperature=0.2

    )

    return completion.choices[0].message.content