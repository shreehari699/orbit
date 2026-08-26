/**
 * Unit conversion tables, shared by the Unit Converter tool and the
 * Command Center's quick-answer engine. Every category (other than
 * temperature, which is affine rather than linear) converts via a
 * common base unit: value_in_base = value * factor.
 */

export interface UnitDef {
  id: string;
  label: string;
  aliases: string[];
  factor: number; // multiply by this to reach the category's base unit
}

export interface UnitCategory {
  id: string;
  label: string;
  base: string; // id of the base unit
  units: UnitDef[];
}

export const LENGTH: UnitCategory = {
  id: "length",
  label: "Length",
  base: "m",
  units: [
    { id: "mm", label: "Millimeters", aliases: ["mm", "millimeter", "millimeters"], factor: 0.001 },
    { id: "cm", label: "Centimeters", aliases: ["cm", "centimeter", "centimeters"], factor: 0.01 },
    { id: "m", label: "Meters", aliases: ["m", "meter", "meters", "metre", "metres"], factor: 1 },
    { id: "km", label: "Kilometers", aliases: ["km", "kilometer", "kilometers"], factor: 1000 },
    { id: "in", label: "Inches", aliases: ["in", "inch", "inches"], factor: 0.0254 },
    { id: "ft", label: "Feet", aliases: ["ft", "foot", "feet"], factor: 0.3048 },
    { id: "yd", label: "Yards", aliases: ["yd", "yard", "yards"], factor: 0.9144 },
    { id: "mi", label: "Miles", aliases: ["mi", "mile", "miles"], factor: 1609.344 },
  ],
};

export const MASS: UnitCategory = {
  id: "mass",
  label: "Mass",
  base: "g",
  units: [
    { id: "mg", label: "Milligrams", aliases: ["mg", "milligram", "milligrams"], factor: 0.001 },
    { id: "g", label: "Grams", aliases: ["g", "gram", "grams"], factor: 1 },
    { id: "kg", label: "Kilograms", aliases: ["kg", "kilogram", "kilograms"], factor: 1000 },
    { id: "oz", label: "Ounces", aliases: ["oz", "ounce", "ounces"], factor: 28.349523125 },
    { id: "lb", label: "Pounds", aliases: ["lb", "lbs", "pound", "pounds"], factor: 453.59237 },
    { id: "t", label: "Metric tons", aliases: ["t", "tonne", "tonnes"], factor: 1_000_000 },
  ],
};

export const VOLUME: UnitCategory = {
  id: "volume",
  label: "Volume",
  base: "l",
  units: [
    { id: "ml", label: "Milliliters", aliases: ["ml", "milliliter", "milliliters"], factor: 0.001 },
    { id: "l", label: "Liters", aliases: ["l", "liter", "liters", "litre", "litres"], factor: 1 },
    { id: "tsp", label: "Teaspoons", aliases: ["tsp", "teaspoon", "teaspoons"], factor: 0.00492892 },
    { id: "tbsp", label: "Tablespoons", aliases: ["tbsp", "tablespoon", "tablespoons"], factor: 0.0147868 },
    { id: "cup", label: "Cups", aliases: ["cup", "cups"], factor: 0.236588 },
    { id: "gal", label: "Gallons (US)", aliases: ["gal", "gallon", "gallons"], factor: 3.78541 },
    { id: "floz", label: "Fluid ounces (US)", aliases: ["floz", "fl oz", "fluid ounce", "fluid ounces"], factor: 0.0295735 },
  ],
};

export const SPEED: UnitCategory = {
  id: "speed",
  label: "Speed",
  base: "mps",
  units: [
    { id: "mps", label: "Meters/second", aliases: ["mps", "m/s"], factor: 1 },
    { id: "kmh", label: "Kilometers/hour", aliases: ["kmh", "km/h", "kph"], factor: 1 / 3.6 },
    { id: "mph", label: "Miles/hour", aliases: ["mph"], factor: 0.44704 },
    { id: "kn", label: "Knots", aliases: ["kn", "knot", "knots"], factor: 0.514444 },
  ],
};

export const DATA: UnitCategory = {
  id: "data",
  label: "Digital storage",
  base: "b",
  units: [
    { id: "b", label: "Bytes", aliases: ["b", "byte", "bytes"], factor: 1 },
    { id: "kb", label: "Kilobytes", aliases: ["kb", "kilobyte", "kilobytes"], factor: 1024 },
    { id: "mb", label: "Megabytes", aliases: ["mb", "megabyte", "megabytes"], factor: 1024 ** 2 },
    { id: "gb", label: "Gigabytes", aliases: ["gb", "gigabyte", "gigabytes"], factor: 1024 ** 3 },
    { id: "tb", label: "Terabytes", aliases: ["tb", "terabyte", "terabytes"], factor: 1024 ** 4 },
  ],
};

export const UNIT_CATEGORIES: UnitCategory[] = [LENGTH, MASS, VOLUME, SPEED, DATA];

export type TemperatureUnit = "c" | "f" | "k";

export function convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit): number {
  const celsius =
    from === "c" ? value : from === "f" ? ((value - 32) * 5) / 9 : value - 273.15;
  if (to === "c") return celsius;
  if (to === "f") return (celsius * 9) / 5 + 32;
  return celsius + 273.15;
}

export function findUnit(category: UnitCategory, token: string): UnitDef | undefined {
  const needle = token.trim().toLowerCase();
  return category.units.find(
    (u) => u.id === needle || u.aliases.some((a) => a.toLowerCase() === needle),
  );
}

export function convert(category: UnitCategory, value: number, fromId: string, toId: string): number | null {
  const from = findUnit(category, fromId);
  const to = findUnit(category, toId);
  if (!from || !to) return null;
  return (value * from.factor) / to.factor;
}

const TEMPERATURE_ALIASES: Record<TemperatureUnit, string[]> = {
  c: ["c", "celsius", "centigrade"],
  f: ["f", "fahrenheit"],
  k: ["k", "kelvin"],
};

export function findTemperatureUnit(token: string): TemperatureUnit | undefined {
  const needle = token.trim().toLowerCase();
  return (Object.keys(TEMPERATURE_ALIASES) as TemperatureUnit[]).find((u) =>
    TEMPERATURE_ALIASES[u].includes(needle),
  );
}
