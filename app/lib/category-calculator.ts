/**
 * Calculate age category for French trail running based on birthday and race date
 * Handles adult categories only (Senior 20-34, Master 0-10)
 * Youth categories (U10-U20) should be entered manually
 */

export function calculateAgeCategory(
  birthday: string,
  raceDate: string,
  gender: 'H' | 'F'
): string | null {
  if (!birthday || !raceDate || !gender) {
    return null;
  }

  // Parse dates
  const birthDate = new Date(birthday);
  const eventDate = new Date(raceDate);

  if (isNaN(birthDate.getTime()) || isNaN(eventDate.getTime())) {
    return null;
  }

  // Calculate age at race date
  let age = eventDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = eventDate.getMonth() - birthDate.getMonth();
  const dayDiff = eventDate.getDate() - birthDate.getDate();

  // Adjust age if birthday hasn't occurred yet in race year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  // Return null for youth categories (< 20), let user enter manually
  if (age < 20) {
    return null;
  }

  // Map age to category
  if (age >= 20 && age <= 34) {
    return `Senior ${gender}`;
  } else if (age >= 35 && age <= 39) {
    return `Master 0 ${gender}`;
  } else if (age >= 40 && age <= 44) {
    return `Master 1 ${gender}`;
  } else if (age >= 45 && age <= 49) {
    return `Master 2 ${gender}`;
  } else if (age >= 50 && age <= 54) {
    return `Master 3 ${gender}`;
  } else if (age >= 55 && age <= 59) {
    return `Master 4 ${gender}`;
  } else if (age >= 60 && age <= 64) {
    return `Master 5 ${gender}`;
  } else if (age >= 65 && age <= 69) {
    return `Master 6 ${gender}`;
  } else if (age >= 70 && age <= 74) {
    return `Master 7 ${gender}`;
  } else if (age >= 75 && age <= 79) {
    return `Master 8 ${gender}`;
  } else if (age >= 80 && age <= 84) {
    return `Master 9 ${gender}`;
  } else if (age >= 85) {
    return `Master 10 ${gender}`;
  }

  return null;
}

/**
 * Get category display string with age range for dropdown
 * e.g., "Master 0 H" -> "Master 0 H (35-39)"
 */
export function getCategoryWithAgeRange(category: string): string | null {
  const categoryMap: Record<string, string> = {
    'Senior H': 'Senior H (20-34)',
    'Senior F': 'Senior F (20-34)',
    'Master 0 H': 'Master 0 H (35-39)',
    'Master 0 F': 'Master 0 F (35-39)',
    'Master 1 H': 'Master 1 H (40-44)',
    'Master 1 F': 'Master 1 F (40-44)',
    'Master 2 H': 'Master 2 H (45-49)',
    'Master 2 F': 'Master 2 F (45-49)',
    'Master 3 H': 'Master 3 H (50-54)',
    'Master 3 F': 'Master 3 F (50-54)',
    'Master 4 H': 'Master 4 H (55-59)',
    'Master 4 F': 'Master 4 F (55-59)',
    'Master 5 H': 'Master 5 H (60-64)',
    'Master 5 F': 'Master 5 F (60-64)',
    'Master 6 H': 'Master 6 H (65-69)',
    'Master 6 F': 'Master 6 F (65-69)',
    'Master 7 H': 'Master 7 H (70-74)',
    'Master 7 F': 'Master 7 F (70-74)',
    'Master 8 H': 'Master 8 H (75-79)',
    'Master 8 F': 'Master 8 F (75-79)',
    'Master 9 H': 'Master 9 H (80-84)',
    'Master 9 F': 'Master 9 F (80-84)',
    'Master 10 H': 'Master 10 H (85+)',
    'Master 10 F': 'Master 10 F (85+)',
  };

  return categoryMap[category] || null;
}
