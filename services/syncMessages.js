// Texts for the sync popups: say which service answered and what the answer means for the user,
// keeping the raw answer as "Details" for troubleshooting.

const MAX_DETAIL = 300;

function detailOf(error) {
    const data = error?.response?.data;
    let text = typeof data === 'string' ? data : data ? JSON.stringify(data) : error?.message;
    text = (text ?? '').trim();
    return text.length > MAX_DETAIL ? `${text.slice(0, MAX_DETAIL)}...` : text;
}

const withDetail = (message, detail) => (detail ? `${message}\n\nDetails: ${detail}` : message);

// Intervals.icu answers a successful PUT /wellness with 200.
export function intervalsSuccessMessage() {
    return 'Intervals.icu: today\'s wellness data was saved.';
}

// Returns {message, clearApiKey}.
export function intervalsErrorMessage(error) {
    const status = error?.response?.status;
    const detail = detailOf(error);
    if (!status) {
        return { message: withDetail('Intervals.icu did not answer. Check your internet connection and try again.', detail), clearApiKey: false };
    }
    if (status === 401 || status === 403) {
        return {
            message: withDetail(`Intervals.icu rejected the API key (HTTP ${status}). It has been removed: enter it again `
                + '(Intervals.icu > Settings > Developer Settings > API Key).', detail),
            clearApiKey: true,
        };
    }
    if (status === 429) {
        return { message: withDetail('Intervals.icu: too many requests (HTTP 429). Wait a few minutes and try again.', detail), clearApiKey: false };
    }
    if (status >= 500) {
        return { message: withDetail(`Intervals.icu has a problem on its side (HTTP ${status}). Try again later.`, detail), clearApiKey: false };
    }
    return { message: withDetail(`Intervals.icu did not accept the data (HTTP ${status}).`, detail), clearApiKey: false };
}

// YAGCC answers 201 when the weighing was uploaded and 200 (with a clientId) when Garmin asks for the MFA code.
// Returns {message, mfaRequested}.
export function garminResponseMessage(response) {
    if (response?.status === 201) {
        return { message: 'Garmin Connect: the weighing was uploaded.', mfaRequested: false };
    }
    if (response?.status === 200 && response?.data?.clientId) {
        return {
            message: 'Garmin Connect asks for your two-step verification code: enter it in the MFA code field and tap Sync Data again.',
            mfaRequested: true,
        };
    }
    return { message: `Garmin Connect: unexpected answer from the proxy (HTTP ${response?.status}).`, mfaRequested: false };
}

// YAGCC answers errors with 400 and a text like "AuthStatus: <status>, Last Error log: ...".
// Returns {message, clearTokens}.
export function garminErrorMessage(error) {
    const status = error?.response?.status;
    const detail = detailOf(error);
    const result = (message, clearTokens = false) => ({ message: withDetail(message, detail), clearTokens });

    if (!status) {
        return result('Garmin Connect: the proxy (YAGCC) did not answer. If it is hosted on a free plan it may be starting up: '
            + 'wait a minute and try again.');
    }
    if (/\b429\b|Too Many Requests|BlockedByCloudFlare/i.test(detail)) {
        return result('Garmin is limiting logins from your account or from the proxy server (HTTP 429). Do not retry for several '
            + 'hours: every attempt can extend the block. Meanwhile you can use "Generate only .fit file" and import it in Garmin Connect.');
    }
    if (/InvalidMFACode/.test(detail)) {
        return result('Garmin rejected the two-step verification code. Tap Sync Data again to get a new one.');
    }
    if (/OAuthToken2IsNullFromSavedOAuth1/.test(detail)) {
        return result('The saved Garmin session is no longer valid and has been removed. Tap Sync Data again to log in.', true);
    }
    if (/AuthenticationFailedCheckCredencials|AuthenticationFailed\b|401 \(Unauthorized\)/.test(detail)) {
        return result('Garmin rejected the login. Check your Garmin email and password and try again.', true);
    }
    if (status >= 500) {
        return result(`Garmin Connect: the proxy (YAGCC) failed (HTTP ${status}). Try again later.`);
    }
    return result(`Garmin Connect: the upload failed (HTTP ${status}).`);
}
