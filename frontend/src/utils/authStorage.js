const AUTH_TOKEN_KEY = 'authToken';
const USER_ROLE_KEY = 'userRole';
const USER_EMAIL_KEY = 'userEmail';
const CAFE_ID_KEY = 'cafeId';

export const authStorage = {
    getToken: () => localStorage.getItem(AUTH_TOKEN_KEY),
    setToken: (token) => localStorage.setItem(AUTH_TOKEN_KEY, token),

    getRole: () => localStorage.getItem(USER_ROLE_KEY),
    setRole: (role) => localStorage.setItem(USER_ROLE_KEY, role),

    getUserEmail: () => localStorage.getItem(USER_EMAIL_KEY),
    setUserEmail: (email) => localStorage.setItem(USER_EMAIL_KEY, email),

    getCafeId: () => localStorage.getItem(CAFE_ID_KEY),
    setCafeId: (cafeId) => {
        if (cafeId === null || cafeId === undefined || cafeId === '') {
            localStorage.removeItem(CAFE_ID_KEY);
            return;
        }
        localStorage.setItem(CAFE_ID_KEY, String(cafeId));
    },

    clear: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_ROLE_KEY);
        localStorage.removeItem(USER_EMAIL_KEY);
        localStorage.removeItem(CAFE_ID_KEY);
    },
};
