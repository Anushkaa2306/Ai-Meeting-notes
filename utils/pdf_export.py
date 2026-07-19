from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.colors import HexColor

styles = getSampleStyleSheet()

title_style = styles["Heading1"]
title_style.alignment = TA_CENTER
title_style.textColor = HexColor("#4F46E5")

heading = styles["Heading2"]
normal = styles["BodyText"]


def create_pdf(filename, transcript):

    pdf = SimpleDocTemplate(filename)

    story = []

    story.append(Paragraph("🎙 MeetingMind AI", title_style))
    story.append(Paragraph("Meeting Report", heading))

    story.append(Spacer(1,20))

    story.append(Paragraph("<b>Transcript</b>", heading))
    story.append(Paragraph(transcript.replace("\n","<br/>"), normal))

    story.append(Spacer(1,25))

    story.append(
        Paragraph(
            "Generated automatically by MeetingMind AI",
            normal
        )
    )

    pdf.build(story)