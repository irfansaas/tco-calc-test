'use client';

/**
 * Environment banner that displays at the top of the page in non-production environments.
 * Reads from NEXT_PUBLIC_APP_ENV environment variable.
 * - 'dev' → Red banner: "DEVELOPMENT ENVIRONMENT"
 * - 'test' → Amber banner: "TEST ENVIRONMENT"
 * - 'prod' or undefined → No banner shown
 */

const ENV_CONFIG: Record<string, { label: string; colors: string } | null> = {
  dev: {
    label: 'DEVELOPMENT ENVIRONMENT — Data may be reset at any time',
    colors: 'bg-red-600 text-white',
  },
  test: {
    label: 'TEST ENVIRONMENT — For validation only',
    colors: 'bg-amber-500 text-black',
  },
  prod: null,
};

export default function EnvironmentBanner() {
  const env = process.env.NEXT_PUBLIC_APP_ENV?.toLowerCase() || 'prod';
  const config = ENV_CONFIG[env];

  if (!config) return null;

  return (
    <div className={`w-full py-1.5 px-4 text-center text-xs font-bold tracking-wider ${config.colors} z-[60]`}>
      {config.label}
    </div>
  );
}
