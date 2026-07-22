/**
 * Convert HH:MM:SS time string to hours (decimal)
 */
export function timeToHours(time: string): number {
  const parts = time.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  return hours + minutes / 60 + seconds / 3600;
}

/**
 * Convert hours (decimal) to HH:MM:SS string
 */
export function hoursToTime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const s = Math.floor(((hours - h) * 60 - m) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Calculate pace in min/km
 * @param distance Distance in km
 * @param time Time in HH:MM:SS format
 * @returns Pace in minutes per km
 */
export function calculatePace(distance: number, time: string): number {
  const hours = timeToHours(time);
  const minutes = hours * 60;
  return minutes / distance;
}

/**
 * Format pace as MM:SS per km
 */
export function formatPace(paceMinPerKm: number): string {
  const minutes = Math.floor(paceMinPerKm);
  const seconds = Math.round((paceMinPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate effort distance (kilomètre effort)
 * Formula: distance(km) + (denivele_positif(m) / 100)
 */
export function calculateEffortDistance(
  distance: number,
  denivelePositive?: number
): number {
  if (!denivelePositive) return distance;
  return distance + denivelePositive / 100;
}

/**
 * Calculate effort speed (vitesse effort) in km/h
 * Formula: kilometre_effort / duree_en_heure
 */
export function calculateEffortSpeed(
  distance: number,
  time: string,
  denivelePositive?: number
): number {
  const hours = timeToHours(time);
  const effortDistance = calculateEffortDistance(distance, denivelePositive);
  return effortDistance / hours;
}

/**
 * Calculate effort pace in min/km
 * Formula: durée_minutes / kilomètre_effort
 */
export function calculateEffortPace(
  distance: number,
  time: string,
  denivelePositive?: number
): number {
  const hours = timeToHours(time);
  const minutes = hours * 60;
  const effortDistance = calculateEffortDistance(distance, denivelePositive);
  return minutes / effortDistance;
}

/**
 * Format speed as km/h with 2 decimals
 */
export function formatSpeed(speed: number): string {
  return speed.toFixed(2);
}
