#  IMDb Movie/Series Recommender Chrome Extension

A Chrome Extension that recommends similar movies or TV series when you're viewing a title on [IMDb](https://www.imdb.com/), using TMDB's recommendation engine.


## Features

-  Extracts movie/series info directly from IMDb pages
-  Fetches recommendations using the TMDB API and movies database(using TF-vectorisation)
-  Supports both **movies** and **TV series**
-  Displays poster, title, release year, type, and duration/seasons
-  Manual refresh button to reload recommendations


## Example

![image](https://github.com/user-attachments/assets/8d7b07b4-3b0b-4a07-ad03-11e6f54cbe23)


## Challenges and Solutions:
1. Handling IMDb's Dynamic and Inconsistent Page Structure:  
IMDb’s HTML layout changes frequently and uses dynamically generated class names, making it unreliable to target elements by CSS class. To address this, the extension uses data-testid attributes (which are   more stable) for extracting key information like title, cast, genres, and keywords. It also includes fallback selectors, ensuring data is still retrieved even if the primary selector fails.

2. Differentiating Between Movies and TV Series for TMDB Queries:  
TMDB requires the correct media type (movie or tv) when fetching recommendations, but IMDb pages don’t clearly distinguish them. This was solved by inspecting the <meta property="og:type"> tag on the IMDb page to infer whether the content is a movie or a TV series. This type hint is then passed along to TMDB when making API requests, ensuring the correct results are fetched.

3. Ensuring Accurate Matching and Recommendation Retrieval from TMDB:   
IMDb titles don’t always match exactly with TMDB’s records, especially for foreign titles, long titles, or those with subtitles. To solve this, the extension searches both /movie and /tv endpoints simultaneously on TMDB, and uses the inferred type to prioritize the more relevant results. If no perfect match is found, it defaults to the first available result, ensuring the extension still functions gracefully.


## Installation

1. Clone or download this repository:

   ```cmd
   git clone https://github.com/aadityasahoo24/imdb-recommender.git
   cd imdb-recommender
   ```
2. Open Chrome and navigate to [extensions](chrome://extensions/), and enable Developer Mode (top right)

3. Click "Load unpacked" and select the project folder

4. Visit any movie or series page on IMDb and click the extension icon to see recommendations


## Project Structure

```bash
├── background.js         # Handles TMDB API calls and recommendation logic
├── content.js            # Extracts data from IMDb pages
├── popup.html            # Popup interface shown when the extension is clicked
├── popup.js              # Handles UI logic and detail fetching for TMDB items
├── manifest.json         # Chrome extension configuration
└── README.md             # This file
```


## TMDB API Key

This project uses the TMDB API. Replace the ```TMDB_API_KEY``` value in both:

-  background.js
-  popup.js

You can get your own API key by signing up at the [TMDB Developer Portal](https://www.themoviedb.org/settings/api).


## Tech Stack

-  JavaScript (Vanilla)
-  HTML & CSS
-  Chrome Extension APIs (used through browser)
-  IMDb DOM scraping
-  TMDB API


## Future Improvements

-  Use ```sentence-transformers``` or similar models for better content-based similarity
-  Support genre-based filtering or sorting
-  Keep memory for preferences, and "train" model on user preferences for better predictions
-  Add options page for user preferences (i.e. adjust priority for recommendation, hide age restricted movies, etc.)


  
