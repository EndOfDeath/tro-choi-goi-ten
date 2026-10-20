import { Student } from '../types';

/**
 * Cryptographically secure unbiased integer random generator in range [0, max - 1]
 * Uses Web Crypto API with rejection sampling to eliminate modulo bias.
 */
export function getSecureRandomInt(max: number): number {
  if (max <= 1) return 0;
  const limit = Math.floor(0xffffffff / max) * max;
  const array = new Uint32Array(1);

  while (true) {
    window.crypto.getRandomValues(array);
    if (array[0] < limit) {
      return array[0] % max;
    }
  }
}

/**
 * Pick one student randomly from the eligible list with equal probability.
 */
export function pickRandomStudent(pool: Student[]): Student | null {
  if (!pool || pool.length === 0) return null;
  const index = getSecureRandomInt(pool.length);
  return pool[index];
}

/**
 * Fisher-Yates cryptographically secure shuffle
 */
export function secureShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Select a representative group of up to `maxCount` students for visual animation,
 * GUARANTEEING that the pre-selected winner is included, and placed in a randomized lane/spot.
 */
export function selectRepresentativeGroup(
  pool: Student[],
  winner: Student,
  maxCount: number = 8
): Student[] {
  if (pool.length <= maxCount) {
    return secureShuffle(pool);
  }

  // Filter out the winner from the other peers
  const otherEligible = pool.filter(s => s.id !== winner.id);
  const shuffledOthers = secureShuffle(otherEligible);
  const selectedPeers = shuffledOthers.slice(0, maxCount - 1);

  // Combine winner + peers and shuffle order so winner's starting lane is random
  const combined = [winner, ...selectedPeers];
  return secureShuffle(combined);
}

/**
 * Compute disambiguation labels for students with duplicate names.
 * Ensures identical names are never conflated and can be easily distinguished.
 */
export function assignDisambiguationLabels(students: Student[]): Student[] {
  const nameCounts = new Map<string, number>();
  for (const s of students) {
    const norm = s.name.trim().toLowerCase();
    nameCounts.set(norm, (nameCounts.get(norm) || 0) + 1);
  }

  const nameOccurrences = new Map<string, number>();

  return students.map(student => {
    const norm = student.name.trim().toLowerCase();
    const count = nameCounts.get(norm) || 0;
    if (count > 1) {
      const occurrence = (nameOccurrences.get(norm) || 0) + 1;
      nameOccurrences.set(norm, occurrence);
      return {
        ...student,
        disambiguationLabel: `#${occurrence}${student.code ? ` (${student.code})` : ''}`,
      };
    }
    return {
      ...student,
      disambiguationLabel: undefined,
    };
  });
}
