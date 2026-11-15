// ── Riviera Editorial Design Tokens ──────────────────────────────────────────────
// Inspired by Swiss graphic design, modern European typography, and architectural planning.
// Strictly no dark-mode neon/purple AI aesthetic.

export const palette = {
  bgMain: '#F7F4EC',          // warm linen/sand
  bgSecondary: '#FFFFFF',     // crisp architectural white
  bgSurface: '#FFFFFF',
  bgParchment: '#E9D8CB',     // warm biscuit / secondary surface
  bgParchmentLight: '#F3EAE2',
  primary: '#E66B45',         // warm terracotta / rust orange
  primaryHover: '#D55A34',
  secondary: '#3457A4',       // deep Mediterranean cobalt / azure
  secondaryHover: '#2A4687',
  success: '#D6DFB5',         // soft sage olive
  successText: '#27441C',     // deep forest ink
  warning: '#EBCB73',         // warm ochre / Dijon gold
  warningText: '#563F00',     // deep ochre ink
  danger: '#D9534F',          // architectural terracotta crimson
  dangerText: '#681A16',
  textMain: '#252D35',        // architectural deep charcoal / ink
  textMuted: '#777B78',       // mineral grey / slate
  border: '#E9E4DA',          // subtle hairline architectural border
  borderDark: '#D4CDC0',      // darker hairline for emphasis
  shadowSoft: '0 4px 20px rgba(37, 45, 53, 0.04)',
  shadowElevated: '0 12px 32px rgba(37, 45, 53, 0.07)',
  shadowFloat: '0 20px 48px rgba(37, 45, 53, 0.09)',
};

export const typography = {
  fontHeading: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
  fontBody: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

// Track visual styling for editorial Swiss aesthetic
export const trackStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
  keynote: { bg: '#EAEFFE', text: '#3457A4', border: '#C5D3FA', label: 'Keynote' },
  workshop: { bg: '#F1F5E4', text: '#3A5426', border: '#D6DFB5', label: 'Workshop' },
  panel: { bg: '#FDF6E2', text: '#684F00', border: '#EBCB73', label: 'Panel' },
  networking: { bg: '#FBECE8', text: '#A94324', border: '#F4C4B5', label: 'Networking' },
  breakout: { bg: '#F4ECF7', text: '#6B387D', border: '#DDC2E5', label: 'Breakout' },
};

