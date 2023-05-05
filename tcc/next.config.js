const nextConfig = {
  productionBrowserSourceMaps: true,
  experimental: {
    serverActions: true,
  },
  env: {
    REACT_APP_GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  }
}

module.exports = nextConfig;
