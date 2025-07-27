import google.generativeai as genai

# Set your API key
genai.configure(api_key="AIzaSyBOSR7qf6TArvAac5fpfhfQU9SqKSqp0bo")

# model = genai.GenerativeModel('models/gemini-1.5-pro-002')
# model = genai.GenerativeModel('models/gemini-2.0-flash-lite')
model = genai.GenerativeModel('models/gemini-2.5-flash-preview-05-20')

def gemini_is_resume(raw_text):
    prompt = f"""
    I have extracted raw text from a resume, but I am not sure whether it is a resume or not.

    Check the text and confirm if it is a resume. If it is a resume then return "It is a resume" and if it is not a resume, return "Not a resume".

    Do not add any text by yourself anywhere in the response.

    Raw Resume Text:
    {raw_text}
    """

    try:
        response = model.generate_content(prompt)
        print("Succesfully called ISResume:",response.text)
        return response.text.strip().lower() == "it is a resume"
    except Exception as e:
        print(f"Error generating content: {e}")
        return "An error occurred while processing the request."