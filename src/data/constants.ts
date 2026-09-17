// AQI band definitions for India's CPCB system
export interface AqiBand {
  label: string;
  range: [number, number];
  color: string;       // Tailwind token
  hex: string;
  textOnColor: 'white' | 'ink';
  healthImpact: string;
  costIncrease: number; // percentage from the study
}

export const AQI_BANDS: AqiBand[] = [
  {
    label: 'Good',
    range: [0, 50],
    color: 'aqi-good',
    hex: '#3A8564',
    textOnColor: 'white',
    healthImpact: 'Minimal impact on health.',
    costIncrease: 0,
  },
  {
    label: 'Satisfactory',
    range: [51, 100],
    color: 'aqi-satisfactory',
    hex: '#8FA83C',
    textOnColor: 'ink',
    healthImpact: 'Minor breathing discomfort to sensitive people.',
    costIncrease: 3.27,
  },
  {
    label: 'Moderate',
    range: [101, 200],
    color: 'aqi-moderate',
    hex: '#D3A130',
    textOnColor: 'ink',
    healthImpact: 'Breathing discomfort to people with lung/heart disease, children, older adults.',
    costIncrease: 7.21,
  },
  {
    label: 'Poor',
    range: [201, 300],
    color: 'aqi-poor',
    hex: '#CC7A2E',
    textOnColor: 'white',
    healthImpact: 'Breathing discomfort on prolonged exposure, for most people.',
    costIncrease: 8.62,
  },
  {
    label: 'Very Poor',
    range: [301, 400],
    color: 'aqi-very-poor',
    hex: '#B23B3B',
    textOnColor: 'white',
    healthImpact: 'Respiratory illness on prolonged exposure.',
    costIncrease: 42.66,
  },
  {
    label: 'Severe',
    range: [401, 500],
    color: 'aqi-severe',
    hex: '#5C2A44',
    textOnColor: 'white',
    healthImpact: 'Affects healthy people; serious impact on people with existing disease.',
    costIncrease: 42.66, // Same as very poor ceiling (research ceiling)
  },
];

export function getAqiBand(aqi: number): AqiBand {
  for (const band of AQI_BANDS) {
    if (aqi >= band.range[0] && aqi <= band.range[1]) return band;
  }
  return AQI_BANDS[AQI_BANDS.length - 1]; // default to severe for >500
}

// National context statistics from PRD §2.2
export const NATIONAL_STATS = {
  totalEconomicLoss: {
    value: '₹2.6 Lakh Cr',
    usdEquivalent: 'Approx. $36.8 Billion USD Equivalent',
    description: 'Annual economic loss to India from premature mortality and morbidity attributable to air pollution.',
    source: 'Lancet Planetary Health (India State-Level Disease Burden, 2020)',
  },
  gdpLoss: {
    value: '1.4%',
    unit: 'of GDP',
    description: 'Total output lost in 2019 due to pollution-related lost workdays and outpatient respiratory care.',
    source: 'World Bank Air Quality Economic Analysis & ICMR',
  },
  outOfPocketDrain: {
    value: '₹5,400',
    description: 'Average out-of-pocket health spend increase per household living in cities exceeding 150 AQI.',
    source: 'National Health Accounts & AIIMS Respiratory Survey',
  },
  attributableMortality: {
    value: '17.8%',
    subtext: '1 in every 5.6 deaths nationally',
    description: 'Proportion of all deaths in India in 2019 attributable to ambient and household particulate matter.',
    source: 'Global Burden of Disease Study (GBD 2019)',
  },
};

// Popular Indian cities for search
export interface CityData {
  name: string;
  state: string;
  aqi: number;
  lat: number;
  lng: number;
}

export const POPULAR_CITIES: CityData[] = [
  { name: 'New Delhi', state: 'Delhi NCR', aqi: 284, lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', state: 'Maharashtra', aqi: 92, lat: 19.0760, lng: 72.8777 },
  { name: 'Bengaluru', state: 'Karnataka', aqi: 45, lat: 12.9716, lng: 77.5946 },
  { name: 'Ludhiana', state: 'Punjab', aqi: 318, lat: 30.9010, lng: 75.8573 },
  { name: 'Kolkata', state: 'West Bengal', aqi: 162, lat: 22.5726, lng: 88.3639 },
  { name: 'Patna', state: 'Bihar', aqi: 340, lat: 25.6093, lng: 85.1376 },
  { name: 'Hyderabad', state: 'Telangana', aqi: 78, lat: 17.3850, lng: 78.4867 },
  { name: 'Varanasi', state: 'Uttar Pradesh', aqi: 188, lat: 25.3176, lng: 83.0065 },
];

// Cost curve breakpoints (estimated annual added cost per AQI band)
export const COST_CURVE_DATA = [
  { band: 'Good', range: '0–50', cost: 0, label: '₹0' },
  { band: 'Satisf.', range: '51–100', cost: 800, label: '₹800' },
  { band: 'Mod.', range: '101–200', cost: 2100, label: '₹2.1k' },
  { band: 'Poor', range: '201–300', cost: 6100, label: '₹6.1k' },
  { band: 'V.Poor', range: '301–400', cost: 11500, label: '₹11.5k' },
  { band: 'Severe', range: '401–500', cost: 19200, label: '₹19.2k' },
];

// Re-export Hospital type from centralized types (backward compat)
export type { Hospital } from '@/lib/types';
