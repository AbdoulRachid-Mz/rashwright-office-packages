declare namespace NodeJS {
  interface ProcessEnv {
    // Auth
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;

    // Environment
    NODE_ENV: "development" | "production" | "test";

    // JWT
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;

    // Feature toggles
    ENABLE_AUTH: string;
    ENABLE_PERMISSIONS: string;
    REQUIRE_AUTH_VERIFICATION: string;

    // Database connections
    DATABASE_URL: string;
    DATABASE_URL_UNPOOLED: string;
    PGHOST: string;
    PGHOST_UNPOOLED: string;
    PGUSER: string;
    PGDATABASE: string;
    PGPASSWORD: string;

    // Vercel Postgres
    POSTGRES_URL: string;
    POSTGRES_URL_NON_POOLING: string;
    POSTGRES_USER: string;
    POSTGRES_HOST: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_DATABASE: string;
    POSTGRES_URL_NO_SSL: string;
    POSTGRES_PRISMA_URL: string;

    // Google OAuth
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;

    // Firebase client
    FIREBASE_API_KEY: string;
    FIREBASE_AUTH_DOMAIN: string;
    FIREBASE_PROJECT_ID: string;
    FIREBASE_STORAGE_BUCKET: string;
    FIREBASE_MESSAGING_SENDER_ID: string;
    FIREBASE_APP_ID: string;
    FIREBASE_MEASUREMENT_ID: string;
    FIREBASE_DATABASE_URL: string;
    FIREBASE_CERTIFICATE: string;

    // Firebase Admin
    FIREBASE_PRIVATE_KEY: string;
    FIREBASE_CLIENT_EMAIL: string;
    FCM_PRIVATE_KEY: string;
    FIREBASE_SERVICE_ACCOUNT: string;

    // App Check
    RECAPTCHA_SITE_KEY: string;
    FIREBASE_APP_CHECK_DEBUG_TOKEN: string;
    APP_CHECK_DEBUG: string;

    // App IDs
    ALLOWED_APP_IDS: string;
    WEB_APP_ID: string;
    MOBILE_APP_ID: string;

    // CORS
    ALLOWED_ORIGINS: string;

    // Redis / Upstash
    REDIS_URL: string;
    UPSTASH_REDIS_TOKEN: string;
    UPSTASH_REDIS_REST_URL: string;
    UPSTASH_REDIS_REST_TOKEN: string;

    // Rate limiting
    RATE_LIMIT_WINDOW_MS: string;
    RATE_LIMIT_MAX_REQUESTS: string;

    // WebSocket
    REDIS_WS_URL: string;
  }
}
