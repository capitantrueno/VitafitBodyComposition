// Proxy API endpoints, set at build time (Next.js inlines NEXT_PUBLIC_* variables). See .env.example.
const YAGCC_URL = process.env.NEXT_PUBLIC_YAGCC_URL;

const endpoint = (base, name, path) => {
    if (!base) throw new Error(`${name} is not configured`);
    return base.replace(/\/+$/, '') + path;
};

// YAGCC (yet-another-garmin-connect-client): Garmin Connect upload and ".fit file only" downloads
// from /sync/bodycomposition.
export const yagccUploadUrl = () => endpoint(YAGCC_URL, 'NEXT_PUBLIC_YAGCC_URL', '/upload');
