// /** @type {import('next').NextConfig} */
// const nextConfig = {
// }

// module.exports = nextConfig


module.exports = {
  reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'cdn.intra.42.fr',
        },
        {
          protocol: 'https',
          hostname: 'p.kindpng.com',
        },
        {
          protocol: 'https',
          hostname: 'cdn.discordapp.com',
        }
        
      ],
    },
  }

