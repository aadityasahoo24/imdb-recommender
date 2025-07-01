from fastapi import FastAPI, Query
from sentence_transformers import SentenceTransformer, util
import pandas as pd
import uvicorn
import json

app = FastAPI()
model = SentenceTransformer('all-MiniLM-L6-v2')

with open("movies.json", "r") as f:
    movie_data = json.load(f)

titles = [m['title'] for m in movie_data]
descriptions = [m['description'] for m in movie_data]
embeddings = model.encode(descriptions, convert_to_tensor=True)

@app.get("/recommend")
def recommend(query: str, top_k: int = 5):
    query_embedding = model.encode(query, convert_to_tensor=True)
    scores = util.cos_sim(query_embedding, embeddings)[0]
    top_results = scores.argsort(descending=True)[:top_k]

    results = []
    for idx in top_results:
        results.append({
            "title": titles[idx],
            "score": float(scores[idx])
        })
    return results

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
