from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    send_file,
    send_from_directory,
)

from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

from flask_login import (
    LoginManager,
    login_user,
    login_required,
    logout_user,
    current_user,
)

import os

from models import db, User, Meeting

from utils.speech import transcribe_audio
from utils.pdf_export import create_pdf
from utils.chat import ask_ai


app = Flask(__name__)

# ----------------------------
# Configuration
# ----------------------------

app.config["SECRET_KEY"] = "meetingmind_secret_key"

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

UPLOAD_FOLDER = "/tmp/uploads"
EXPORT_FOLDER = "/tmp/exports"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(EXPORT_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

latest_transcript = ""

# ----------------------------
# Database
# ----------------------------

db.init_app(app)

with app.app_context():
    db.create_all()

# ----------------------------
# Login Manager
# ----------------------------

login_manager = LoginManager()

login_manager.init_app(app)

login_manager.login_view = "signin"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# ==========================================================
# HOME
# ==========================================================

@app.route("/")
@login_required
def home():
    return render_template(
        "index.html",
        user=current_user
    )


# ==========================================================
# SIGN UP
# ==========================================================

@app.route("/signup", methods=["GET", "POST"])
def signup():

    if current_user.is_authenticated:
        return redirect(url_for("home"))

    if request.method == "POST":

        full_name = request.form.get("name")
        email = request.form.get("email").strip().lower()
        password = request.form.get("password")
        confirm_password = request.form.get("confirm_password")

        if not full_name or not email or not password or not confirm_password:
            flash("Please fill all fields.")
            return redirect(url_for("signup"))

        if password != confirm_password:
            flash("Passwords do not match.")
            return redirect(url_for("signup"))

        existing_user = User.query.filter_by(email=email).first()

        if existing_user:
            flash("Email already registered.")
            return redirect(url_for("signup"))

        hashed_password = generate_password_hash(password)

        user = User(
            full_name=full_name,
            email=email,
            password=hashed_password
        )

        db.session.add(user)
        db.session.commit()

        flash("Account created successfully. Please sign in.")

        return redirect(url_for("signin"))

    return render_template("signup.html")


# ==========================================================
# SIGN IN
# ==========================================================

@app.route("/signin", methods=["GET", "POST"])
def signin():

    if current_user.is_authenticated:
        return redirect(url_for("home"))

    if request.method == "POST":

        email = request.form.get("email").strip().lower()
        password = request.form.get("password")

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):

            login_user(user)

            flash(f"Welcome back, {user.full_name}!")

            return redirect(url_for("home"))

        flash("Invalid email or password.")

    return render_template("signin.html")


# ==========================================================
# LOGOUT
# ==========================================================

@app.route("/logout")
@login_required
def logout():

    logout_user()

    flash("Logged out successfully.")

    return redirect(url_for("signin"))

# ==========================================================
# UPLOAD AUDIO
# ==========================================================

@app.route("/upload", methods=["POST"])
@login_required
def upload():

    global latest_transcript

    if "audio" not in request.files:
        flash("No audio file selected.")
        return redirect(url_for("home"))

    file = request.files["audio"]

    if file.filename == "":
        flash("Please choose an audio file.")
        return redirect(url_for("home"))

    filename = secure_filename(file.filename)

    filepath = os.path.join(
        app.config["UPLOAD_FOLDER"],
        filename
    )

    file.save(filepath)

    # ---------------- Speech to Text ----------------

    try:

        transcript = transcribe_audio(filepath)

        latest_transcript = transcript

    except Exception as e:

        return f"Speech Transcription Error:<br><br>{e}", 500

    # ---------------- PDF ----------------

    try:

        pdf_path = os.path.join(
            EXPORT_FOLDER,
            "meeting_report.pdf"
        )

        create_pdf(
            pdf_path,
            transcript
        )

    except Exception as e:

        return f"PDF Generation Error:<br><br>{e}", 500

    # ---------------- Save Meeting ----------------

    meeting = Meeting(

        user_id=current_user.id,

        filename=filename,

        transcript=transcript,

        summary=None

    )

    db.session.add(meeting)

    db.session.commit()

    # ---------------- Result ----------------

    return render_template(

        "result.html",

        transcript=transcript,

        audio_file=filename,

        meeting=meeting,

        user=current_user

    )
# ==========================================================
# AI CHAT
# ==========================================================

@app.route("/chat", methods=["POST"])
@login_required
def chat():

    global latest_transcript

    question = request.form.get("question", "").strip()

    if question == "":
        return {"answer": "Please enter a question."}

    try:

        answer = ask_ai(
            latest_transcript,
            question
        )

    except Exception as e:

        answer = f"Error: {e}"

    return {
        "answer": answer
    }


# ==========================================================
# AUDIO PREVIEW
# ==========================================================

@app.route("/audio/<filename>")
@login_required
def audio(filename):

    return send_from_directory(
        app.config["UPLOAD_FOLDER"],
        filename
    )


# ==========================================================
# DOWNLOAD PDF
# ==========================================================

@app.route("/download-pdf")
@login_required
def download_pdf():

    pdf_path = os.path.join(
        EXPORT_FOLDER,
        "meeting_report.pdf"
    )

    if not os.path.exists(pdf_path):

        flash("PDF not found.")

        return redirect(url_for("home"))

    return send_file(
        pdf_path,
        as_attachment=True
    )


# ==========================================================
# MEETING HISTORY
# ==========================================================

@app.route("/history")
@login_required
def history():

    meetings = Meeting.query.filter_by(
        user_id=current_user.id
    ).order_by(
        Meeting.created_at.desc()
    ).all()

    return render_template(
        "history.html",
        meetings=meetings,
        user=current_user
    )


# ==========================================================
# DELETE MEETING
# ==========================================================

@app.route("/delete-meeting/<int:id>")
@login_required
def delete_meeting(id):

    meeting = Meeting.query.filter_by(
        id=id,
        user_id=current_user.id
    ).first()

    if meeting:

        db.session.delete(meeting)

        db.session.commit()

        flash("Meeting deleted successfully.")

    return redirect(url_for("history"))


# ==========================================================
# RUN APP
# ==========================================================

if __name__ == "__main__":

    with app.app_context():
        db.create_all()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )