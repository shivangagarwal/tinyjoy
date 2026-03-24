#!/usr/bin/env node
// Script to generate OG images as PNGs for all games
// Run: node scripts/generate-og-images.js

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OG_DIR = path.join(__dirname, '../public/og');

// SVG template helper
function makeSvg({ title, tagline, accentColor, decorators }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#0d0d1a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  ${decorators}
  <text x="600" y="200" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="600" fill="${accentColor}" text-anchor="middle" letter-spacing="4">TINYJOY</text>
  <text x="600" y="320" font-family="system-ui, -apple-system, sans-serif" font-size="88" font-weight="800" fill="white" text-anchor="middle">${title}</text>
  <text x="600" y="400" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="400" fill="#a1a1aa" text-anchor="middle">${tagline}</text>
  <rect x="350" y="460" width="500" height="60" rx="30" fill="${accentColor}" opacity="0.15"/>
  <text x="600" y="498" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="600" fill="${accentColor}" text-anchor="middle" letter-spacing="2">FREE · NO DOWNLOAD · PLAY NOW</text>
</svg>`;
}

// Game definitions — all 19 games + homepage
const games = {
  'tinyjoy': {
    title: 'TinyJoy',
    tagline: 'Calm, quick, delightful games',
    accentColor: '#F97316',
    decorators: `
  <rect x="60" y="80" width="70" height="70" rx="10" fill="#F97316" opacity="0.7"/>
  <rect x="140" y="80" width="70" height="70" rx="10" fill="#EF4444" opacity="0.6"/>
  <rect x="60" y="160" width="70" height="70" rx="10" fill="#3B82F6" opacity="0.6"/>
  <rect x="140" y="160" width="70" height="70" rx="10" fill="#10B981" opacity="0.7"/>
  <rect x="1050" y="80" width="70" height="70" rx="10" fill="#8B5CF6" opacity="0.4"/>
  <rect x="1050" y="160" width="70" height="70" rx="10" fill="#F97316" opacity="0.3"/>
  <circle cx="100" cy="530" r="30" fill="#F97316" opacity="0.2"/>
  <circle cx="1080" cy="510" r="35" fill="#10B981" opacity="0.2"/>`
  },
  'color-match': {
    title: 'Color Match',
    tagline: 'Tap the right tiles before time runs out',
    accentColor: '#F97316',
    decorators: `
  <rect x="80" y="80" width="100" height="100" rx="16" fill="#F97316" opacity="0.9"/>
  <rect x="200" y="80" width="100" height="100" rx="16" fill="#EF4444" opacity="0.9"/>
  <rect x="80" y="200" width="100" height="100" rx="16" fill="#3B82F6" opacity="0.9"/>
  <rect x="200" y="200" width="100" height="100" rx="16" fill="#10B981" opacity="0.9"/>
  <rect x="1000" y="80" width="100" height="100" rx="16" fill="#8B5CF6" opacity="0.6"/>
  <rect x="1060" y="180" width="80" height="80" rx="12" fill="#F97316" opacity="0.5"/>
  <rect x="900" y="460" width="90" height="90" rx="14" fill="#10B981" opacity="0.4"/>`
  },
  'memory-flip': {
    title: 'Memory Flip',
    tagline: 'Match all pairs before the clock runs out',
    accentColor: '#8B5CF6',
    decorators: `
  <rect x="80" y="80" width="80" height="110" rx="12" fill="#8B5CF6" opacity="0.8"/>
  <text x="120" y="148" font-family="system-ui" font-size="36" fill="white" text-anchor="middle">?</text>
  <rect x="180" y="80" width="80" height="110" rx="12" fill="#6D28D9" opacity="0.8"/>
  <text x="220" y="148" font-family="system-ui" font-size="32" fill="white" text-anchor="middle">★</text>
  <rect x="80" y="210" width="80" height="110" rx="12" fill="#7C3AED" opacity="0.7"/>
  <text x="120" y="278" font-family="system-ui" font-size="32" fill="white" text-anchor="middle">♥</text>
  <rect x="180" y="210" width="80" height="110" rx="12" fill="#8B5CF6" opacity="0.6"/>
  <text x="220" y="278" font-family="system-ui" font-size="32" fill="white" text-anchor="middle">◆</text>
  <rect x="1040" y="80" width="80" height="110" rx="12" fill="#8B5CF6" opacity="0.4"/>
  <text x="1080" y="148" font-family="system-ui" font-size="36" fill="white" text-anchor="middle">?</text>
  <rect x="1040" y="210" width="80" height="110" rx="12" fill="#6D28D9" opacity="0.3"/>
  <text x="1080" y="278" font-family="system-ui" font-size="32" fill="white" text-anchor="middle">?</text>`
  },
  'number-rush': {
    title: 'Number Rush',
    tagline: 'Tap 1–25 in order as fast as you can',
    accentColor: '#EF4444',
    decorators: `
  <rect x="70" y="90" width="80" height="80" rx="10" fill="#EF4444" opacity="0.9"/>
  <text x="110" y="143" font-family="system-ui" font-size="36" font-weight="700" fill="white" text-anchor="middle">1</text>
  <rect x="165" y="90" width="80" height="80" rx="10" fill="#DC2626" opacity="0.85"/>
  <text x="205" y="143" font-family="system-ui" font-size="36" font-weight="700" fill="white" text-anchor="middle">2</text>
  <rect x="70" y="185" width="80" height="80" rx="10" fill="#DC2626" opacity="0.85"/>
  <text x="110" y="238" font-family="system-ui" font-size="36" font-weight="700" fill="white" text-anchor="middle">3</text>
  <rect x="165" y="185" width="80" height="80" rx="10" fill="#EF4444" opacity="0.7"/>
  <text x="205" y="238" font-family="system-ui" font-size="36" font-weight="700" fill="white" text-anchor="middle">4</text>
  <rect x="1020" y="90" width="70" height="70" rx="10" fill="#EF4444" opacity="0.4"/>
  <text x="1055" y="135" font-family="system-ui" font-size="30" font-weight="700" fill="white" text-anchor="middle">25</text>
  <rect x="1020" y="180" width="70" height="70" rx="10" fill="#DC2626" opacity="0.3"/>
  <text x="1055" y="225" font-family="system-ui" font-size="30" font-weight="700" fill="white" text-anchor="middle">24</text>`
  },
  'pattern-echo': {
    title: 'Pattern Echo',
    tagline: 'Watch, remember, repeat the sequence',
    accentColor: '#10B981',
    decorators: `
  <circle cx="120" cy="130" r="55" fill="#10B981" opacity="0.8"/>
  <circle cx="230" cy="130" r="55" fill="#059669" opacity="0.7"/>
  <circle cx="120" cy="250" r="55" fill="#6D28D9" opacity="0.7"/>
  <circle cx="230" cy="250" r="55" fill="#10B981" opacity="0.6"/>
  <circle cx="1080" cy="130" r="50" fill="#10B981" opacity="0.35"/>
  <circle cx="1080" cy="250" r="50" fill="#6D28D9" opacity="0.25"/>
  <circle cx="100" cy="500" r="35" fill="#10B981" opacity="0.2"/>
  <circle cx="1080" cy="500" r="35" fill="#059669" opacity="0.2"/>`
  },
  'word-scramble': {
    title: 'Word Scramble',
    tagline: 'Unscramble the letters to find the word',
    accentColor: '#3B82F6',
    decorators: `
  <rect x="70" y="90" width="65" height="75" rx="10" fill="#3B82F6" opacity="0.9"/>
  <text x="102" y="143" font-family="system-ui" font-size="36" font-weight="700" fill="white" text-anchor="middle">W</text>
  <rect x="150" y="90" width="65" height="75" rx="10" fill="#2563EB" opacity="0.85"/>
  <text x="182" y="143" font-family="system-ui" font-size="36" font-weight="700" fill="white" text-anchor="middle">O</text>
  <rect x="70" y="185" width="65" height="75" rx="10" fill="#2563EB" opacity="0.8"/>
  <text x="102" y="238" font-family="system-ui" font-size="36" font-weight="700" fill="white" text-anchor="middle">R</text>
  <rect x="150" y="185" width="65" height="75" rx="10" fill="#3B82F6" opacity="0.7"/>
  <text x="182" y="238" font-family="system-ui" font-size="36" font-weight="700" fill="white" text-anchor="middle">D</text>
  <rect x="1050" y="90" width="65" height="75" rx="10" fill="#3B82F6" opacity="0.4"/>
  <text x="1082" y="143" font-family="system-ui" font-size="30" font-weight="700" fill="white" text-anchor="middle">S</text>
  <rect x="1050" y="185" width="65" height="75" rx="10" fill="#2563EB" opacity="0.3"/>
  <text x="1082" y="238" font-family="system-ui" font-size="30" font-weight="700" fill="white" text-anchor="middle">?</text>`
  },
  '2048': {
    title: '2048',
    tagline: 'Slide and merge tiles to reach 2048',
    accentColor: '#F59E0B',
    decorators: `
  <rect x="70" y="80" width="85" height="85" rx="12" fill="#F59E0B" opacity="0.9"/>
  <text x="112" y="136" font-family="system-ui" font-size="32" font-weight="800" fill="white" text-anchor="middle">2</text>
  <rect x="170" y="80" width="85" height="85" rx="12" fill="#D97706" opacity="0.85"/>
  <text x="212" y="136" font-family="system-ui" font-size="32" font-weight="800" fill="white" text-anchor="middle">4</text>
  <rect x="70" y="180" width="85" height="85" rx="12" fill="#D97706" opacity="0.85"/>
  <text x="112" y="236" font-family="system-ui" font-size="32" font-weight="800" fill="white" text-anchor="middle">8</text>
  <rect x="170" y="180" width="85" height="85" rx="12" fill="#B45309" opacity="0.8"/>
  <text x="212" y="236" font-family="system-ui" font-size="28" font-weight="800" fill="white" text-anchor="middle">16</text>
  <rect x="70" y="280" width="85" height="85" rx="12" fill="#F59E0B" opacity="0.5"/>
  <text x="112" y="332" font-family="system-ui" font-size="26" font-weight="800" fill="white" text-anchor="middle">32</text>
  <rect x="1040" y="80" width="85" height="85" rx="12" fill="#F59E0B" opacity="0.4"/>
  <text x="1082" y="136" font-family="system-ui" font-size="24" font-weight="800" fill="white" text-anchor="middle">512</text>
  <rect x="1040" y="180" width="85" height="85" rx="12" fill="#D97706" opacity="0.3"/>
  <text x="1082" y="236" font-family="system-ui" font-size="22" font-weight="800" fill="white" text-anchor="middle">1024</text>
  <rect x="1040" y="280" width="85" height="85" rx="12" fill="#B45309" opacity="0.25"/>
  <text x="1082" y="332" font-family="system-ui" font-size="22" font-weight="800" fill="white" text-anchor="middle">2048</text>`
  },
  'brick-breaker': {
    title: 'Brick Breaker',
    tagline: 'Clear all bricks with the bouncing ball',
    accentColor: '#F97316',
    decorators: `
  <rect x="60" y="80" width="55" height="30" rx="6" fill="#EF4444" opacity="0.9"/>
  <rect x="130" y="80" width="55" height="30" rx="6" fill="#F97316" opacity="0.9"/>
  <rect x="200" y="80" width="55" height="30" rx="6" fill="#EF4444" opacity="0.8"/>
  <rect x="60" y="125" width="55" height="30" rx="6" fill="#F97316" opacity="0.8"/>
  <rect x="130" y="125" width="55" height="30" rx="6" fill="#EF4444" opacity="0.7"/>
  <rect x="200" y="125" width="55" height="30" rx="6" fill="#F97316" opacity="0.7"/>
  <rect x="60" y="170" width="55" height="30" rx="6" fill="#EF4444" opacity="0.6"/>
  <rect x="130" y="170" width="55" height="30" rx="6" fill="#F97316" opacity="0.6"/>
  <circle cx="160" cy="380" r="16" fill="white" opacity="0.9"/>
  <rect x="100" y="480" width="120" height="18" rx="9" fill="white" opacity="0.6"/>
  <rect x="1050" y="80" width="55" height="30" rx="6" fill="#F97316" opacity="0.4"/>
  <rect x="1050" y="125" width="55" height="30" rx="6" fill="#EF4444" opacity="0.3"/>
  <rect x="1050" y="170" width="55" height="30" rx="6" fill="#F97316" opacity="0.25"/>`
  },
  'connect-four': {
    title: 'Connect Four',
    tagline: 'Connect 4 in a row to win',
    accentColor: '#FBBF24',
    decorators: `
  <circle cx="90" cy="100" r="28" fill="#FBBF24" opacity="0.9"/>
  <circle cx="160" cy="100" r="28" fill="#EF4444" opacity="0.9"/>
  <circle cx="230" cy="100" r="28" fill="#FBBF24" opacity="0.8"/>
  <circle cx="90" cy="170" r="28" fill="#EF4444" opacity="0.8"/>
  <circle cx="160" cy="170" r="28" fill="#FBBF24" opacity="0.7"/>
  <circle cx="230" cy="170" r="28" fill="#EF4444" opacity="0.7"/>
  <circle cx="90" cy="240" r="28" fill="#FBBF24" opacity="0.9"/>
  <circle cx="160" cy="240" r="28" fill="#FBBF24" opacity="0.6"/>
  <circle cx="1060" cy="100" r="25" fill="#FBBF24" opacity="0.35"/>
  <circle cx="1060" cy="170" r="25" fill="#EF4444" opacity="0.3"/>
  <circle cx="1060" cy="240" r="25" fill="#FBBF24" opacity="0.25"/>`
  },
  'flappy-jump': {
    title: 'Flappy Jump',
    tagline: 'Tap to flap, dodge the pipes',
    accentColor: '#22C55E',
    decorators: `
  <rect x="80" y="0" width="50" height="180" rx="8" fill="#16A34A" opacity="0.7"/>
  <rect x="80" y="280" width="50" height="350" rx="8" fill="#16A34A" opacity="0.7"/>
  <ellipse cx="160" cy="250" rx="28" ry="22" fill="#FBBF24" opacity="0.9"/>
  <circle cx="170" cy="244" r="6" fill="white" opacity="0.9"/>
  <polygon points="188,252 200,248 188,258" fill="#F97316" opacity="0.9"/>
  <rect x="220" y="0" width="50" height="120" rx="8" fill="#15803D" opacity="0.55"/>
  <rect x="220" y="220" width="50" height="410" rx="8" fill="#15803D" opacity="0.55"/>
  <rect x="1060" y="0" width="50" height="200" rx="8" fill="#16A34A" opacity="0.3"/>
  <rect x="1060" y="320" width="50" height="310" rx="8" fill="#16A34A" opacity="0.3"/>`
  },
  'hangman': {
    title: 'Hangman',
    tagline: 'Guess the word one letter at a time',
    accentColor: '#94A3B8',
    decorators: `
  <line x1="80" y1="520" x2="260" y2="520" stroke="#94A3B8" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
  <line x1="150" y1="520" x2="150" y2="80" stroke="#94A3B8" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
  <line x1="150" y1="80" x2="230" y2="80" stroke="#94A3B8" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
  <line x1="230" y1="80" x2="230" y2="120" stroke="#94A3B8" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
  <circle cx="230" cy="150" r="30" fill="none" stroke="#94A3B8" stroke-width="5" opacity="0.8"/>
  <line x1="230" y1="180" x2="230" y2="280" stroke="#94A3B8" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
  <line x1="230" y1="210" x2="195" y2="260" stroke="#94A3B8" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
  <line x1="230" y1="210" x2="265" y2="260" stroke="#94A3B8" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
  <line x1="230" y1="280" x2="200" y2="340" stroke="#94A3B8" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
  <line x1="230" y1="280" x2="260" y2="340" stroke="#94A3B8" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
  <rect x="900" y="460" width="60" height="60" rx="10" fill="#94A3B8" opacity="0.2"/>
  <text x="930" y="500" font-family="system-ui" font-size="28" font-weight="700" fill="#94A3B8" text-anchor="middle" opacity="0.5">A</text>
  <rect x="980" y="460" width="60" height="60" rx="10" fill="#94A3B8" opacity="0.15"/>
  <text x="1010" y="500" font-family="system-ui" font-size="28" font-weight="700" fill="#94A3B8" text-anchor="middle" opacity="0.4">B</text>
  <rect x="1060" y="460" width="60" height="60" rx="10" fill="#94A3B8" opacity="0.1"/>
  <text x="1090" y="500" font-family="system-ui" font-size="28" font-weight="700" fill="#94A3B8" text-anchor="middle" opacity="0.3">C</text>`
  },
  'minesweeper': {
    title: 'Minesweeper',
    tagline: 'Flag the mines, clear the board',
    accentColor: '#6366F1',
    decorators: `
  <rect x="70" y="80" width="55" height="55" rx="6" fill="#4F46E5" opacity="0.9"/>
  <text x="97" y="117" font-family="system-ui" font-size="24" font-weight="700" fill="#EF4444" text-anchor="middle">💣</text>
  <rect x="140" y="80" width="55" height="55" rx="6" fill="#4338CA" opacity="0.85"/>
  <text x="167" y="117" font-family="system-ui" font-size="24" font-weight="700" fill="white" text-anchor="middle">1</text>
  <rect x="210" y="80" width="55" height="55" rx="6" fill="#4F46E5" opacity="0.8"/>
  <text x="237" y="117" font-family="system-ui" font-size="24" font-weight="700" fill="#3B82F6" text-anchor="middle">2</text>
  <rect x="70" y="150" width="55" height="55" rx="6" fill="#4338CA" opacity="0.8"/>
  <text x="97" y="187" font-family="system-ui" font-size="24" font-weight="700" fill="#22C55E" text-anchor="middle">3</text>
  <rect x="140" y="150" width="55" height="55" rx="6" fill="#6366F1" opacity="0.7"/>
  <text x="167" y="187" font-family="system-ui" font-size="20" fill="white" text-anchor="middle">🚩</text>
  <rect x="210" y="150" width="55" height="55" rx="6" fill="#4F46E5" opacity="0.7"/>
  <text x="237" y="187" font-family="system-ui" font-size="24" font-weight="700" fill="#EF4444" text-anchor="middle">4</text>
  <rect x="70" y="220" width="55" height="55" rx="6" fill="#4338CA" opacity="0.6"/>
  <rect x="140" y="220" width="55" height="55" rx="6" fill="#6366F1" opacity="0.5"/>
  <rect x="210" y="220" width="55" height="55" rx="6" fill="#4F46E5" opacity="0.5"/>
  <rect x="1040" y="80" width="55" height="55" rx="6" fill="#4F46E5" opacity="0.3"/>
  <rect x="1040" y="150" width="55" height="55" rx="6" fill="#4338CA" opacity="0.25"/>
  <rect x="1040" y="220" width="55" height="55" rx="6" fill="#6366F1" opacity="0.2"/>`
  },
  'reaction-time': {
    title: 'Reaction Time',
    tagline: 'Tap as fast as you can when it turns green',
    accentColor: '#22C55E',
    decorators: `
  <circle cx="150" cy="200" r="100" fill="#15803D" opacity="0.3"/>
  <circle cx="150" cy="200" r="75" fill="#16A34A" opacity="0.5"/>
  <circle cx="150" cy="200" r="50" fill="#22C55E" opacity="0.8"/>
  <text x="150" y="215" font-family="system-ui" font-size="42" font-weight="800" fill="white" text-anchor="middle">TAP!</text>
  <circle cx="1080" cy="200" r="70" fill="#15803D" opacity="0.2"/>
  <circle cx="1080" cy="200" r="45" fill="#16A34A" opacity="0.15"/>
  <text x="150" y="500" font-family="system-ui" font-size="22" fill="#22C55E" text-anchor="middle" opacity="0.6">Ready...</text>`
  },
  'snake': {
    title: 'Snake',
    tagline: 'Eat, grow, don\'t hit the walls',
    accentColor: '#22C55E',
    decorators: `
  <rect x="70" y="100" width="28" height="28" rx="5" fill="#22C55E" opacity="0.9"/>
  <rect x="105" y="100" width="28" height="28" rx="5" fill="#16A34A" opacity="0.85"/>
  <rect x="140" y="100" width="28" height="28" rx="5" fill="#15803D" opacity="0.8"/>
  <rect x="140" y="135" width="28" height="28" rx="5" fill="#16A34A" opacity="0.8"/>
  <rect x="140" y="170" width="28" height="28" rx="5" fill="#15803D" opacity="0.75"/>
  <rect x="105" y="170" width="28" height="28" rx="5" fill="#16A34A" opacity="0.7"/>
  <rect x="70" y="170" width="28" height="28" rx="5" fill="#15803D" opacity="0.65"/>
  <rect x="70" y="205" width="28" height="28" rx="5" fill="#16A34A" opacity="0.6"/>
  <rect x="70" y="240" width="28" height="28" rx="5" fill="#22C55E" opacity="0.5"/>
  <circle cx="220" cy="170" r="12" fill="#EF4444" opacity="0.9"/>
  <rect x="1040" y="100" width="28" height="28" rx="5" fill="#22C55E" opacity="0.3"/>
  <rect x="1075" y="100" width="28" height="28" rx="5" fill="#16A34A" opacity="0.25"/>
  <rect x="1075" y="135" width="28" height="28" rx="5" fill="#15803D" opacity="0.2"/>`
  },
  'solitaire': {
    title: 'Solitaire',
    tagline: 'Sort all cards to the foundation',
    accentColor: '#22C55E',
    decorators: `
  <rect x="70" y="80" width="70" height="100" rx="10" fill="#1e3a5f" stroke="#3B82F6" stroke-width="2" opacity="0.9"/>
  <text x="105" y="120" font-family="system-ui" font-size="26" font-weight="700" fill="#EF4444" text-anchor="middle">A</text>
  <text x="105" y="148" font-family="system-ui" font-size="22" fill="#EF4444" text-anchor="middle">♥</text>
  <rect x="155" y="80" width="70" height="100" rx="10" fill="#1e3a5f" stroke="#3B82F6" stroke-width="2" opacity="0.9"/>
  <text x="190" y="120" font-family="system-ui" font-size="26" font-weight="700" fill="#1e293b" text-anchor="middle">K</text>
  <text x="190" y="148" font-family="system-ui" font-size="22" fill="#1e293b" text-anchor="middle">♠</text>
  <rect x="100" y="120" width="70" height="100" rx="10" fill="#1e3a5f" stroke="#3B82F6" stroke-width="2" opacity="0.8"/>
  <text x="135" y="162" font-family="system-ui" font-size="26" font-weight="700" fill="#22C55E" text-anchor="middle">Q</text>
  <text x="135" y="190" font-family="system-ui" font-size="22" fill="#22C55E" text-anchor="middle">♣</text>
  <rect x="1040" y="80" width="70" height="100" rx="10" fill="#1e3a5f" stroke="#6366F1" stroke-width="2" opacity="0.4"/>
  <text x="1075" y="120" font-family="system-ui" font-size="26" font-weight="700" fill="#94A3B8" text-anchor="middle">J</text>
  <rect x="1040" y="200" width="70" height="100" rx="10" fill="#1e3a5f" stroke="#6366F1" stroke-width="2" opacity="0.3"/>
  <text x="1075" y="240" font-family="system-ui" font-size="26" font-weight="700" fill="#94A3B8" text-anchor="middle">10</text>`
  },
  'sudoku': {
    title: 'Sudoku',
    tagline: 'Fill the grid so every row and column adds up',
    accentColor: '#6366F1',
    decorators: `
  <rect x="70" y="70" width="185" height="185" rx="8" fill="none" stroke="#6366F1" stroke-width="3" opacity="0.6"/>
  <line x1="132" y1="70" x2="132" y2="255" stroke="#6366F1" stroke-width="2" opacity="0.4"/>
  <line x1="194" y1="70" x2="194" y2="255" stroke="#6366F1" stroke-width="2" opacity="0.4"/>
  <line x1="70" y1="132" x2="255" y2="132" stroke="#6366F1" stroke-width="2" opacity="0.4"/>
  <line x1="70" y1="194" x2="255" y2="194" stroke="#6366F1" stroke-width="2" opacity="0.4"/>
  <text x="101" y="110" font-family="system-ui" font-size="26" font-weight="700" fill="white" text-anchor="middle" opacity="0.9">5</text>
  <text x="163" y="110" font-family="system-ui" font-size="26" font-weight="700" fill="#6366F1" text-anchor="middle" opacity="0.8">3</text>
  <text x="225" y="110" font-family="system-ui" font-size="26" font-weight="700" fill="white" text-anchor="middle" opacity="0.9">1</text>
  <text x="101" y="172" font-family="system-ui" font-size="26" font-weight="700" fill="#6366F1" text-anchor="middle" opacity="0.8">6</text>
  <text x="225" y="172" font-family="system-ui" font-size="26" font-weight="700" fill="white" text-anchor="middle" opacity="0.9">8</text>
  <text x="101" y="234" font-family="system-ui" font-size="26" font-weight="700" fill="white" text-anchor="middle" opacity="0.9">9</text>
  <text x="163" y="234" font-family="system-ui" font-size="26" font-weight="700" fill="white" text-anchor="middle" opacity="0.9">7</text>
  <text x="225" y="234" font-family="system-ui" font-size="26" font-weight="700" fill="#6366F1" text-anchor="middle" opacity="0.8">4</text>
  <rect x="1040" y="70" width="120" height="120" rx="8" fill="none" stroke="#6366F1" stroke-width="2" opacity="0.3"/>
  <line x1="1080" y1="70" x2="1080" y2="190" stroke="#6366F1" stroke-width="1.5" opacity="0.2"/>
  <line x1="1040" y1="110" x2="1160" y2="110" stroke="#6366F1" stroke-width="1.5" opacity="0.2"/>`
  },
  'tic-tac-toe': {
    title: 'Tic-Tac-Toe',
    tagline: 'Get three in a row to win',
    accentColor: '#3B82F6',
    decorators: `
  <line x1="150" y1="80" x2="150" y2="320" stroke="#3B82F6" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
  <line x1="230" y1="80" x2="230" y2="320" stroke="#3B82F6" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
  <line x1="70" y1="160" x2="310" y2="160" stroke="#3B82F6" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
  <line x1="70" y1="240" x2="310" y2="240" stroke="#3B82F6" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
  <text x="110" y="140" font-family="system-ui" font-size="52" font-weight="700" fill="#EF4444" text-anchor="middle" opacity="0.9">X</text>
  <text x="190" y="230" font-family="system-ui" font-size="48" font-weight="700" fill="#3B82F6" text-anchor="middle" opacity="0.9">O</text>
  <text x="270" y="140" font-family="system-ui" font-size="52" font-weight="700" fill="#EF4444" text-anchor="middle" opacity="0.9">X</text>
  <text x="110" y="308" font-family="system-ui" font-size="48" font-weight="700" fill="#3B82F6" text-anchor="middle" opacity="0.7">O</text>
  <text x="270" y="308" font-family="system-ui" font-size="52" font-weight="700" fill="#EF4444" text-anchor="middle" opacity="0.5">X</text>
  <line x1="1050" y1="80" x2="1050" y2="220" stroke="#3B82F6" stroke-width="4" opacity="0.3"/>
  <line x1="1110" y1="80" x2="1110" y2="220" stroke="#3B82F6" stroke-width="4" opacity="0.3"/>
  <line x1="1020" y1="140" x2="1140" y2="140" stroke="#3B82F6" stroke-width="4" opacity="0.3"/>
  <line x1="1020" y1="200" x2="1140" y2="200" stroke="#3B82F6" stroke-width="4" opacity="0.3"/>`
  },
  'typing-speed': {
    title: 'Typing Speed',
    tagline: 'How fast can you type? Find out now.',
    accentColor: '#3B82F6',
    decorators: `
  <rect x="60" y="380" width="300" height="100" rx="12" fill="#1e293b" opacity="0.8"/>
  <rect x="80" y="410" width="55" height="38" rx="6" fill="#334155" opacity="0.9"/>
  <text x="107" y="435" font-family="system-ui" font-size="18" font-weight="600" fill="#94A3B8" text-anchor="middle">Q</text>
  <rect x="148" y="410" width="55" height="38" rx="6" fill="#334155" opacity="0.9"/>
  <text x="175" y="435" font-family="system-ui" font-size="18" font-weight="600" fill="#94A3B8" text-anchor="middle">W</text>
  <rect x="216" y="410" width="55" height="38" rx="6" fill="#3B82F6" opacity="0.9"/>
  <text x="243" y="435" font-family="system-ui" font-size="18" font-weight="700" fill="white" text-anchor="middle">E</text>
  <rect x="284" y="410" width="55" height="38" rx="6" fill="#334155" opacity="0.9"/>
  <text x="311" y="435" font-family="system-ui" font-size="18" font-weight="600" fill="#94A3B8" text-anchor="middle">R</text>
  <text x="200" y="200" font-family="system-ui" font-size="24" fill="#94A3B8" text-anchor="middle" opacity="0.8">the quick brown fox</text>
  <text x="200" y="240" font-family="system-ui" font-size="24" fill="#22C55E" text-anchor="middle" opacity="0.9">the quick</text>
  <rect x="1040" y="380" width="120" height="100" rx="12" fill="#1e293b" opacity="0.4"/>
  <rect x="1050" y="400" width="45" height="30" rx="5" fill="#334155" opacity="0.5"/>
  <rect x="1105" y="400" width="45" height="30" rx="5" fill="#334155" opacity="0.5"/>
  <rect x="1050" y="445" width="100" height="20" rx="5" fill="#334155" opacity="0.5"/>
  <text x="270" y="130" font-family="system-ui" font-size="48" font-weight="800" fill="#3B82F6" text-anchor="middle" opacity="0.6">87</text>
  <text x="270" y="165" font-family="system-ui" font-size="20" fill="#94A3B8" text-anchor="middle" opacity="0.6">WPM</text>`
  },
  'whack-a-mole': {
    title: 'Whack-a-Mole',
    tagline: 'Tap the moles before they hide!',
    accentColor: '#F59E0B',
    decorators: `
  <ellipse cx="110" cy="320" rx="45" ry="20" fill="#78350F" opacity="0.8"/>
  <ellipse cx="110" cy="260" rx="38" ry="45" fill="#92400E" opacity="0.9"/>
  <ellipse cx="110" cy="248" rx="22" ry="20" fill="#A16207" opacity="0.9"/>
  <circle cx="98" cy="248" r="5" fill="#1e293b" opacity="0.9"/>
  <circle cx="122" cy="248" r="5" fill="#1e293b" opacity="0.9"/>
  <ellipse cx="200" cy="360" rx="45" ry="20" fill="#78350F" opacity="0.7"/>
  <ellipse cx="1080" cy="380" rx="45" ry="20" fill="#78350F" opacity="0.3"/>
  <circle cx="160" cy="150" r="30" fill="#FBBF24" opacity="0.9"/>
  <line x1="150" y1="140" x2="130" y2="120" stroke="#F59E0B" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
  <line x1="170" y1="140" x2="185" y2="118" stroke="#F59E0B" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
  <line x1="160" y1="135" x2="160" y2="110" stroke="#F59E0B" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
  <text x="160" y="160" font-family="system-ui" font-size="20" font-weight="700" fill="white" text-anchor="middle" opacity="0.9">POW!</text>`
  },
  'word-guess': {
    title: 'Word Guess',
    tagline: 'Guess the 5-letter word in 6 tries',
    accentColor: '#22C55E',
    decorators: `
  <rect x="70" y="80" width="55" height="55" rx="6" fill="#22C55E" opacity="0.9"/>
  <text x="97" y="118" font-family="system-ui" font-size="28" font-weight="700" fill="white" text-anchor="middle">W</text>
  <rect x="140" y="80" width="55" height="55" rx="6" fill="#16A34A" opacity="0.85"/>
  <text x="167" y="118" font-family="system-ui" font-size="28" font-weight="700" fill="white" text-anchor="middle">O</text>
  <rect x="210" y="80" width="55" height="55" rx="6" fill="#F59E0B" opacity="0.85"/>
  <text x="237" y="118" font-family="system-ui" font-size="28" font-weight="700" fill="white" text-anchor="middle">R</text>
  <rect x="70" y="150" width="55" height="55" rx="6" fill="#334155" opacity="0.7"/>
  <text x="97" y="188" font-family="system-ui" font-size="28" font-weight="700" fill="white" text-anchor="middle">D</text>
  <rect x="140" y="150" width="55" height="55" rx="6" fill="#22C55E" opacity="0.7"/>
  <text x="167" y="188" font-family="system-ui" font-size="28" font-weight="700" fill="white" text-anchor="middle">L</text>
  <rect x="210" y="150" width="55" height="55" rx="6" fill="#334155" opacity="0.6"/>
  <text x="237" y="188" font-family="system-ui" font-size="28" font-weight="700" fill="white" text-anchor="middle">E</text>
  <rect x="70" y="220" width="55" height="55" rx="6" fill="#334155" opacity="0.5"/>
  <rect x="140" y="220" width="55" height="55" rx="6" fill="#16A34A" opacity="0.5"/>
  <rect x="210" y="220" width="55" height="55" rx="6" fill="#334155" opacity="0.4"/>
  <rect x="1040" y="80" width="55" height="55" rx="6" fill="#334155" opacity="0.3"/>
  <rect x="1040" y="150" width="55" height="55" rx="6" fill="#22C55E" opacity="0.25"/>
  <rect x="1040" y="220" width="55" height="55" rx="6" fill="#334155" opacity="0.2"/>`
  },
};

async function generateAll() {
  let generated = 0;
  let failed = 0;

  for (const [name, config] of Object.entries(games)) {
    const svgPath = path.join(OG_DIR, `${name}.svg`);
    const pngPath = path.join(OG_DIR, `${name}.png`);

    // Write SVG if it doesn't already exist (or always overwrite for consistency)
    const svg = makeSvg(config);
    fs.writeFileSync(svgPath, svg);

    // Convert to PNG
    try {
      await sharp(Buffer.from(svg))
        .png()
        .toFile(pngPath);
      console.log(`✓ ${name}.png`);
      generated++;
    } catch (e) {
      console.error(`✗ ${name}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${generated} PNGs generated, ${failed} failed.`);
}

generateAll();
