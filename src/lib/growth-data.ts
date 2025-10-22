// src/lib/growth-data.ts

/**
 * World Health Organization (WHO) Child Growth Standards.
 * This data represents the length-for-age percentiles for boys from 0 to 13 weeks.
 * The range is approximately between the 3rd and 97th percentile.
 *
 * Source: WHO Anthro Survey Analyser, length-for-age for boys.
 */
export const WHO_LENGTH_RANGES_BOYS_0_TO_13_WEEKS = [
  { week: 0, minCM: 46.1, maxCM: 53.7 },
  { week: 1, minCM: 47.3, maxCM: 54.9 },
  { week: 2, minCM: 48.5, maxCM: 56.2 },
  { week: 3, minCM: 49.5, maxCM: 57.2 },
  { week: 4, minCM: 50.5, maxCM: 58.3 }, // Approx. 1 month
  { week: 5, minCM: 51.4, maxCM: 59.2 },
  { week: 6, minCM: 52.3, maxCM: 60.2 },
  { week: 7, minCM: 53.1, maxCM: 61.0 },
  { week: 8, minCM: 53.9, maxCM: 61.9 }, // Approx. 2 months
  { week: 9, minCM: 54.6, maxCM: 62.7 },
  { week: 10, minCM: 55.4, maxCM: 63.4 },
  { week: 11, minCM: 56.0, maxCM: 64.1 },
  { week: 12, minCM: 56.7, maxCM: 64.8 },
  { week: 13, minCM: 57.3, maxCM: 65.5 }, // Approx. 3 months
];
