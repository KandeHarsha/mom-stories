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

/**
 * World Health Organization (WHO) Child Growth Standards.
 * This data represents the length-for-age percentiles for boys from 0 to 24 months.
 * The range is approximately between the 3rd and 97th percentile.
 *
 * Source: WHO Anthro Survey Analyser, length-for-age for boys.
 */
export const WHO_LENGTH_RANGES_BOYS_0_TO_24_MONTHS = [
    { month: 0, minCM: 46.1, maxCM: 53.7 },
    { month: 1, minCM: 50.8, maxCM: 58.6 },
    { month: 2, minCM: 54.4, maxCM: 62.4 },
    { month: 3, minCM: 57.3, maxCM: 65.5 },
    { month: 4, minCM: 59.7, maxCM: 68.0 },
    { month: 5, minCM: 61.7, maxCM: 70.1 },
    { month: 6, minCM: 63.3, maxCM: 71.9 },
    { month: 7, minCM: 64.8, maxCM: 73.5 },
    { month: 8, minCM: 66.2, maxCM: 75.0 },
    { month: 9, minCM: 67.5, maxCM: 76.5 },
    { month: 10, minCM: 68.7, maxCM: 77.9 },
    { month: 11, minCM: 69.9, maxCM: 79.2 },
    { month: 12, minCM: 71.0, maxCM: 80.5 },
    { month: 13, minCM: 72.1, maxCM: 81.8 },
    { month: 14, minCM: 73.1, maxCM: 83.0 },
    { month: 15, minCM: 74.1, maxCM: 84.2 },
    { month: 16, minCM: 75.0, maxCM: 85.4 },
    { month: 17, minCM: 76.0, maxCM: 86.5 },
    { month: 18, minCM: 76.9, maxCM: 87.7 },
    { month: 19, minCM: 77.7, maxCM: 88.8 },
    { month: 20, minCM: 78.6, maxCM: 89.8 },
    { month: 21, minCM: 79.4, maxCM: 90.9 },
    { month: 22, minCM: 80.2, maxCM: 91.9 },
    { month: 23, minCM: 81.0, maxCM: 92.9 },
    { month: 24, minCM: 81.7, maxCM: 93.9 },
];
