// CPCB (India) AQI Calculation Logic

type Breakpoint = {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
};

// Breakpoints for PM2.5 (µg/m³)
const PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
  { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
  { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
  { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
  { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
  { cLow: 251, cHigh: 1000, iLow: 401, iHigh: 500 }, // Extrapolated upper bound
];

// Breakpoints for PM10 (µg/m³)
const PM10_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
  { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
  { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200 },
  { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300 },
  { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400 },
  { cLow: 431, cHigh: 1000, iLow: 401, iHigh: 500 }, // Extrapolated upper bound
];

function calculateSubIndex(concentration: number, breakpoints: Breakpoint[]): number {
  if (concentration < 0) return 0;
  
  for (const bp of breakpoints) {
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) + bp.iLow;
      return Math.round(aqi);
    }
  }
  
  // If exceeds max, cap at 500 or extrapolate (we cap at 500 for safety)
  return 500;
}

export function calculateCPCB_AQI(pm25: number, pm10: number): { aqi: number; dominant: string } {
  const pm25AQI = calculateSubIndex(pm25, PM25_BREAKPOINTS);
  const pm10AQI = calculateSubIndex(pm10, PM10_BREAKPOINTS);
  
  if (pm25AQI >= pm10AQI) {
    return { aqi: pm25AQI, dominant: 'PM2.5' };
  } else {
    return { aqi: pm10AQI, dominant: 'PM10' };
  }
}
