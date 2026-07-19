import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if api_key:
    print("✅ API Key Loaded Successfully!")
    print(api_key[:10] + "...")
else:
    print("❌ API Key Not Found")