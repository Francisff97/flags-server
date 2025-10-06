

const nextConfig = {
  experimental: {
    tsconfigPaths: true, // aiuta Next a leggere i paths del tsconfig
  },
  webpack: (config) => {
    // forza @ a puntare alla root del repo
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
};

module.exports = nextConfig;
