/**
 * Ambient module declarations for static image imports.
 *
 * Expo normally provides these via the generated `expo-env.d.ts` (gitignored,
 * created by `npx expo start` / `expo prebuild`). Keeping an explicit copy
 * here means image imports (like the logo in home-hero.tsx) type-check even
 * before the dev server has been run once — e.g. in CI, or a fresh clone.
 */
declare module "*.png" {
  const value: number;
  export default value;
}

declare module "*.jpg" {
  const value: number;
  export default value;
}

declare module "*.jpeg" {
  const value: number;
  export default value;
}

declare module "*.gif" {
  const value: number;
  export default value;
}

declare module "*.svg" {
  const value: number;
  export default value;
}
