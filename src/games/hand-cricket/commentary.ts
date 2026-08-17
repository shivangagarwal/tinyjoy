/**
 * The AI's trash talk — short, kid-safe, and honest about whether it read
 * you or just got lucky. Lines with {n} get the relevant number swapped in.
 */
import type { Rng } from './brain';

export type CommentEvent =
  | 'toss-ai-bowl'
  | 'toss-ai-bat'
  | 'toss-player-bat'
  | 'toss-player-bowl'
  | 'player-six'
  | 'player-single'
  | 'player-run' // same number 3+ in a row
  | 'player-favourite' // one number > half their picks
  | 'player-out-read'
  | 'player-out-lucky'
  | 'ai-six'
  | 'ai-single'
  | 'ai-out'
  | 'ai-dodged' // AI batted in predict mode and dodged the bowl
  | 'chase-close' // player chasing, needs ≤ 6
  | 'ai-chase-close'
  | 'sudden-death';

const LINES: Record<CommentEvent, string[]> = {
  'toss-ai-bowl': ["I'll bowl. Show me what you've got.", 'Bowling first. Every ball, I learn.'],
  'toss-ai-bat': ["I'll bat. Try to read me.", 'Batting first. Good luck bowling to me.'],
  'toss-player-bat': ['Bat first? Bold. Every pick tells me something.', 'Okay, batter. I’m watching.'],
  'toss-player-bowl': ['You bowl? Let’s see if you can guess me.', 'Bowl away. I dodge for a living.'],
  'player-six': ['SIX! Okay okay, lucky.', 'Big hit! Don’t get used to it.', 'Six. Noted. 👀'],
  'player-single': ['Just a single? Bold strategy.', 'One run. Thrilling stuff.', 'A single. My grandma hits harder.'],
  'player-run': ['Third {n} in a row. I see you.', '{n} again? You’re making this easy.', 'Same number again… I’m taking notes.'],
  'player-favourite': ['You really love {n}, huh?', 'That’s a lot of {n}s. Just saying.', '{n} is your favourite. I can tell.'],
  'player-out-read': ['GOT YOU! I knew you’d play {n}.', 'Read you like a book. {n} it was.', 'Predicted {n}. You’re out!'],
  'player-out-lucky': ['Same number! Unlucky.', 'Ha! Total guess, and it landed.', 'OUT! Okay, that one was luck.'],
  'ai-six': ['SIX! Fetch that.', 'Did you see where that went?', 'Six. Effortless.'],
  'ai-single': ['Rotating the strike. Very professional.', 'A single. Playing it safe.'],
  'ai-out': ['Nooo! Fine. Good ball.', 'You read me! Respect.', 'Out?! I want a replay.'],
  'ai-dodged': ['I knew you’d bowl {n}. Dodged it.', 'Not falling for {n}. Try again.', 'You bowl {n} a lot. I noticed.'],
  'chase-close': ['Need {n} more? No pressure.', 'Almost there… don’t choke.', 'This is where I get you.'],
  'ai-chase-close': ['I need {n}. Watch this.', 'Just {n} more. Easy.', '{n} to win. Bowl carefully.'],
  'sudden-death': ['Tied?! One ball each. Don’t blink.', 'Sudden death. Nerves of steel time.'],
};

export function comment(event: CommentEvent, rng: Rng, n?: number): string {
  const options = LINES[event];
  const line = options[Math.floor(rng() * options.length)];
  return line.replace(/\{n\}/g, String(n ?? ''));
}
