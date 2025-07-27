import joblib

# Load the trained Random Forest model
def load_model():
    model_path = 'saved_models/random_forest_model.joblib'
    print("Loading saved Random Forest model...")
    return joblib.load(model_path)

def load_vectorizer():
    model_path = 'saved_models/tfidf_vectorizer.joblib'
    print("Loading saved Vectorizer...")
    return joblib.load(model_path)