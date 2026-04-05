import React, { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Search } from "lucide-react";
import { weatherApi, GeocodeSuggestion } from "../../services/api";

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: GeocodeSuggestion) => void;
  onSubmit?: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  onSubmit,
  label,
  placeholder = "Search city name...",
  error,
  className = "",
}) => {
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputId = label?.toLowerCase().replace(/\s+/g, "-") || "city-search";

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    try {
      const results = await weatherApi.geocodeSearch(query);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setActiveIndex(-1);

    // Fetch suggestions as user types (debounced) — no action request yet
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length >= 2) {
      debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (suggestion: GeocodeSuggestion) => {
    onChange(suggestion.shortName);
    onSelect?.(suggestion);
    setShowDropdown(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowDropdown(false);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (showDropdown && activeIndex >= 0) {
        // Select highlighted suggestion
        handleSelect(suggestions[activeIndex]);
      } else if (showDropdown && suggestions.length > 0) {
        // Dropdown open but nothing highlighted — select the first one
        handleSelect(suggestions[0]);
      } else {
        // No dropdown visible — submit raw text
        onSubmit?.(value);
      }
      return;
    }

    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <MapPin size={16} />
          </div>
          <input
            id={inputId}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder={placeholder}
            className={`${error ? "input-error" : "input"} pl-10`}
            autoComplete="off"
            role="combobox"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls={`${inputId}-listbox`}
            aria-activedescendant={
              activeIndex >= 0 ? `${inputId}-option-${activeIndex}` : undefined
            }
          />
          {loading ? (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <svg
                className="animate-spin h-4 w-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          ) : value.trim().length >= 2 && !showDropdown ? (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
              <Search size={14} />
            </div>
          ) : null}
        </div>
        {error && (
          <p className="text-sm text-danger-500" role="alert">
            {error}
          </p>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul
          id={`${inputId}-listbox`}
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((s, i) => (
            <li
              key={`${s.lat}-${s.lon}-${i}`}
              id={`${inputId}-option-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={`flex items-start gap-2 px-3 py-2 cursor-pointer text-sm transition-colors ${
                i === activeIndex
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
              onMouseDown={() => handleSelect(s)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <MapPin
                size={14}
                className="mt-0.5 flex-shrink-0 text-gray-400"
              />
              <div className="min-w-0">
                <div className="font-medium truncate">{s.shortName}</div>
                {s.country && (
                  <div className="text-xs text-gray-400 truncate">
                    {s.name.length > 60
                      ? s.name.substring(0, 60) + "..."
                      : s.name}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CityAutocomplete;
