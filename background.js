let cachedRecommendations = [];
let currentMovieTitle = '';

async function getTmdbRecommendations(title) {
  try {
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=ca0f0e581cfad472ea740994645eb2d9&query=${encodeURIComponent(title)}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    if (!searchData.results?.length) return [];
    
    const movieId = searchData.results[0].id;
    const recUrl = `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=ca0f0e581cfad472ea740994645eb2d9`;
    const recRes = await fetch(recUrl);
    const recData = await recRes.json();
    
    return recData.results?.slice(0, 5).map(movie => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date?.split('-')[0] || 'N/A',
      source: 'TMDB'
    })) || [];
  } catch (error) {
    console.error('TMDB API error:', error);
    return [];
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "movieDataExtracted") {
    currentMovieTitle = message.movie.original_title;
    
    // First try TMDB recommendations
    getTmdbRecommendations(message.movie.original_title).then(tmdbRecs => {
      // Then get CSV recommendations (if implemented)
      chrome.runtime.sendMessage({ 
        action: "recommendations", 
        data: tmdbRecs.slice(0, 5),
        movieTitle: currentMovieTitle
      });
    });
  }
  
  if (message.action === 'getCachedRecommendations') {
    sendResponse({ 
      data: cachedRecommendations,
      movieTitle: currentMovieTitle
    });
  }
});