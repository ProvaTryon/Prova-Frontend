import createNextIntlPlugin from 'next-intl/plugin';

// Create the wrapper with our i18n config
const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

// Export wrapped config
export default withNextIntl(nextConfig);
