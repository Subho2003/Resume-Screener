import google.generativeai as genai
import re


# Set your API key
genai.configure(api_key="AIzaSyBOSR7qf6TArvAac5fpfhfQU9SqKSqp0bo")

# model = genai.GenerativeModel('models/gemini-1.5-pro-002')
model = genai.GenerativeModel('models/gemini-2.0-flash-lite')

def get_ats_suggestions(raw_text, selected_category,  ats_score):
    print(ats_score)
    prompt = f"""
            You are an assistant that reviews resumes based on a calculated ATS score.

            **Important Rule**:  
            If the ATS score is **less than 50**, you **must not** include any missing skills or suggestions. In that case, both sections should be left **empty**.

            Follow this output format strictly:
            Missing Skills:

            Suggestions:

            Now, here is the information you need:

            Raw Resume Text: {raw_text}

            Selected Job Category: {selected_category}

            ATS Score (out of 100): {ats_score}

            Please provide suggestions to improve the ATS score of the resume **only if the score is 50 or above**. The suggestions should be specific and actionable. Generate **atmost 5 suggestions**.

            Do not add any explanation, commentary, or extra text outside the format.
            """
    try:
        response = model.generate_content(prompt)
        return clean_response(response.text)
    except Exception as e:
        print(f"Error generating content: {e}")
        return "An error occurred while processing the request."
    

def clean_response(response_text):        
    # Remove all instances of ** (bold markers)
    clean_text = re.sub(r'\*\*', '', response_text)
    return clean_text.strip()