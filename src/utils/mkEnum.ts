/**
 * Make an enum compatible with types
 *
 * @param x - The enum
 * @returns The enum type enforced
 */
export default function mkEnum<
  T extends { [index: string]: U },
  U extends string
>(x: T): T {
  return x;
}
