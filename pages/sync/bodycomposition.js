import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios';
import useLocalStorageState from 'use-local-storage-state'
import { useBodyCompositionContext } from '../../contexts/bodycomposition.context';

export default function BodyComposition() {
    const { bodyComposition, setBodyComposition } = useBodyCompositionContext();
    const [weight, setWeight] = useState(bodyComposition.weight ?? 0);
    const [bmi, setBmi] = useState(bodyComposition.bmi ?? 0);
    const [fat, setFat] = useState(bodyComposition.fat ?? 0);
    const [muscleMass, setMuscleMass] = useState(bodyComposition.muscleMass ?? 0);
    const [waterPercentage, setWaterPercentage] = useState(bodyComposition.waterPercentage ?? 0);
    const [boneMass, setBoneMass] = useState(bodyComposition.boneMass ?? 0);
    const [visceralFat, setVisceralFat] = useState(bodyComposition.visceralFat ?? 0);
    const [metabolicAge, setMetabolicAge] = useState(bodyComposition.metabolicAge ?? 0);
    const [bodyType, setBodyType] = useState(bodyComposition.bodyType ?? 0);
    const [syncToGarmin, setSyncToGarmin] = useLocalStorageState('syncToGarmin', { defaultValue: false });
    useEffect(() => {
        let value;
        value = (localStorage.getItem("syncToGarmin") || false) === 'true'
        setSyncToGarmin(value)
    }, [])
    const checkSyncToGarminHandler = () => {
        localStorage.setItem("syncToGarmin", !syncToGarmin)
        setSyncToGarmin(!syncToGarmin)
    }
    const [garminEmail, setGarminEmail] = useLocalStorageState('garminEmail', {
        defaultValue: ''
    });
    const [garminPassword, setGarminPassword] = useState('');
    const [showGarminMFACode, setShowGarminMFACode] = useState(false);
    const [garminMfaCode, setGarminMfaCode] = useState('');
    const [garminClientId, setGarminClientId] = useState('');
    const [garminAccessToken, setGarminAccessToken] = useLocalStorageState('garminAccessToken', {
        defaultValue: ''
    });
    const [garminTokenSecret, setGarminTokenSecret] = useLocalStorageState('garminTokenSecret', {
        defaultValue: ''
    });
    const [saveGarminToken, setSaveGarminToken] = useLocalStorageState('saveGarminToken', {
        defaultValue: false
    });

    useEffect(() => {
        let value;
        value = (localStorage.getItem("saveGarminToken") || false) === 'true'
        setSaveGarminToken(value)
    }, [])
    const checkSaveGarminTokenHandler = () => {
        localStorage.setItem("saveGarminToken", !saveGarminToken)
        setSaveGarminToken(!saveGarminToken)
    }

    const isGarminTokenSaved = saveGarminToken && garminAccessToken && garminTokenSecret;

    const clearTokens = async () => {
        clearGarminTokens();
        clearIntervalsToken();
    }
    const clearGarminTokens = async () => {
        setGarminAccessToken('');
        setGarminTokenSecret('');
    }
    const clearIntervalsToken = async () => {
        setIntervalsApiKey('');
    }

    const [syncToIntervals, setSyncToIntervals] = useLocalStorageState('syncToIntervals', { defaultValue: false });
    useEffect(() => {
        let value;
        value = (localStorage.getItem("syncToIntervals") || false) === 'true'
        setSyncToIntervals(value)
    }, [])
    const checkSyncToIntervalsHandler = () => {
        localStorage.setItem("syncToIntervals", !syncToIntervals)
        setSyncToIntervals(!syncToIntervals)
    }
    const [intervalsApiKey, setIntervalsApiKey] = useLocalStorageState('intervalsApiKey', {
        defaultValue: ''
    });

    const [saveIntervalsApiKey, setSaveIntervalsApiKey] = useLocalStorageState('saveIntervalsApiKey', {
        defaultValue: false
    });

    useEffect(() => {
        let value;
        value = (localStorage.getItem("saveIntervalsApiKey") || false) === 'true'
        setSaveIntervalsApiKey(value)
    }, [])
    const checkSaveIntervalsApiKeyHandler = () => {
        localStorage.setItem("saveIntervalsApiKey", !saveIntervalsApiKey)
        setSaveIntervalsApiKey(!saveIntervalsApiKey)
    }
    const isIntervalsApiKeySaved = saveIntervalsApiKey && intervalsApiKey;

    const preapareApiRequest = () => {
        const bodyFatFree = parseFloat(weight) * (1 - (parseFloat(fat ?? 0)) * 0.01);
        const protein = bodyFatFree * (parseFloat(muscleMass ?? 0) * 0.01);
        const payload =
        {
            timeStamp: -1,
            weight: parseFloat(weight),
            percentFat: parseFloat(fat ?? 0),
            percentHydration: parseFloat(waterPercentage ?? 0),
            boneMass: parseFloat(boneMass ?? 0),
            muscleMass: protein ?? 0,
            visceralFatRating: parseFloat(visceralFat ?? 0),
            metabolicAge: parseFloat(metabolicAge ?? 0),
            bodyMassIndex: parseFloat(bmi ?? 0),
        }

        return payload;
    }

    const generateFitFile = async (event) => {
        event.preventDefault();
        const payload = { ...preapareApiRequest(), createOnlyFile: true };
        try {
            let axiosConfig = {
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                responseType: 'blob'
            };

            await axios
                .post('https://frog01-20364.wykr.es/upload', payload, axiosConfig)
                .then(response => {
                    // create file link in browser's memory
                    const href = URL.createObjectURL(response.data);

                    // create "a" HTML element with href to file & click
                    const link = document.createElement('a');
                    link.href = href;
                    link.setAttribute('download', `garmin_weight_${(new Date().toJSON().slice(0, 10))}.fit`); //or any other extension
                    document.body.appendChild(link);
                    link.click();

                    // clean up "a" element & remove ObjectURL
                    document.body.removeChild(link);
                    URL.revokeObjectURL(href);
                })
                .catch(error => {
                    console.log(error);
                });

        }
        catch (err) {
            console.log(err);
            alert("Error, check console");
        }
    }

    const submitForm = async (event) => {
        event.preventDefault();

        const payload = preapareApiRequest();
        try {
            let axiosConfig = {
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            };

            if (syncToIntervals) {
                const base64Encoded = btoa(`API_KEY:${intervalsApiKey}`);
                const intervalsAxiosConfig = {
                    headers: {
                        ...axiosConfig.headers,
                        'Authorization': `Basic ${base64Encoded}`
                    }
                };
                const today = new Date().toISOString().split('T')[0];
                const { timeStamp, percentFat, percentHydration, boneMass, muscleMass, visceralFat, visceralFatRating, metabolicAge, bodyMassIndex, ...rest } = payload;
                const intervalsPayload = {
                    id: today,
                    BMI: bodyMassIndex,
                    bodyFat: percentFat,
                    BoneMass: boneMass,
                    MuscleMass: muscleMass,
                    VisceralFat: visceralFat,
                    Water: percentHydration,
                    ...rest
                };

                await axios
                    .put('https://intervals.icu/api/v1/athlete/0/wellness', intervalsPayload, intervalsAxiosConfig)
                    .then(response => {

                        if (response.status === 201) {
                            alert("Success. Uploaded to Intervals.");
                        }
                        else {
                            alert(`Response Status: ${response.status}`);
                        }
                        if (response.status === 401) {
                            clearIntervalsToken();
                        }

                    })
                    .catch(error => {
                        console.log(error);
                        console.table(error);

                        const errorMessage = error?.response?.data;
                        if (errorMessage && errorMessage.error.includes('401 (Unauthorized)')) {
                            clearIntervalsToken();
                        }
                        alert(`${errorMessage.error}`);
                    });

            }

            if (syncToGarmin) {

                const garminPayload = {
                    ...payload,
                    garminEmail,
                    garminPassword,
                    garminMfaCode,
                    garminClientId,
                    garminAccessToken,
                    garminTokenSecret
                };

                await axios
                    .post('https://frog01-20364.wykr.es/upload', garminPayload, axiosConfig)
                    .then(response => {
                        console.log(response);
                        if (saveGarminToken && response.data.uploadResult.accessToken && response.data.uploadResult.tokenSecret) {
                            setGarminAccessToken(response.data.uploadResult.accessToken);
                            setGarminTokenSecret(response.data.uploadResult.tokenSecret);
                        }
                        if (response.status === 201) {
                            alert("Success. Uploaded.");
                            setShowGarminMFACode(false);
                        } else if (response.status === 200) {
                            setShowGarminMFACode(true);
                            setGarminClientId(response.data.clientId);
                            alert("MFA/2FA Code required. Please provide it.");
                        }
                        else {
                            alert(`Response Status: ${response.status}`);
                        }
                        if (response.status === 401) {
                            clearGarminTokens();
                        }

                    })
                    .catch(error => {
                        console.log(error);
                        const errorMessage = error?.response?.data;
                        if (errorMessage && errorMessage.includes('401 (Unauthorized)')) {
                            clearGarminTokens();
                        }
                        alert(`${errorMessage}`);
                    });
            }

        }
        catch (err) {
            console.log(err);
            alert("Error, check console");
        }
    };

    return (
        <>
            <div className='flex flex-wrap'>
                <div className='w-full max-w-sm ml-auto mr-auto'>
                    <h1 className='text-2xl font-bold text-center mb-5'>Sync Body Composition Form</h1>
                    <form onSubmit={submitForm}
                        className=''>
                        <div className=' flex justify-between gap-2'>
                            <label className="block">
                                <span className="text-gray-700">Weight (Kg)</span>
                                <input
                                    type="number"
                                    name="weight"
                                    step="0.01"
                                    min={0}
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="
                                mt-1
                                block
                                w-full
                                rounded-md
                                border-gray-300
                                shadow-sm
                                focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                              "
                                    placeholder=""
                                />
                            </label>
                            <label className="block">
                                <span className="text-gray-700">BMI</span>
                                <input
                                    type="number"
                                    name="bmi"
                                    step="0.01"
                                    min={0}
                                    value={bmi}
                                    onChange={(e) => setBmi(e.target.value)}
                                    className="
                                mt-1
                                block
                                w-full
                                rounded-md
                                border-gray-300
                                shadow-sm
                                focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                              "
                                    placeholder=""
                                />
                            </label>
                        </div>
                        <div className='flex justify-between gap-2'>
                            <label className="block">
                                <span className="text-gray-700">Body Fat (%)</span>
                                <input
                                    type="number"
                                    name="fat"
                                    step="0.01"
                                    min={0}
                                    value={fat}
                                    onChange={(e) => setFat(e.target.value)}
                                    className="
                        mt-1
                        block
                        w-full
                        rounded-md
                        border-gray-300
                        shadow-sm
                        focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                      "
                                    placeholder=""
                                />
                            </label>
                            <label className="block">
                                <span className="text-gray-700">Muscle Mass (Protein %)</span>
                                <input
                                    type="number"
                                    name="muscleMass"
                                    step="0.01"
                                    min={0}
                                    value={muscleMass}
                                    onChange={(e) => setMuscleMass(e.target.value)}
                                    className="
                        mt-1
                        block
                        w-full
                        rounded-md
                        border-gray-300
                        shadow-sm
                        focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                      "
                                    placeholder=""
                                />
                            </label></div>
                        <div className='flex justify-between gap-2'>
                            <label className="block">
                                <span className="text-gray-700">Body Water (%)</span>
                                <input
                                    type="number"
                                    name="waterPercentage"
                                    step="0.01"
                                    min={0}
                                    value={waterPercentage}
                                    onChange={(e) => setWaterPercentage(e.target.value)}
                                    className="
                        mt-1
                        block
                        w-full
                        rounded-md
                        border-gray-300
                        shadow-sm
                        focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                      "
                                    placeholder=""
                                />
                            </label>
                            <label className="block">
                                <span className="text-gray-700">Bone Mass (Kg)</span>
                                <input
                                    type="number"
                                    name="boneMass"
                                    step="0.01"
                                    min={0}
                                    value={boneMass}
                                    onChange={(e) => setBoneMass(e.target.value)}
                                    className="
                        mt-1
                        block
                        w-full
                        rounded-md
                        border-gray-300
                        shadow-sm
                        focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                      "
                                    placeholder=""
                                />
                            </label></div>
                        <div className='flex justify-between gap-2'>
                            <label className="block">
                                <span className="text-gray-700">Visceral Fat</span>
                                <input
                                    type="number"
                                    name="visceralFat"
                                    step="0.01"
                                    min={0}
                                    value={visceralFat}
                                    onChange={(e) => setVisceralFat(e.target.value)}
                                    className="
                        mt-1
                        block
                        w-full
                        rounded-md
                        border-gray-300
                        shadow-sm
                        focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                      "
                                    placeholder=""
                                />
                            </label>
                            <label className="block">
                                <span className="text-gray-700">Metabolic Age (years)</span>
                                <input
                                    type="number"
                                    name="metabolicAge"
                                    step="0.01"
                                    min={0}
                                    value={metabolicAge}
                                    onChange={(e) => setMetabolicAge(e.target.value)}
                                    className="
                        mt-1
                        block
                        w-full
                        rounded-md
                        border-gray-300
                        shadow-sm
                        focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                      "
                                    placeholder=""
                                />
                            </label>
                        </div>

                        <div className="flex justify-between gap-2">
                            <div className="mt-2">
                                <input type="checkbox" id="syncToIntervals" checked={syncToIntervals} onChange={checkSyncToIntervalsHandler} />
                                <label htmlFor="syncToIntervals" className="ml-2">Sync to Intervals</label>
                            </div>

                            <div className="mt-2">
                                <input type="checkbox" id="syncToGarmin" checked={syncToGarmin} onChange={checkSyncToGarminHandler} />
                                <label htmlFor="syncToIntervals" className="ml-2">Sync to Garmin</label>
                            </div>
                        </div>

                        {syncToIntervals && !isIntervalsApiKeySaved && <label className="block mt-10">
                            <span className="text-gray-700">API Key</span>
                            <input
                                type="text"
                                name="apiKey"
                                value={intervalsApiKey}
                                onChange={(e) => setIntervalsApiKey(e.target.value)}
                                required
                                className="
                                    mt-1
                                    block
                                    w-full
                                    rounded-md
                                    border-gray-300
                                    shadow-sm
                                    focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                                "
                                placeholder="Your API Key"
                            />
                        </label>}
                        {syncToIntervals && !isIntervalsApiKeySaved && <div className="mt-2">
                            <input type="checkbox" id="saveIntervalsApiKey" checked={saveIntervalsApiKey} onChange={checkSaveIntervalsApiKeyHandler} />
                            <label htmlFor="saveIntervalsApiKey" className="ml-2">remember me (save access token in the browser) </label>
                        </div>
                        }

                        {syncToGarmin && !isGarminTokenSaved && <label className="block mt-10">
                            <span className="text-gray-700">Email address</span>
                            <input
                                type="email"
                                name="password"
                                value={garminEmail}
                                onChange={(e) => setGarminEmail(e.target.value)}
                                required
                                className="
                                    mt-1
                                    block
                                    w-full
                                    rounded-md
                                    border-gray-300
                                    shadow-sm
                                    focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                                "
                                placeholder="john@example.com"
                            />
                        </label>}
                        {syncToGarmin && !isGarminTokenSaved && <label className="block">
                            <span className="text-gray-700">Password</span>
                            <input
                                type="password"
                                name='garminPassword'
                                value={garminPassword}
                                onChange={(e) => setGarminPassword(e.target.value)}
                                required
                                className="
                                    mt-1
                                    block
                                    w-full
                                    rounded-md
                                    border-gray-300
                                    shadow-sm
                                    focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                                    "
                                placeholder="********"
                            />
                        </label>}
                        {syncToGarmin && !isGarminTokenSaved && <div className="mt-2">
                            <input type="checkbox" id="saveGarminToken" checked={saveGarminToken} onChange={checkSaveGarminTokenHandler} />
                            <label htmlFor="saveGarminToken" className="ml-2">remember me (save access token in the browser) </label>
                        </div>
                        }

                        {(isGarminTokenSaved || isIntervalsApiKeySaved) && <div className="mt-5">
                            <label className="block text-center">
                                {isGarminTokenSaved && <div>Logged at Garmin as <i>{garminEmail}</i></div>}
                                {isIntervalsApiKeySaved && <div>Logged at Intervals as <i>{intervalsApiKey.length > 5 ? `${intervalsApiKey.substring(0, 5)}...` : intervalsApiKey}</i></div>}
                                <a href='#' className="underline" onClick={clearTokens}>
                                    Clear access tokens and change credencials
                                </a>
                            </label>
                        </div>}
                        <div className='flex flex-wrap'>
                            <Link href="/" passHref>
                                <button
                                    type="button"
                                    className='bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded mt-5 mr-auto'
                                >  &lt; Back
                                </button>
                            </Link>
                            <button
                                type="submit"
                                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5 ml-auto'
                            > Sync Data
                            </button>
                            {syncToGarmin && <div className="block text-justify">
                                <a href='#' className="underline block mt-5 mb-2 text-center" onClick={generateFitFile}>
                                    Generate only .fit file without Email and Password.
                                </a>
                                <span>It can be used to manually upload data to the <a href='https://connect.garmin.com/modern/import-data' className="underline" target='_blank' >
                                    Garmin Connect website
                                </a> in case you don&apos;t want to provide your credentials or if the API has a problem with too many requests.</span>

                            </div>}
                        </div>

                    </form>
                </div>
            </div>
        </>
    )
}