// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { intervalsSuccessMessage, intervalsErrorMessage, garminResponseMessage, garminErrorMessage } from './syncMessages.js';

const httpError = (status, data) => ({ message: `Request failed with status code ${status}`, response: { status, data } });

test('Intervals success names the service', () => {
    assert.match(intervalsSuccessMessage(), /^Intervals\.icu: /);
});

test('Intervals 401 asks for the API key again and clears it', () => {
    const r = intervalsErrorMessage(httpError(401, { status: 401, error: 'Unauthorized' }));
    assert.match(r.message, /rejected the API key \(HTTP 401\)/);
    assert.match(r.message, /Details: \{"status":401,"error":"Unauthorized"\}/);
    assert.equal(r.clearApiKey, true);
});

test('Intervals network error does not crash without a response body', () => {
    const r = intervalsErrorMessage({ message: 'Network Error' });
    assert.match(r.message, /did not answer/);
    assert.match(r.message, /Details: Network Error/);
    assert.equal(r.clearApiKey, false);
});

test('Garmin 201 and MFA answers', () => {
    assert.deepEqual(garminResponseMessage({ status: 201, data: {} }), { message: 'Garmin Connect: the weighing was uploaded.', mfaRequested: false });
    assert.equal(garminResponseMessage({ status: 200, data: { clientId: 'x' } }).mfaRequested, true);
});

test('Garmin 429 from YAGCC is explained and keeps the details', () => {
    const yagcc = 'AuthStatus: OAuth1TokensAreEmpty, Last Error log: Auth appeared successful but failed to get the OAuth1 token. | '
        + 'Error during OAuth1 handling, returned from https://connectapi.garmin.com/...: Call failed with status code 429 (Too Many Requests)';
    const r = garminErrorMessage(httpError(400, yagcc));
    assert.match(r.message, /limiting logins .*\(HTTP 429\)/);
    assert.match(r.message, /Details: AuthStatus: OAuth1TokensAreEmpty/);
    assert.equal(r.clearTokens, false);
});

test('Garmin wrong credentials clear the saved tokens', () => {
    const r = garminErrorMessage(httpError(400, 'AuthStatus: AuthenticationFailedCheckCredencials, Last Error log: Call failed with status code 401 (Unauthorized)'));
    assert.match(r.message, /Check your Garmin email and password/);
    assert.equal(r.clearTokens, true);
});

test('Garmin proxy not reachable', () => {
    assert.match(garminErrorMessage({ message: 'Network Error' }).message, /proxy \(YAGCC\) did not answer/);
});

test('long details are truncated', () => {
    const r = garminErrorMessage(httpError(400, 'x'.repeat(1000)));
    assert.ok(r.message.length < 450);
});
