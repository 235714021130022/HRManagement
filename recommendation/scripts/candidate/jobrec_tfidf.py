import pandas as pd
import numpy as np
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ====== PATH ======
JOBS_PATH = "../datasets/it_jobs.xlsx"
RESUMES_PATH = "../datasets/UpdatedResumeDataSet.csv"

# ====== CLEAN TEXT ======
def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = text.replace("\n", " ").replace("\r", " ")
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def main(cv_index=0, top_k=10):
    print("Loading datasets...")
    jobs = pd.read_excel(JOBS_PATH)
    resumes = pd.read_csv(RESUMES_PATH)

    # ====== PREPARE TEXT ======
    job_texts = (
        jobs["title"].fillna("") + " " + jobs["cleaned_description"].fillna("")
    ).apply(clean_text)

    cv_text = clean_text(resumes.loc[cv_index, "Resume"])

    print("Building TF-IDF vectors...")
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=2,
        max_features=100_000
    )

    job_vectors = vectorizer.fit_transform(job_texts)
    cv_vector = vectorizer.transform([cv_text])

    print("Computing cosine similarity...")
    scores = cosine_similarity(cv_vector, job_vectors).flatten()

    top_indices = np.argsort(scores)[::-1][:top_k]

    results = jobs.loc[top_indices, ["title", "company", "location"]].copy()
    results["score"] = scores[top_indices]

    print("\n===== TOP JOB RECOMMENDATIONS =====")
    print(results.to_string(index=False))


if __name__ == "__main__":
    # đổi cv_index để test CV khác (0 → 961)
    main(cv_index=0, top_k=10)
