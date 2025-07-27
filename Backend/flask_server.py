from flask import Flask, request, jsonify
import datetime
from flask_cors import CORS
import os
import pdfplumber
from Predict_Category import return_category_to_flask
from Extract_Resume_Text import extract_resume_text
from Preview_Resume import gemini_resume_preview, get_formatted_suggs
from ATS_Calculator import analyze_resume

# Get current date and time
x = datetime.datetime.now()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Path to the parent directory of the current directory
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../uploads')
# Ensure the uploads folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Route for fetching data
@app.route('/data')
def get_time():
    return jsonify({
        'Name': "Subhadip Dutta",
        'Age': "21+",
        'Date': x.strftime('%Y-%m-%d %H:%M:%S'),
        'programming': "Full Stack Developer"
    })

# Route for receiving data from React
@app.route('/submit', methods=['POST'])
def submit():
    try:
        job_category = request.form.get('jobCategory')
        resume = request.files.get('resume')

        if not job_category or not resume:
            print("Missing job category or resume")
            return jsonify({"error": "Job category and resume are required!"}), 400

        file_path = os.path.join(app.config['UPLOAD_FOLDER'], resume.filename)
        resume.save(file_path)
        print(file_path)

        # Get job category by running the notebook
        final_response_category = return_category_to_flask(file_path)

        # print("Received Job Category:", job_category)
        # print("Saved Resume at:", file_path)
        # print("Predicted Job category: ", final_response_category)
        
        print(final_response_category['cat'])
        print(final_response_category['sugg'].split('\n'))

        return jsonify({
            "message": "Data received successfully!",
            "jobCategory": job_category,
            "resume": resume.filename,
            "predictedJobCategory": final_response_category['cat'],
            "suggestion": final_response_category['sugg'].split('\n'),  # Ensure suggestions are an array
        }), 200

    except Exception as e:
        print("Error:", str(e))  # <-- Log the actual error in the terminal
        return jsonify({"error": str(e)}), 500



@app.route('/extract-text', methods=['POST'])
def extract_text():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        if file.filename.endswith('.pdf'):
            with pdfplumber.open(file_path) as pdf:
                resume_text = "\n".join(page.extract_text() or '' for page in pdf.pages)
        elif file.filename.endswith('.docx'):
            resume_text = extract_resume_text(file_path)
        else:
            return jsonify({'error': 'Unsupported file type'}), 400
        final_resume_text = gemini_resume_preview(resume_text)
        return jsonify({
            'text': final_resume_text
        }), 200

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500
    


@app.route('/skills-suggestion', methods=['POST'])
def fetch_skills_suggestion_formatted():
    try:
        data = request.get_json()  # Get JSON data from request
        raw_text = data.get('suggestions')
        if not raw_text:
            return jsonify({'error': 'Missing suggestions text'}), 400
        
        formatted_texts = get_formatted_suggs(raw_text)
        return jsonify(formatted_texts)

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500
    
@app.route('/resume-ats', methods=['POST'])
def check_resume_ats():
    try:
        job_category = request.form.get('jobCategory')
        resume = request.files.get('resume')

        if not job_category and not resume:
            print("Missing job category or resume")
            return jsonify({"error": "Job category and resume are required!"}), 400

        file_path = os.path.join(app.config['UPLOAD_FOLDER'], resume.filename)
        resume.save(file_path)
        print("Calling ATS calculator...")

        final_ats_response = analyze_resume(file_path, job_category)
        print(final_ats_response['ats_suggestions'].split('\n'))
        return jsonify({
            "message": "Data received successfully!",
            "resume": resume.filename,
            "selectedCategory": final_ats_response['selected_category'],
            "atsScore": final_ats_response['best_match_score'],
            "atsSuggestions": final_ats_response['ats_suggestions'].split('\n')  # Ensure suggestions are an array
        }), 200

    except Exception as e:
        print("Error:", str(e))  # <-- Log the actual error in the terminal
        return jsonify({"error": str(e)}), 500

# Run Flask app
if __name__ == '__main__':
    app.run(debug=True)