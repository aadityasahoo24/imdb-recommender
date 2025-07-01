let cachedRecommendations = [];
let currentMovieTitle = '';

const TMDB_API_KEY = 'ca0f0e581cfad472ea740994645eb2d9';

async function getTmdbRecommendations(title, typeHint = null) {
  try {
    const [movieRes, tvRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`),
      fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`)
    ]);

    const movieData = await movieRes.json();
    const tvData = await tvRes.json();

    let bestMatch;

    if (typeHint === 'tv' && tvData.results.length) {
      bestMatch = { ...tvData.results[0], type: 'tv' };
    } else if (typeHint === 'movie' && movieData.results.length) {
      bestMatch = { ...movieData.results[0], type: 'movie' };
    } else {
      const combined = [
        ...(movieData.results || []).map(item => ({ ...item, type: 'movie' })),
        ...(tvData.results || []).map(item => ({ ...item, type: 'tv' }))
      ];
      bestMatch = combined[0];
    }

    if (!bestMatch) return [];

    const recUrl = `https://api.themoviedb.org/3/${bestMatch.type}/${bestMatch.id}/recommendations?api_key=${TMDB_API_KEY}`;
    const recRes = await fetch(recUrl);
    const recData = await recRes.json();

    return (recData.results || []).slice(0, 5).map(item => ({
      id: item.id,
      title: item.title || item.name,
      year: (item.release_date || item.first_air_date || 'N/A').split('-')[0],
      type: bestMatch.type
    }));
  } catch (error) {
    console.error('TMDB API error:', error);
    return [];
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "movieDataExtracted") {
  currentMovieTitle = message.movie.original_title;
  const typeHint = message.movie.type;

  getTmdbRecommendations(message.movie.original_title, typeHint).then(tmdbRecs => {
    cachedRecommendations = tmdbRecs;
    chrome.runtime.sendMessage({
      action: "recommendations",
      data: tmdbRecs.slice(0, 5),
      movieTitle: currentMovieTitle
    });
  });
}
});