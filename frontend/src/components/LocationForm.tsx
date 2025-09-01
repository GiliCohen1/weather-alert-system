import React, { useState } from "react";

interface LocationFormProps {
  defaultLocation?: string;
  onSubmit: (location: string) => void;
  loading?: boolean;
}

const LocationForm: React.FC<LocationFormProps> = ({
  defaultLocation = "",
  onSubmit,
  loading = false,
}) => {
  const [input, setInput] = useState(defaultLocation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(input.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter location..."
        className="input flex-1"
      />
      <button type="submit" className="btn" disabled={loading}>
        {loading ? "Updating..." : "Update Location"}
      </button>
    </form>
  );
};

export default LocationForm;
