import re
import numpy as np
import pandas as pd
import torch
import joblib
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from transformers import BertTokenizer, BertModel
from sklearn.metrics.pairwise import cosine_similarity
from scipy import sparse
from Extract_Resume_Text import extract_resume_text
from Check_For_Resume import gemini_is_resume
from ATS_Suggestions import get_ats_suggestions
import sys
import google.generativeai as genai
from sklearn.metrics import jaccard_score
from collections import defaultdict
import traceback

# Set your API key
genai.configure(api_key="AIzaSyBOSR7qf6TArvAac5fpfhfQU9SqKSqp0bo")
model = genai.GenerativeModel('models/gemini-2.0-flash-lite')

def clean_response(response_text):
    # Remove Markdown formatting (code block markers ``` and bold **)
    clean_text = re.sub(r'(```|\*\*)', '', response_text)
    return clean_text.strip()

# Device setup
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load saved models and data
label_encoder = joblib.load("saved_ats/label_encoder.joblib")
tfidf_vectorizer = joblib.load("saved_ats/tfidf_vectorizer.joblib")
tfidf_matrix = sparse.load_npz("saved_ats/tfidf_matrix.npz")
classifier = joblib.load("saved_ats/classifier.joblib")
job_embeddings = np.load("saved_ats/job_embeddings.npy")
df = pd.read_csv("saved_ats/cleaned_dataset.csv")

# Load BERT
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
bert_model = BertModel.from_pretrained("bert-base-uncased").to(DEVICE)

# Preprocessing
stop_words = set(stopwords.words("english"))
stemmer = PorterStemmer()

def preprocess_text(text):
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9\s]", "", text)
    tokens = re.findall(r"\b\w+\b", text)
    tokens = [stemmer.stem(word) for word in tokens if word not in stop_words]
    return " ".join(tokens)

# BERT Embedding Generator
def get_embedding(text):
    inputs = tokenizer([text], return_tensors="pt", padding=True, truncation=True, max_length=512).to(DEVICE)
    with torch.no_grad():
        outputs = bert_model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).cpu().numpy()

# Add this function to calculate keyword weights from job descriptions
def get_keyword_weights(job_descriptions):
    keyword_weights = defaultdict(int)
    for desc in job_descriptions:
        words = re.findall(r'\b\w+\b', desc.lower())
        for word in words:
            if word not in stop_words and len(word) > 2:
                keyword_weights[word] += 1
    return dict(keyword_weights)

# Add this function for keyword matching score
def keyword_matching_score(resume_text, job_descriptions):
    keyword_weights = get_keyword_weights(job_descriptions)
    total_possible = sum(keyword_weights.values())
    if total_possible == 0:
        return 0
    
    score = 0
    resume_words = re.findall(r'\b\w+\b', resume_text.lower())
    for word in resume_words:
        if word in keyword_weights:
            score += keyword_weights[word]
    
    return (score / total_possible)

# Modify your analyze_resume function
def analyze_resume(file_path, selected_category):
    try:
        if not file_path:
            print("Invalid or missing file path.")
            sys.exit(1)

        resume_text = extract_resume_text(file_path)
        isresume = gemini_is_resume(resume_text)
        if not isresume:
            return {
                "selected_category": "Not a resume",
                "best_match_score": "The uploaded file does not appear to be a valid resume.",
                "ats_suggestions": "The uploaded file does not appear to be a valid resume."
            }
        
        cleaned = preprocess_text(resume_text)
        resume_embedding = get_embedding(cleaned)
        resume_tfidf = tfidf_vectorizer.transform([cleaned])

        # Filter jobs by selected category
        category_df = df[df['Category'] == selected_category]
        category_indices = category_df.index.tolist()
        category_tfidf = tfidf_matrix[category_indices]
        category_embeddings = job_embeddings[category_indices]
        job_descriptions = category_df['clean_text'].tolist()

        # Calculate individual scores
        # 1. Cosine similarity (your existing approach)
        tfidf_scores = cosine_similarity(resume_tfidf, category_tfidf).flatten()
        bert_scores = cosine_similarity(resume_embedding, category_embeddings).flatten()
        cosine_final = 0.4 * tfidf_scores + 0.6 * bert_scores
        
        # 2. Keyword matching score
        keyword_scores = []
        for desc in job_descriptions:
            keyword_scores.append(keyword_matching_score(resume_text, [desc]))
        keyword_scores = np.array(keyword_scores)
    
        
        # Combine scores with weights
        # hybrid_scores = (0.8 * cosine_final + 0.2 * keyword_scores)
        hybrid_scores = (0.8 * cosine_final + 0.2 * keyword_scores)

        # Use top-k scoring strategy
        top_k = min(5, len(hybrid_scores))
        if len(hybrid_scores) == 0:
            best_score = 0.0
        else:
            top_indices = np.argsort(hybrid_scores)[-top_k:]
            best_score = np.mean(hybrid_scores[top_indices])  # average top-k instead of max

        category_keywords = selected_category.lower().split()
        resume_tokens = set(re.findall(r'\b\w+\b', resume_text.lower()))
        if not any(kw in resume_tokens for kw in category_keywords):
            print("⚠️ Resume seems unrelated to selected category.")
            best_score *= 0.4

        # Normalize to 0-100 scale
        # normalized_score = min(100, round(max(0, best_score * 100)))
        print(best_score)
        normalized_score = round(np.interp(best_score, [0.2, 0.85], [20, 90]))
        normalized_score = max(0, min(normalized_score, 100))

        return {
            "selected_category": selected_category,
            "best_match_score": normalized_score,
            "ats_suggestions": get_ats_suggestions(resume_text, selected_category, normalized_score),
        }
    except Exception as e:
        print(f"Error in analyze_resume: {e}")
        traceback.print_exc()
        return {
            "selected_category": "Error",
            "best_match_score": "An error occurred while processing the resume.",
            "ats_suggestions": "An error occurred while generating ATS suggestions."
        }