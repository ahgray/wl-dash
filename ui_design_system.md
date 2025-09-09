# UI Design System

## Visual Theme

### Overall Aesthetic
- **Style**: Modern sports broadcast with glassmorphism effects
- **Mood**: Professional yet engaging, dramatic but accessible
- **Inspiration**: ESPN SportsCenter meets modern fintech dashboards

### Color Palette

**Primary Colors**
```css
--primary-bg: #0a0a0a;           /* Deep black background */
--secondary-bg: #1a1a1a;        /* Card backgrounds */
--accent-bg: #2a2a2a;           /* Hover states */

--primary-text: #ffffff;         /* Main text */
--secondary-text: #a3a3a3;      /* Subtle text */
--muted-text: #666666;          /* Disabled/meta text */

--neon-green: #00ff88;          /* Success/wins */
--neon-red: #ff0066;            /* Danger/losses */  
--neon-blue: #0088ff;           /* Info/neutral */
--neon-purple: #8800ff;         /* Highlights/special */
--neon-yellow: #ffdd00;         /* Warnings/important */
```

**Team-Based Accents**
- Dynamically use official NFL team colors as accent colors
- Subtle team color gradients behind player cards
- Team logos as visual anchors throughout interface

### Typography

**Font Stack**
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-display: 'Orbitron', monospace; /* For numbers/scores */
--font-mono: 'Fira Code', monospace;   /* For technical data */
```

**Type Scale**
```css
--text-xs: 0.75rem;     /* 12px - Meta data */
--text-sm: 0.875rem;    /* 14px - Body small */
--text-base: 1rem;      /* 16px - Body */
--text-lg: 1.125rem;    /* 18px - Subheadings */
--text-xl: 1.25rem;     /* 20px - Headings */
--text-2xl: 1.5rem;     /* 24px - Section titles */
--text-3xl: 1.875rem;   /* 30px - Page titles */
--text-4xl: 2.25rem;    /* 36px - Hero numbers */
--text-5xl: 3rem;       /* 48px - Dashboard stats */
```

## Layout System

### Grid Structure
```css
/* Mobile First Responsive Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  padding: 1rem;
}

@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: 2rem;
  }
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}

@media (min-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

### Spacing System
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## Component Design Specifications

### Leaderboard Cards
```css
.leaderboard-card {
  background: linear-gradient(135deg, 
    rgba(26, 26, 26, 0.95) 0%, 
    rgba(42, 42, 42, 0.8) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.leaderboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--neon-green), var(--neon-blue));
}
```

### Player Cards
```css
.player-card {
  background: var(--secondary-bg);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
}

.player-card:hover {
  border-color: var(--neon-blue);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 136, 255, 0.15);
}

.team-logo-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 16px;
}
```

### Achievement Badges
```css
.achievement-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: linear-gradient(45deg, var(--neon-purple), var(--neon-blue));
  border-radius: 20px;
  font-size: var(--text-xs);
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.achievement-icon {
  width: 16px;
  height: 16px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}
```

### Statistical Displays
```css
.stat-display {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-number {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--neon-green);
  line-height: 1;
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--secondary-text);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

## Animation & Interaction

### Transitions
```css
/* Default transition for interactive elements */
.interactive {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects */
.hover-glow:hover {
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
  border-color: var(--neon-green);
}

/* Loading animations */
@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading-pulse {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

### Counter Animations
```css
/* Animated number counters for scores */
.animated-counter {
  font-variant-numeric: tabular-nums;
  transition: color 0.3s ease;
}

.counter-increase { color: var(--neon-green); }
.counter-decrease { color: var(--neon-red); }
```

## Responsive Design

### Breakpoints
```css
/* Mobile: 320px - 767px */
@media (max-width: 767px) {
  .dashboard-title { font-size: var(--text-2xl); }
  .leaderboard-card { padding: 16px; }
  .player-card { padding: 16px; }
}

/* Tablet: 768px - 1023px */
@media (min-width: 768px) and (max-width: 1023px) {
  .dashboard-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .dashboard-grid { grid-template-columns: repeat(3, 1fr); }
}
```

### Mobile Optimizations
- Touch-friendly button sizes (44px minimum)
- Swipeable card carousels
- Collapsible sections for information density
- Fixed header with key stats always visible

## Charts & Data Visualization

### Color Scheme for Charts
```javascript
const chartColors = {
  primary: '#00ff88',
  secondary: '#0088ff', 
  accent: '#ff0066',
  gradient: ['#00ff88', '#0088ff', '#8800ff'],
  background: 'rgba(26, 26, 26, 0.8)',
  grid: 'rgba(255, 255, 255, 0.1)'
};
```

### Chart Styling
- Dark backgrounds with subtle grid lines
- Bright neon colors for data series
- Smooth animations and transitions
- Responsive scaling for mobile viewing
- Tooltip styling matching overall design system

## Iconography

### Icon Style
- Line-based icons with 2px stroke weight
- Consistent 24px default size
- Team logos: 32px in cards, 48px in headers
- Achievement icons: 16px in badges, 32px in gallery

### Social Media Graphics
- 1080x1080px square format
- Dark background with subtle texture
- League branding in corner
- High contrast text for readability
- Team colors as accent elements

## Loading States

### Skeleton Screens
```css
.skeleton {
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.05) 25%, 
    rgba(255, 255, 255, 0.1) 50%, 
    rgba(255, 255, 255, 0.05) 75%);
  background-size: 200% 100%;
  animation: loading 2s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## Accessibility Features

### Color Contrast
- Minimum 4.5:1 ratio for normal text
- Minimum 3:1 ratio for large text
- Color is never the only way to convey information

### Interactive Elements
- Focus indicators using neon accent colors
- Keyboard navigation support
- ARIA labels for screen readers
- Semantic HTML structure

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```