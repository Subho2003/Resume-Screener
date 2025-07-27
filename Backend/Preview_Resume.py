import google.generativeai as genai
import time
import re

# Set your API key
genai.configure(api_key="AIzaSyBOSR7qf6TArvAac5fpfhfQU9SqKSqp0bo")

# model = genai.GenerativeModel('models/gemini-1.5-pro-002')
model = genai.GenerativeModel('models/gemini-2.0-flash-lite')

def gemini_resume_preview(raw_text):
    prompt = f"""
    I have extracted raw text from a resume, but the text contains errors like:

    Character duplication.
    Word repetition.
    Non-linearly extracted texts
    Broken formatting (missing line breaks or extra whitespace).

    Please proofread and correct the text by:
    Fixing character duplication.
    Removing word repetitions unless they are intentional.
    Cleaning up formatting (add line breaks where needed, remove unnecessary whitespace).
    Keeping section headers clearly separated.
    Ensuring dates and numerical values remain accurate.
    Also do not add any text by yourself anywhere in the response.

    Raw Resume Text:
    {raw_text}
    """

    try:
        response = model.generate_content(prompt)
        return clean_response(response.text)
    except Exception as e:
        print(f"Error generating content: {e}")
        return "An error occurred while processing the request."
    

# Clean and validate the response
def clean_response(response_text):        
    # Remove all instances of ** (bold markers)
    clean_text = re.sub(r'\*\*', '', response_text)
    return clean_text.strip()

# Retry mechanism
def safe_analyze_resume(resume_text, job_category, retries=3):
    for _ in range(retries):
        try:
            raw_response = analyze_resume(resume_text, job_category)
            return clean_response(raw_response)
        except Exception as e:
            print(f"Error: {e}. Retrying...")
            time.sleep(2)
    return "Failed to get a response after multiple retries."

# Main function to generate suggestions
def analyze_resume(resume_text, job_category):
    formatted_resume = gemini_resume_preview(resume_text)
    prompt = f"""
    Given the following resume:
    {formatted_resume}

    And the job category:
    {job_category}

    Identify the following:
    1. Missing skills.
    2. Suggestions to improve the resume.

    Format the response like this:
    Missing Skills:

    Suggestions:

    Ensure the response is concise and follows the format strictly.
    """

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating content: {e}")
        return "An error occurred while processing the request."
    

def get_formatted_suggs(raw_text):
    print(raw_text)
    prompt1 = f"""
        You are an AI assistant. Extract only the "Missing Skills" from the following text. Do not add the header "Missing Skills". Just give the list. Exclude extra information. Preserve "e.g." examples in a single line.  

        Text:  
        {raw_text}

        Only return the formatted missing skills list. Do not include any additional explanation or commentary.
    """
    prompt2 = f"""
        You are an AI assistant. Extract only the "Suggestions" from the following text. Do not add the header "Suggestions". Just give the list. Exclude extra information. Preserve "e.g." examples in a single line.

            Text:  
            {raw_text}

            Only return the formatted suggestions list. Do not include any additional explanation or commentary.
    """

    try:
        skills_response = model.generate_content(prompt1)
        suggestions_response = model.generate_content(prompt2)
        return {
            "skills_response": skills_response.text,
            "suggestions_response": suggestions_response.text
        }
    except Exception as e:
        print(f"Error generating content: {e}")
        return "An error occurred while processing the request."