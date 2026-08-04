/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  webpack: (config, { webpack }) => {
    // `@wagmi/connectors` barrel-exports `baseAccount`, which pulls in
    // `@coinbase/cdp-sdk`. That SDK lazily imports optional `@x402/*` peer
    // dependencies only when signing x402 payments — a flow this app never
    // uses (it only uses the `injected` connector). The packages aren't
    // installed, so webpack fails to resolve them at build time. Ignore them;
    // the SDK already guards these dynamic imports at runtime.
    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /^@x402\// }),
    );
    return config;
  },
};

export default nextConfig;
