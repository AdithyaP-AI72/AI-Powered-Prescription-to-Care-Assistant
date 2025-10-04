"use client";

import { Pharmacy, Location } from '../page';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useMemo, useState } from 'react';

interface PharmaciesTabProps {
    handleFindPharmacies: () => void;
    isFindingPharmacies: boolean;
    pharmacies: Pharmacy[];
    pharmacyError: string | null;
    currentText: { [key: string]: string };
    currentUserLocation: Location | null;
}

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.5rem',
};

export default function PharmaciesTab({
    handleFindPharmacies,
    isFindingPharmacies,
    pharmacies,
    pharmacyError,
    currentUserLocation,
}: PharmaciesTabProps) {

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
    });

    // State to track the currently selected pharmacy for the info window
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);

    const center = useMemo(() => {
        // If a pharmacy is selected, center the map on it
        if (selectedPharmacy && selectedPharmacy.geometry) {
            return selectedPharmacy.geometry.location;
        }
        // Otherwise, use the user's location if available
        if (currentUserLocation) {
            return currentUserLocation;
        }
        // Fallback to a default location (e.g., Bengaluru)
        return { lat: 12.9716, lng: 77.5946 };
    }, [currentUserLocation, selectedPharmacy]);

    return (
        <div className="bg-white mt-8 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Find Nearby Pharmacies</h2>
            <p className="text-gray-600 mb-4">Allow location access to find and display the closest pharmacies on the map.</p>
            <button onClick={handleFindPharmacies} disabled={isFindingPharmacies} className="w-full mb-6 sm:w-auto px-6 py-3 text-base font-medium text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400">
                {isFindingPharmacies ? "Searching..." : "Find Pharmacies Near Me"}
            </button>

            {pharmacyError && <div className="mt-4 p-4 bg-red-100 border text-red-700 rounded-lg">{pharmacyError}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[60vh]">
                {/* Map Section */}
                <div className="md:col-span-2 h-[40vh] md:h-full bg-gray-200 rounded-lg">
                    {isLoaded ? (
                        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
                            {/* Marker for the user's location */}
                            {currentUserLocation && <MarkerF position={currentUserLocation} title="Your Location" />}
                            
                            {/* Markers for each pharmacy */}
                            {pharmacies.map((pharmacy, index) => (
                                pharmacy.geometry && (
                                    <MarkerF 
                                        key={index} 
                                        position={pharmacy.geometry.location} 
                                        title={pharmacy.name}
                                        onClick={() => setSelectedPharmacy(pharmacy)}
                                    />
                                )
                            ))}

                            {/* Info Window for the selected pharmacy */}
                            {selectedPharmacy && selectedPharmacy.geometry && (
                                <InfoWindowF
                                    position={selectedPharmacy.geometry.location}
                                    onCloseClick={() => setSelectedPharmacy(null)}
                                >
                                    <div>
                                        <h4 className="font-bold">{selectedPharmacy.name}</h4>
                                        <p>{selectedPharmacy.address}</p>
                                    </div>
                                </InfoWindowF>
                            )}
                        </GoogleMap>
                    ) : <div>Loading Map...</div>}
                </div>

                {/* List Section */}
                <div className="md:col-span-1 max-h-[60vh] overflow-y-auto">
                    {isFindingPharmacies && (
                        <div className="text-center flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-3 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>Searching...</span>
                        </div>
                    )}
                    {pharmacies.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700">Top 5 Nearby Pharmacies:</h3>
                            <ul className="divide-y divide-gray-200 mt-2">
                                {pharmacies.map((pharmacy, index) => (
                                    <li 
                                        key={index} 
                                        className="py-4 cursor-pointer hover:bg-gray-50 p-2 rounded"
                                        onClick={() => setSelectedPharmacy(pharmacy)}
                                    >
                                        <p className="font-bold text-gray-800">{pharmacy.name}</p>
                                        <p className="text-sm text-gray-600">{pharmacy.address}</p>
                                        <p className="text-sm text-gray-600">Phone: <strong className="text-blue-600">{pharmacy.phone}</strong></p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}