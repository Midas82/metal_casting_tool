/**
 * localStorage that cannot take the app down.
 *
 * A corrupt key, a quota error or Safari private mode all used to throw
 * during render and leave a white screen with no way back. Everything here
 * degrades to the supplied fallback instead.
 */
const PREFIX = 'midas_';

export const loadJSON = (key, fallback) => {
    try {
        const raw = localStorage.getItem(PREFIX + key);
        if (raw === null) return fallback;
        const parsed = JSON.parse(raw);
        return parsed === null || parsed === undefined ? fallback : parsed;
    } catch {
        // Corrupt or unreadable - drop the bad key so it cannot poison a reload.
        try {
            localStorage.removeItem(PREFIX + key);
        } catch { /* storage unavailable entirely */ }
        return fallback;
    }
};

export const saveJSON = (key, value) => {
    try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
        return true;
    } catch {
        return false; // quota exceeded or storage disabled; not fatal
    }
};

export const STORAGE_KEYS = {
    geometry: 'pattern_geometry',
    height: 'pattern_height',
    shrinkage: 'pattern_shrinkage',
    material: 'pattern_material',
    vault: 'vault',
};
