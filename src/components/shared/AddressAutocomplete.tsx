import React, { useEffect, useRef, useState } from "react";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_PLACES_URL = (apiKey: string) =>
  `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__googlePlacesCallback`;

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ value, onChange }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loaded, setLoaded] = useState<boolean>(!!window.google?.maps?.places);

  useEffect(() => {
    if (loaded || window.google?.maps?.places) return;
    const apiKey = (process.env.GOOGLE_MAPS_API_KEY as string) || (window as any).GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return; // No API key configured; fall back to plain input
    }
    (window as any).__googlePlacesCallback = () => setLoaded(true);
    const script = document.createElement("script");
    script.src = GOOGLE_PLACES_URL(apiKey);
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      delete (window as any).__googlePlacesCallback;
    };
  }, [loaded]);

  useEffect(() => {
    if (!inputRef.current || !window.google?.maps?.places) return;
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ["formatted_address"],
      types: ["geocode"],
    });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const addr = place?.formatted_address || inputRef.current?.value || "";
      onChange(addr);
    });
  }, [loaded, onChange]);

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search address"
      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
      type="text"
    />
  );
};

export default AddressAutocomplete;
