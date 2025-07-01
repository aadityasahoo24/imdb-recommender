let cachedRecommendations = [];
let currentMovieTitle = '';

async function getTmdbRecommendations(title) {
  try {
    // Search both movies and series
    const movieRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=ca0f0e581cfad472ea740994645eb2d9&query=${encodeURIComponent(title)}`);
    const movieData = await movieRes.json();

    const tvRes = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=ca0f0e581cfad472ea740994645eb2d9&query=${encodeURIComponent(title)}`);
    const tvData = await tvRes.json();

    const combined = [
      ...(movieData.results || []).map(item => ({ ...item, type: 'movie' })),
      ...(tvData.results || []).map(item => ({ ...item, type: 'tv' }))
    ];

    if (!combined.length) return [];

    // Pick best match
    const bestMatch = combined[0];

    const recUrl = `https://api.themoviedb.org/3/${bestMatch.type}/${bestMatch.id}/recommendations?api_key=ca0f0e581cfad472ea740994645eb2d9`;
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
  const movieType = message.movie.type;

  getTmdbRecommendations(currentMovieTitle, movieType).then(recs => {
    cachedRecommendations = recs;
    chrome.runtime.sendMessage({
      action: "recommendations",
      data: recs,
      movieTitle: currentMovieTitle
    });
  });
}
});