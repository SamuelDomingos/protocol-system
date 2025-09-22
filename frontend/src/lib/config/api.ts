
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL,

  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

export { API_CONFIG };