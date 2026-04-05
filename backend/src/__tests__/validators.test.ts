import { LocationValidator } from "../utils/validators";

describe("LocationValidator", () => {
  describe("parseCoordinates", () => {
    it("should parse valid coordinate string", () => {
      const result = LocationValidator.parseCoordinates("32.0853, 34.7818");
      expect(result).toEqual({ lat: 32.0853, lon: 34.7818 });
    });

    it("should return null for invalid coordinate string", () => {
      expect(LocationValidator.parseCoordinates("abc, def")).toBeNull();
      expect(LocationValidator.parseCoordinates("hello")).toBeNull();
      expect(LocationValidator.parseCoordinates("")).toBeNull();
    });

    it("should return null for out-of-range coordinates", () => {
      expect(LocationValidator.parseCoordinates("91, 180")).toBeNull();
      expect(LocationValidator.parseCoordinates("0, 181")).toBeNull();
    });

    it("should handle negative coordinates", () => {
      const result = LocationValidator.parseCoordinates("-33.8688, 151.2093");
      expect(result).toEqual({ lat: -33.8688, lon: 151.2093 });
    });
  });

  describe("isValidCoordinates", () => {
    it("should return true for valid lat/lon", () => {
      expect(LocationValidator.isValidCoordinates(0, 0)).toBe(true);
      expect(LocationValidator.isValidCoordinates(90, 180)).toBe(true);
      expect(LocationValidator.isValidCoordinates(-90, -180)).toBe(true);
    });

    it("should return false for out-of-range values", () => {
      expect(LocationValidator.isValidCoordinates(91, 0)).toBe(false);
      expect(LocationValidator.isValidCoordinates(0, 181)).toBe(false);
      expect(LocationValidator.isValidCoordinates(-91, 0)).toBe(false);
    });
  });
});
