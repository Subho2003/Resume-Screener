import sys
from RF_Model_Load import load_model, load_vectorizer
from Extract_Resume_Text import extract_resume_text
from Preview_Resume import safe_analyze_resume
from Check_For_Resume import gemini_is_resume
import re

# Clean resume
def cleanResume(txt):
    cleanText = re.sub('http\S+\s', ' ', txt)
    cleanText = re.sub('RT|cc', ' ', cleanText)
    cleanText = re.sub('#\S+\s', ' ', cleanText)
    cleanText = re.sub('@\S+', '  ', cleanText)
    cleanText = re.sub('[%s]' % re.escape("""!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"""), ' ', cleanText)
    cleanText = re.sub(r'[^\x00-\x7f]', ' ', cleanText)
    cleanText = re.sub('\s+', ' ', cleanText)
    return cleanText


#  Prediction and Category Name
def predict_category(resume_text):
    resume_text = cleanResume(resume_text)
    rf_classifier = load_model()
    vectorizer = load_vectorizer()
    resume_tfidf = vectorizer.transform([resume_text])
    predicted_category = rf_classifier.predict(resume_tfidf)[0]
    suggestions = safe_analyze_resume(resume_text, predicted_category)
    return {
        "cat": predicted_category,
        "sugg": suggestions,
    }

# Get the file path passed from Flask
def return_category_to_flask(filepath):
    if not filepath:
        print("Invalid or missing file path.")
        sys.exit(1)
    resume_text = extract_resume_text(filepath)
    isresume = gemini_is_resume(resume_text)
    if( not isresume):
        return {
            "cat": "Not a resume",
            "sugg": "The uploaded file does not appear to be a valid resume."
        }
    return predict_category(resume_text)