import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios';
import useLocalStorageState from 'use-local-storage-state'
import { useBodyCompositionContext } from '../../contexts/bodycomposition.context';
import {Garmin} from './garmin';

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
    const [syncToGarmin, setSyncToGarmin] = useLocalStorageState('syncToGarmin', { defaultValue: false});
    useEffect(() => {
        let value;
        value = (localStorage.getItem("syncToGarmin") || false) === 'true'
        setSyncToGarmin(value)
    }, [])
    const checkSyncToGarminHandler = () => {
        localStorage.setItem("syncToGarmin", !syncToGarmin)
        setSyncToGarmin(!syncToGarmin)
    }

    const preapareApiRequest = () => {
        const bodyFatFree = parseFloat(weight) * (1 - (parseFloat(fat ?? 0))*0.01);
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
            // email,
            // password,
            // mfaCode,
            // clientId,
            // accessToken,
            // tokenSecret,
        }

        return payload;
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

            await axios
                .post('https://frog01-20364.wykr.es/upload', payload, axiosConfig)
                .then(response => {
                    console.log(response);
                    if (saveToken && response.data.uploadResult.accessToken && response.data.uploadResult.tokenSecret) {
                        setAccessToken(response.data.uploadResult.accessToken);
                        setTokenSecret(response.data.uploadResult.tokenSecret);
                    }
                    if (response.status === 201) {
                        alert("Success. Uploaded.");
                        setShowMFACode(false);
                    } else if (response.status === 200) {
                        setShowMFACode(true);
                        setClientId(response.data.clientId);
                        alert("MFA/2FA Code required. Please provide it.");
                    }
                    else {
                        alert(`Response Status: ${response.status}`);
                    }
                    if (response.status === 401) {
                        clearTokens();
                    }

                })
                .catch(error => {
                    console.log(error);
                    const errorMessage = error?.response?.data;
                    if (errorMessage && errorMessage.includes('401 (Unauthorized)')) {
                        clearTokens();
                    }
                    alert(`${errorMessage}`);
                });

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

                        <div className="mt-2">
                            <input type="checkbox" id="syncToGarmin" checked={syncToGarmin} onChange={checkSyncToGarminHandler} />
                            <label htmlFor="syncToGarmin" className="ml-2">Sync to Garmin (save access token in the browser) </label>
                        </div>
                        

                        {syncToGarmin && <label className="block mt-10">
                            <span className="text-gray-700">Email address</span>
                            <Garmin />
                        </label>}




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
                            > Send to Garmin Connect
                            </button>

                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}