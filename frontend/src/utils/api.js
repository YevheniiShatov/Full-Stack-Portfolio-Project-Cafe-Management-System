const rawBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

export const apiUrl = (path = '') => {
    const normalizedPath = path
        ? (path.startsWith('/') ? path : `/${path}`)
        : '';

    return `${API_BASE_URL}${normalizedPath}`;
};
