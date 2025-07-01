let currentMovieTitle = '';

async function createIMDbLink(movie) {
  if (movie.id) {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=ca0f0e581cfad472ea740994645eb2d9`);
      const data = await response.json();
      if (data.imdb_id) {
        return `https://www.imdb.com/title/${data.imdb_id}/`;
      }
    } catch (error) {
      console.error('Error fetching TMDB details:', error);
    }
  }
  return `https://www.imdb.com/find?q=${encodeURIComponent(movie.title)}&s=tt&exact=true`;
}

async function updateUI(recommendations) {
  const container = document.getElementById('recommendations');
  const header = document.getElementById('header');
  
  container.innerHTML = '';
  
  if (!recommendations.length) {
    header.textContent = 'No recommendations found';
    container.textContent = `Could not get recommendations for "${currentMovieTitle || 'this movie'}".`;
    return;
  }
  
  header.textContent = `Recommendations for "${currentMovieTitle}"`;
  
  for (const movie of recommendations) {
    const item = document.createElement('div');
    const link = document.createElement('a');
    link.href = await createIMDbLink(movie);
    link.target = '_blank';
    link.textContent = `${movie.title} (${movie.year || 'N/A'})`;
    item.appendChild(link);
    container.appendChild(item);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({ action: 'getCachedRecommendations' }, response => {
    if (response?.movieTitle) {
      currentMovieTitle = response.movieTitle;
    }
    updateUI(response?.data || []);
  });
  
  document.getElementById('refresh-btn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'triggerExtraction' });
    });
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "recommendations") {
    if (message.movieTitle) {
      currentMovieTitle = message.movieTitle;
    }
    updateUI(message.data || []);
  }
});