export type ThemeConfig = {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  rouletteVariant: 'classic' | 'neon' | 'extreme';
  landingVariant: 'premium' | 'gameshow' | 'futuristic';
};

export const theme: ThemeConfig = {
  primaryColor: '#ef4444', // Red 500
  secondaryColor: '#1f2937', // Gray 800
  backgroundColor: '#000000', // Black
  rouletteVariant: 'classic',
  landingVariant: 'premium',
};
