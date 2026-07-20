from flask import Flask, render_template, request, send_file
from werkzeug.utils import secure_filename
import os

from utils.speech import transcribe_audio
from utils.pdf_export import create_pdf

app = Flask(__name__)

# Temporary folders for Vercel
UPLOAD_FOLDER = "/tmp/uploads"
EXPORT_FOLDER = "/tmp/exports"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(EXPORT_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/upload", methods=["POST"])
def upload():

    if "audio" not in request.files:
        return "No file uploaded", 400

    file = request.files["audio"]

    if file.filename == "":
        return "No selected file", 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)

    file.save(filepath)

    try:
        transcript = transcribe_audio(filepath)
    except Exception as e:
        return f"Speech Transcription Error:<br><br>{e}", 500

    try:
        pdf_path = os.path.join(EXPORT_FOLDER, "meeting_report.pdf")
        create_pdf(pdf_path, transcript)
    except Exception as e:
        return f"PDF Generation Error:<br><br>{e}", 500

    return render_template(
        "result.html",
        transcript=transcript
    )


@app.route("/download-pdf")
def download_pdf():

    pdf_path = os.path.join(EXPORT_FOLDER, "meeting_report.pdf")

    if not os.path.exists(pdf_path):
        return "PDF not found.", 404

    return send_file(
        pdf_path,
        as_attachment=True
    )


# Required for Vercel
app = app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)