import React, { useState } from "react";
import {
  MapPin,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Settings,
} from "lucide-react";
import { weatherApi } from "../services/api";
import { WeatherAlert } from "../types";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Button from "./ui/Button";
import CityAutocomplete from "./ui/CityAutocomplete";

interface Props {
  onCreated: () => void;
}

const STEPS = [
  { label: "Setup", icon: Settings },
  { label: "Review", icon: CheckCircle },
];

const PARAM_OPTIONS = [
  { value: "temperature", label: "Temperature (°C)" },
  { value: "windSpeed", label: "Wind Speed (m/s)" },
  { value: "humidity", label: "Humidity (%)" },
  { value: "precipitationProbability", label: "Precipitation (%)" },
];

const OPERATOR_OPTIONS = [
  { value: ">", label: "> Greater than" },
  { value: ">=", label: "≥ Greater or equal" },
  { value: "<", label: "< Less than" },
  { value: "<=", label: "≤ Less or equal" },
  { value: "==", label: "= Equal to" },
];

const WeatherAlertForm: React.FC<Props> = ({ onCreated }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [locationType, setLocationType] = useState<"city" | "coords">("city");
  const [city, setCity] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [parameter, setParameter] = useState("temperature");
  const [operator, setOperator] = useState(">");
  const [threshold, setThreshold] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!name.trim()) errs.name = "Name is required";
      if (locationType === "city" && !city.trim())
        errs.city = "City is required";
      if (locationType === "coords") {
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        if (!lat || isNaN(latNum) || latNum < -90 || latNum > 90)
          errs.lat = "Latitude must be between -90 and 90";
        if (!lon || isNaN(lonNum) || lonNum < -180 || lonNum > 180)
          errs.lon = "Longitude must be between -180 and 180";
      }
      if (!threshold || isNaN(parseFloat(threshold)))
        errs.threshold = "Enter a valid number";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 1));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep(0)) return;
    setLoading(true);
    try {
      const payload: Omit<WeatherAlert, "id"> = {
        name: name.trim(),
        locationType,
        city: locationType === "city" ? city.trim() : undefined,
        lat: locationType === "coords" ? parseFloat(lat) : undefined,
        lon: locationType === "coords" ? parseFloat(lon) : undefined,
        parameter: parameter as WeatherAlert["parameter"],
        operator: operator as WeatherAlert["operator"],
        threshold: parseFloat(threshold),
      };
      await weatherApi.createAlert(payload);
      // Reset
      setName("");
      setCity("");
      setLat("");
      setLon("");
      setParameter("temperature");
      setOperator(">");
      setThreshold("");
      setStep(0);
      onCreated();
    } catch {
      setErrors({ submit: "Failed to create alert. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const paramLabel =
    PARAM_OPTIONS.find((p) => p.value === parameter)?.label || parameter;
  const opLabel =
    OPERATOR_OPTIONS.find((o) => o.value === operator)?.label || operator;
  const locationLabel = locationType === "city" ? city : `${lat}, ${lon}`;

  return (
    <div>
      {/* Step indicator — compact pill bar */}
      <div className="flex items-center gap-2 mb-4">
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                i === step
                  ? "bg-primary-600 text-white"
                  : i < step
                    ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 cursor-pointer hover:bg-primary-200"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400"
              }`}
            >
              {i < step ? <CheckCircle size={12} /> : <s.icon size={12} />}
              {s.label}
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight size={14} className="text-gray-300" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Setup — location + condition in grid */}
      {step === 0 && (
        <div className="animate-fadeIn space-y-3">
          {/* Top row: name + location type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Alert Name"
              placeholder="E.g., Cold snap warning"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />
            <div>
              <label className="form-label mb-1">Location Type</label>
              <div className="flex gap-2">
                {(["city", "coords"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLocationType(type)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      locationType === type
                        ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                        : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {type === "city" ? "🏙️ City" : "📍 Coords"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location fields */}
          {locationType === "city" ? (
            <CityAutocomplete
              label="City"
              placeholder="E.g., Tel Aviv"
              value={city}
              onChange={(val) => setCity(val)}
              error={errors.city}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Latitude"
                type="number"
                placeholder="-90 to 90"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                error={errors.lat}
              />
              <Input
                label="Longitude"
                type="number"
                placeholder="-180 to 180"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                error={errors.lon}
              />
            </div>
          )}

          {/* Condition fields in a row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Parameter"
              value={parameter}
              onChange={(e) => setParameter(e.target.value)}
              options={PARAM_OPTIONS}
            />
            <Select
              label="Condition"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              options={OPERATOR_OPTIONS}
            />
            <Input
              label="Threshold"
              type="number"
              placeholder="E.g., 35"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              error={errors.threshold}
            />
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 1 && (
        <div className="animate-fadeIn">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            <ReviewRow label="Name" value={name} />
            <ReviewRow label="Location" value={locationLabel} />
            <ReviewRow label="Parameter" value={paramLabel} />
            <ReviewRow label="Condition" value={`${opLabel} ${threshold}`} />
          </div>
          {errors.submit && (
            <p className="text-sm text-danger-600 mt-2">{errors.submit}</p>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        {step > 0 ? (
          <Button variant="ghost" size="sm" onClick={prev}>
            <ChevronLeft size={14} />
            Back
          </Button>
        ) : (
          <div />
        )}
        {step < 1 ? (
          <Button variant="primary" size="sm" onClick={next}>
            Review
            <ChevronRight size={14} />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            loading={loading}
          >
            <CheckCircle size={14} />
            Create Alert
          </Button>
        )}
      </div>
    </div>
  );
};

const ReviewRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-500 dark:text-gray-400">{label}</span>
    <span className="font-medium text-gray-900 dark:text-white">{value}</span>
  </div>
);

export default WeatherAlertForm;
