let currentMovieTitle = '';

const TMDB_API_KEY = 'ca0f0e581cfad472ea740994645eb2d9';

async function fetchTmdbDetails(movie) {
  const type = movie.type === 'tv' ? 'tv' : 'movie';
  try {
    const response = await fetch(`https://api.themoviedb.org/3/${type}/${movie.id}?api_key=${TMDB_API_KEY}`);
    const data = await response.json();

    return {
      imdbUrl: data.imdb_id 
        ? `https://www.imdb.com/title/${data.imdb_id}/` 
        : `https://www.imdb.com/find?q=${encodeURIComponent(movie.title)}&s=tt&exact=true`,
      posterUrl: data.poster_path 
        ? `https://image.tmdb.org/t/p/w200${data.poster_path}` 
        : null,
      extraInfo: movie.type === 'tv' 
        ? `${data.number_of_seasons || 'N/A'} season${data.number_of_seasons > 1 ? 's' : ''}` 
        : `${data.runtime || 'N/A'} min`
    };
  } catch (err) {
    console.error('TMDB details fetch failed:', err);
    return {
      imdbUrl: `https://www.imdb.com/find?q=${encodeURIComponent(movie.title)}&s=tt&exact=true`,
      posterUrl: null,
      extraInfo: 'N/A'
    };
  }
}

async function updateUI(recommendations) {
  console.log('Received recommendations:', recommendations);
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
    const { imdbUrl, posterUrl, extraInfo } = await fetchTmdbDetails(movie);

    const item = document.createElement('div');
    item.style.display = 'grid';
    item.style.gridTemplateColumns = '80px 1fr';
    item.style.gridTemplateRows = 'auto auto';
    item.style.columnGap = '10px';
    item.style.marginBottom = '12px';
    item.style.alignItems = 'center';

    const img = document.createElement('img');
    img.src = posterUrl || 'https://via.placeholder.com/80x120?text=No+Image';
    img.alt = movie.title;
    img.style.gridRow = '1 / span 2';
    img.style.width = '80px';
    img.style.borderRadius = '4px';

    const titleLink = document.createElement('a');
    titleLink.href = imdbUrl;
    titleLink.target = '_blank';
    titleLink.textContent = movie.title;
    titleLink.style.fontWeight = 'bold';
    titleLink.style.color = '#0366d6';
    titleLink.style.textDecoration = 'none';
    titleLink.style.gridColumn = '2';
    titleLink.style.gridRow = '1';

    const meta = document.createElement('div');
    meta.textContent = `${movie.year} • ${movie.type.toUpperCase()} • ${extraInfo}`;
    meta.style.fontSize = 'smaller';
    meta.style.color = '#555';
    meta.style.gridColumn = '2';
    meta.style.gridRow = '2';

    item.appendChild(img);
    item.appendChild(titleLink);
    item.appendChild(meta);
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
