// Distance.ts

import axios from "axios";

interface DistanceResult {
  distance: string;
  duration: string;
}

export const getDistance = async (
  origin: string,
  destination: string
): Promise<DistanceResult | null> => {
  const apiKey =  "AIzaSyADyptfsQzv7jdCZxjQjpJSf7ntcGLareA";

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(
    destination
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);

    return {
      distance: response.data.rows[0].elements[0].distance.text,
      duration: response.data.rows[0].elements[0].duration.text,
    };
  } catch (error) {
    console.error("Error fetching distance:", error);
    return null;
  }
};