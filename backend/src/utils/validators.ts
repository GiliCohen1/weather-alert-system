// src/utils/locationValidator.ts
export class LocationValidator {
  static parseCoordinates(
    location: string
  ): { lat: number; lon: number } | null {
    const coords = location.split(",").map((coord) => parseFloat(coord.trim()));

    if (
      coords.length === 2 &&
      !isNaN(coords[0]) &&
      !isNaN(coords[1]) &&
      this.isValidCoordinates(coords[0], coords[1])
    ) {
      return { lat: coords[0], lon: coords[1] };
    }
    return null;
  }

  static isValidCoordinates(lat: number, lon: number): boolean {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  }
}
