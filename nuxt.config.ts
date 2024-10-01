// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@unlok-co/nuxt-stripe'],
  extends: ['nuxt-umami'],
  runtimeConfig: {
    public: {
      baseUrl: '',
    }
  },
  colorMode: {
    preference: 'light'
  },
  stripe: {
    // Server
    server: {
      key: process.env.NUXT_STRIPE_SECRET_KEY,
      options: {
        // your api options override for stripe server side
        // https://github.com/stripe/stripe-node?tab=readme-ov-file#configuration
      },
    // CLIENT
    },
    client: {
      key: process.env.NUXT_PUBLIC_STRIPE_PUBLIC_KEY,
      // your api options override for stripe client side https://stripe.com/docs/js/initializing#init_stripe_js-options
      options: {},
    },
  },
})