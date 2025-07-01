(function() {
  function extractIMDbData() {
    const movie = {};
    
    // Title
    const titleElement = document.querySelector('h1[data-testid="hero-title-block__title"]') || 
                         document.querySelector('h1');
    movie.original_title = titleElement ? titleElement.textContent.trim() : '';
    
    // Director
    const directorSection = [...document.querySelectorAll('li.ipc-metadata-list__item')]
      .find(el => el.textContent.includes('Director'));
    movie.director = directorSection ? 
      directorSection.querySelector('a')?.textContent.trim() || '' : '';
    
    // Cast (first 5 actors)
    const castElements = [...document.querySelectorAll('a[data-testid="title-cast-item__actor"]')].slice(0, 5);
    movie.cast = castElements.map(el => el.textContent.trim()).join('|');
    
    // Keywords
    const keywordElements = [...document.querySelectorAll('a[data-testid="storyline-keyword"]')];
    movie.keywords = keywordElements.map(el => el.textContent.trim().toLowerCase()).join('|');
    
    // Genres
    const genreElements = [...document.querySelectorAll('[data-testid="genres"] a')];
    movie.genres = genreElements.map(el => el.textContent.trim()).join('|');

    // Determine type
const typeTag = document.querySelector('[data-testid="hero-title-block__metadata"] li')?.textContent.toLowerCase();
movie.type = typeTag?.includes('tv series') || typeTag?.includes('tv') ? 'tv' : 'movie';

    
    return movie;
  }

  // Send data when page loads
  const movieData = extractIMDbData();
  if (movieData.original_title) {
    chrome.runtime.sendMessage({ 
      action: "movieDataExtracted", 
      movie: movieData 
    });
  }

  // Listen for reload requests from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'triggerExtraction') {
      const movie = extractIMDbData();
      chrome.runtime.sendMessage({ action: "movieDataExtracted", movie });
    }
  });
})();