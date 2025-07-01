from flask import Flask, request, jsonify
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

app = Flask(__name__)

df = pd.read_csv('tmdb-movies.csv') 
df['combined_features'] = df[['keywords', 'genres', 'director', 'cast']].fillna('').agg(' '.join, axis=1)

# vectorisation
tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(df['combined_features'])
indices = pd.Series(df.index, index=df['original_title'].str.lower())

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json
    
    input_features = ' '.join([
        data.get('keywords', ''),
        data.get('genres', ''),
        data.get('director', ''),
        data.get('cast', '')
    ]).lower()
    
    input_vec = tfidf.transform([input_features])
    sim_scores = linear_kernel(input_vec, tfidf_matrix).flatten()
    top_indices = sim_scores.argsort()[-6:][::-1]  # Get top 6
    
    recommendations = []
    for idx in top_indices:
        title = df.loc[idx, 'original_title']
        if title.lower() != data.get('original_title', '').lower():
            recommendations.append({
                'title': title,
                'year': str(df.loc[idx, 'year']) if 'year' in df.columns else 'N/A',
                'genres': df.loc[idx, 'genres'],
                'source': 'CSV'
            })
        if len(recommendations) >= 5:
            break
    
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True)