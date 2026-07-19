from flask import Flask, render_template, request
import os
from werkzeug.utils import secure_filename
from utils.speech import transcribe_audio
from utils.pdf_export import create_pdf
from flask import send_file

app = Flask(__name__)


UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Create uploads folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/download-pdf")
def download_pdf():

    return send_file(
        "exports/meeting_report.pdf",
        as_attachment=True
    )
    
@app.route("/upload", methods=["POST"])
def upload():

    # Check if a file was uploaded
    if "audio" not in request.files:
        return "No file uploaded"

    file = request.files["audio"]

    # Check if the user selected a file
    if file.filename == "":
        return "No selected file"

    # Make filename safe
    filename = secure_filename(file.filename)

    # Save file
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    # Convert speech to text
    transcript = transcribe_audio(filepath)
    os.makedirs("exports", exist_ok=True)
    pdf_path = "exports/meeting_report.pdf"
    create_pdf(pdf_path, transcript)

    # Show result page
    return render_template(
        "result.html",
        transcript=transcript
    )


if __name__ == "__main__":
    app.run(debug=True)