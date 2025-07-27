import pdfplumber
from docx import Document

def extract_text_from_pdf(pdf_path):
    """Extracts text from a PDF resume."""
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            extracted_text = page.extract_text()
            if extracted_text:
                text += extracted_text + "\n"
    return text.strip()

def extract_text_from_docx(docx_path):
    """Extracts text from a DOCX resume."""
    doc = Document(docx_path)
    return "\n".join([para.text for para in doc.paragraphs]).strip()

def extract_resume_text(file_path):
    """Detect file type and extract text accordingly."""
    if file_path.endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    elif file_path.endswith('.docx'):
        return extract_text_from_docx(file_path)
    else:
        raise ValueError("Unsupported file format. Use PDF or DOCX.")