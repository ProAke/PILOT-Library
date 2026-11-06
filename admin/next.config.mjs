/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // The ops console is a standalone frontend: deploy it as its own project
  // (Vercel root directory = admin) so a back-office mistake can never take
  // the customer storefront down.
  poweredByHeader: false,
};

export default config;
