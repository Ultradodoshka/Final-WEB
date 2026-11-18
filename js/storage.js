class StorageManager {
    static get(key, fallback = []) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return fallback;
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) || (parsed && typeof parsed === 'object') ? parsed : fallback;
        } catch (error) {
            console.warn(`Invalid JSON in localStorage for key "${key}". Resetting.`, error);
            localStorage.removeItem(key);
            return fallback;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Failed to save to localStorage for key "${key}":`, error);
            return false;
        }
    }

    static clear(key) {
        localStorage.removeItem(key);
    }
}