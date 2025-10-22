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


/**
 * World Health Organization (WHO) Child Growth Standards.
 * This data represents the length-for-age percentiles for boys from 2 to 5 years.
 * The range is approximately between the 3rd and 97th percentile.
 *
 * Source: WHO Anthro Survey Analyser, length-for-age for boys.
 */
export const WHO_LENGTH_RANGES_BOYS_2_TO_5_YEARS = [
    { month: 24, minCM: 81.0, maxCM: 93.2 },
    { month: 25, minCM: 81.7, maxCM: 94.2 },
    { month: 26, minCM: 82.5, maxCM: 95.2 },
    { month: 27, minCM: 83.1, maxCM: 96.1 },
    { month: 28, minCM: 83.8, maxCM: 97.0 },
    { month: 29, minCM: 84.5, maxCM: 97.9 },
    { month: 30, minCM: 85.1, maxCM: 98.7 },
    { month: 31, minCM: 85.7, maxCM: 99.6 },
    { month: 32, minCM: 86.4, maxCM: 100.4 },
    { month: 33, minCM: 86.9, maxCM: 101.2 },
    { month: 34, minCM: 87.5, maxCM: 102.0 },
    { month: 35, minCM: 88.1, maxCM: 102.7 },
    { month: 36, minCM: 88.7, maxCM: 103.5 },
    { month: 37, minCM: 89.2, maxCM: 104.2 },
    { month: 38, minCM: 89.8, maxCM: 105.0 },
    { month: 39, minCM: 90.3, maxCM: 105.7 },
    { month: 40, minCM: 90.9, maxCM: 106.4 },
    { month: 41, minCM: 91.4, maxCM: 107.1 },
    { month: 42, minCM: 91.9, maxCM: 107.8 },
    { month: 43, minCM: 92.4, maxCM: 108.5 },
    { month: 44, minCM: 93.0, maxCM: 109.1 },
    { month: 45, minCM: 93.5, maxCM: 109.8 },
    { month: 46, minCM: 94.0, maxCM: 110.4 },
    { month: 47, minCM: 94.4, maxCM: 111.1 },
    { month: 48, minCM: 94.9, maxCM: 111.7 },
    { month: 49, minCM: 95.4, maxCM: 112.4 },
    { month: 50, minCM: 95.9, maxCM: 113.0 },
    { month: 51, minCM: 96.4, maxCM: 113.6 },
    { month: 52, minCM: 96.9, maxCM: 114.2 },
    { month: 53, minCM: 97.4, maxCM: 114.9 },
    { month: 54, minCM: 97.8, maxCM: 115.5 },
    { month: 55, minCM: 98.3, maxCM: 116.1 },
    { month: 56, minCM: 98.8, maxCM: 116.7 },
    { month: 57, minCM: 99.3, maxCM: 117.4 },
    { month: 58, minCM: 99.7, maxCM: 118.0 },
    { month: 59, minCM: 100.2, maxCM: 118.6 },
    { month: 60, minCM: 100.7, maxCM: 119.2 },
];
