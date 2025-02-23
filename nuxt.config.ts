// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@unlok-co/nuxt-stripe'],
  runtimeConfig: {
    public: {
      baseUrl: '',
      stripe: {
        key: '',
      },
    },
    stripe: {
      key: '',
    },
  },
  app: {
    head: {
      script: [
        {
          src: 'https://umami.cr.bswatcher.com/script.js',
          'data-website-id': '6d9e4194-7466-4609-8c76-89b6f32977df',
          async: true,
          defer: true,
        }
      ]
    }
  },
  colorMode: {
    preference: 'light'
  },
  stripe: {
    // Server
    server: {
      key: process.env.NUXT_STRIPE_KEY,
      options: {
        // your api options override for stripe server side
        // https://github.com/stripe/stripe-node?tab=readme-ov-file#configuration
      },
    // CLIENT
    },
    client: {
      key: process.env.NUXT_PUBLIC_STRIPE_KEY,
      // your api options override for stripe client side https://stripe.com/docs/js/initializing#init_stripe_js-options
      options: {},
    },
  },
})