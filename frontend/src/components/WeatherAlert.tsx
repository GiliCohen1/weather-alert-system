import React, { useState } from "react";
import { weatherApi } from "../services/api";
import { WeatherAlert } from "../types";

interface Props {
  children: () => void; // callback to reload alerts
}

const WeatherAlertForm: React.FC<Props> = ({ children }) => {
  const [name, setName] = useState("");
  const [locationType, setLocationType] = useState<"city" | "coords">("city");
  const [city, setCity] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [parameter, setParameter] = useState("");
  const [operator, setOperator] = useState(">");
  const [threshold, setThreshold] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: Omit<WeatherAlert, "id"> = {
        name,
        locationType,
        city: locationType === "city" ? city : undefined,
        lat: locationType === "coords" ? parseFloat(lat) : undefined,
        lon: locationType === "coords" ? parseFloat(lon) : undefined,
        parameter: parameter as
          | "temperature"
          | "windSpeed"
          | "precipitationProbability",
        operator: operator as ">" | ">=" | "<" | "<=" | "==",
        threshold: parseFloat(threshold),
      };
      await weatherApi.createAlert(payload);
      // Reset form
      setName("");
      setCity("");
      setLat("");
      setLon("");
      setParameter("");
      setThreshold("");
      children(); // reload alerts
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Alert name"
        className="input"
      />

      <select
        value={locationType}
        onChange={(e) => setLocationType(e.target.value as "city" | "coords")}
        className="input"
      >
        <option value="city">City</option>
        <option value="coords">Coordinates</option>
      </select>

      {locationType === "city" ? (
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="input"
        />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="Latitude"
            className="input"
          />
          <input
            type="number"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            placeholder="Longitude"
            className="input"
          />
        </div>
      )}

      <select
        value={parameter}
        onChange={(e) =>
          setParameter(
            e.target.value as
              | "temperature"
              | "windSpeed"
              | "precipitationProbability"
          )
        }
        className="input"
      >
        <option value="">Select parameter</option>
        <option value="temperature">Temperature</option>
        <option value="windSpeed">Wind Speed</option>
        <option value="precipitationProbability">
          precipitation Probability
        </option>
      </select>
      <select
        value={operator}
        onChange={(e) =>
          setOperator(e.target.value as ">" | ">=" | "<" | "<=" | "==")
        }
        className="input"
      >
        <option value=">">{">"}</option>
        <option value=">=">{">="}</option>
        <option value="<">{"<"}</option>
        <option value="<=">{"<="}</option>
        <option value="==">{"=="}</option>
      </select>

      <input
        type="number"
        value={threshold}
        onChange={(e) => setThreshold(e.target.value)}
        placeholder="Threshold"
        className="input"
      />

      <button type="submit" className="btn w-full" disabled={loading}>
        {loading ? "Creating..." : "Create Alert"}
      </button>
    </form>
  );
};

export default WeatherAlertForm;
