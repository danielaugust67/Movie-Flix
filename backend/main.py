from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
BASE_URL = "https://api.themoviedb.org/3"

# Cache for movies data
movies_df = None
tfidf_matrix = None
cosine_sim = None

def fetch_movies(page=1):
    url = f"{BASE_URL}/discover/movie"
    params = {
        "api_key": TMDB_API_KEY,
        "language": "en-US",
        "sort_by": "popularity.desc",
        "include_adult": False,
        "include_video": False,
        "page": page
    }
    response = requests.get(url, params=params)
    return response.json()

def fetch_popular_movies():
    url = f"{BASE_URL}/movie/popular"
    params = {
        "api_key": TMDB_API_KEY,
        "language": "en-US",
        "page": 1
    }
    response = requests.get(url, params=params)
    return response.json()["results"]

def prepare_content_based_filtering():
    global movies_df, tfidf_matrix, cosine_sim
    
    # Fetch popular movies
    movies = fetch_popular_movies()
    
    # Create DataFrame
    movies_df = pd.DataFrame(movies)
    
    # Combine features for content-based filtering
    movies_df['combined_features'] = movies_df['overview'] + ' ' + movies_df['title']
    
    # Create TF-IDF matrix
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(movies_df['combined_features'])
    
    # Calculate cosine similarity
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

@app.on_event("startup")
async def startup_event():
    prepare_content_based_filtering()

@app.get("/movies")
async def get_movies(page: int = 1):
    try:
        response = fetch_movies(page)
        return {
            "movies": response["results"],
            "total_pages": response["total_pages"],
            "current_page": response["page"],
            "total_results": response["total_results"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/movies/popular")
async def get_popular_movies():
    try:
        movies = fetch_popular_movies()
        return {"movies": movies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/movies/recommend/{movie_id}")
async def get_movie_recommendations(movie_id: int):
    try:
        # Find the index of the movie in our DataFrame
        idx = movies_df[movies_df['id'] == movie_id].index[0]
        
        # Get similarity scores
        sim_scores = list(enumerate(cosine_sim[idx]))
        
        # Sort movies based on similarity scores
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Get top 5 similar movies (excluding the movie itself)
        sim_scores = sim_scores[1:6]
        
        # Get movie indices
        movie_indices = [i[0] for i in sim_scores]
        
        # Return recommended movies
        recommendations = movies_df.iloc[movie_indices][['id', 'title', 'overview', 'poster_path']].to_dict('records')
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)