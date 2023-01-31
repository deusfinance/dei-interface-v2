module.exports = {
  images: {
    domains: ['raw.githubusercontent.com', 'assets.spooky.fi'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/bonds',
        destination: '/bond',
        permanent: true,
      },
      {
        source: '/clqdr',
        destination: 'http://app.deus.finance/clqdr',
        permanent: false,
      },
      {
        source: '/vest',
        destination: 'http://app.deus.finance/vest',
        permanent: false,
      },
      {
        source: '/vest/create',
        destination: 'http://app.deus.finance/vest/create',
        permanent: false,
      },
    ]
  },
}
