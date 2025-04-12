// This function normalizes image paths from the backend
function getImageUrl(path) {
    // Base URL for the API
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:5000'
        : 'https://poster-evaluation-a11y-production.up.railway.app';
    
    if (!path) return null;
    
    // If path already includes the get-image prefix
    if (path.startsWith('get-image/')) {
        return `${API_BASE_URL}/${path}`;
    }
    
    // Otherwise add it
    return `${API_BASE_URL}/get-image/${path.replace(/^\//, '')}`;
}