'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ScoreTracker, GameTimer, vibrate, SoundManager } from '@/lib/engine';
import AdUnit from '@/components/AdUnit';
import { HomeLink, OtherGames } from '@/components/GameNav';

// ── Word List ──────────────────────────────────────────────────────────────
// ~200 common English words, 4-6 letters

const WORDS = [
  // 4-letter
  'able','acid','aged','also','area','army','away','baby','back','ball',
  'band','bank','base','bath','bear','beat','been','bell','best','bird',
  'blow','blue','boat','body','bone','book','born','both','bulk','burn',
  'busy','cake','call','calm','came','camp','card','care','cash','cast',
  'cave','cell','chat','chef','chip','city','clap','clay','clip','club',
  'coal','coat','code','coin','cold','come','cook','cool','copy','core',
  'corn','cost','crop','cube','cure','dark','data','date','dawn','days',
  'dead','deal','dear','deck','deep','deny','desk','diet','dirt','dive',
  'dock','does','done','door','down','draw','drop','drum','dual','dump',
  'dust','duty','each','earn','ease','east','easy','edge','else','emit',
  'even','ever','evil','exam','face','fact','fail','fair','fall','fame',
  'farm','fast','fate','feel','fell','felt','file','fill','film','find',
  'fire','firm','fish','fist','five','flag','flat','flew','flip','flow',
  'foam','fold','font','food','fool','foot','ford','fork','form','fort',
  'four','free','from','fuel','full','fund','fury','fuse','gain','game',
  'gate','gave','gear','gift','give','glad','glow','glue','goal','gold',
  'golf','gone','good','grab','gray','grew','grid','grin','grip','grow',
  'gulf','gust','hack','half','hall','hand','hang','hard','harm','hash',
  'have','hawk','head','heap','heat','heel','held','hell','help','herb',
  'here','hero','hide','high','hill','hint','hold','hole','home','hood',
  'hook','hope','horn','host','hour','huge','hung','hunt','hurt','idea',
  'inch','into','iron','item','jail','join','joke','jump','jury','just',
  'keen','keep','kill','kind','king','knew','knit','knob','know','lack',
  'laid','lake','lamp','land','lane','last','late','laud','lawn','lead',
  'lean','leap','left','lend','lens','less','life','lift','like','lime',
  // 5-letter
  'about','above','abuse','acorn','acute','admit','adopt','adult','after',
  'again','agate','agile','agree','ahead','aisle','alarm','album','alert',
  'alike','alive','alley','allow','alone','along','aloud','alter','angel',
  'anger','angle','ankle','annex','antic','anvil','apart','apple','apply',
  'aptly','argue','arise','armor','aroma','arose','arson','asset','attic',
  'audit','aunty','avail','avoid','award','aware','awful','badly','baker',
  'basic','basis','beach','beady','began','begin','being','below','bench',
  'berry','bible','birth','black','blade','blame','bland','blank','blast',
  'blaze','bleed','blend','bless','blink','block','blood','bloom','blown',
  'board','boost','booth','bound','brain','brand','brave','bread','break',
  'breed','brick','bride','brief','bring','broad','broke','brook','brown',
  'brush','budge','build','built','burst','buyer','cabin','candy','cargo',
  'carry','cause','cedar','chain','chair','chalk','charm','chart','chase',
  'cheap','check','cheek','cheer','chess','chest','chief','child','china',
  'choir','choke','chord','chose','chunk','civic','civil','claim','clash',
  'class','clean','clear','clerk','click','cliff','climb','cling','clock',
  'close','cloud','clown','coach','coast','cobra','color','comma','coral',
  'could','count','court','cover','craft','cramp','crane','crash','crazy',
  'cream','creek','crisp','cross','crowd','crown','cruel','crush','crux',
  'curve','cycle','daily','dance','dealt','debut','decay','delay','depth',
  'derby','digit','dirty','disco','disco','ditch','diver','dizzy','dodge',
  'doing','doubt','dough','draft','drain','drake','drama','drank','drape',
  'dream','dress','drift','drill','drink','drive','drove','drown','dwarf',
  'eager','eagle','early','earth','eight','elite','empty','enemy','enjoy',
  'enter','entry','equal','error','essay','event','every','exact','exist',
  'extra','fable','faint','fairy','faith','false','fancy','fatal','fault',
  'feast','fence','fetch','fever','fiber','field','fifth','fifty','fight',
  'final','first','fixed','flame','flash','fleet','flesh','float','flood',
  'floor','flour','flown','flute','fly','focus','force','forge','forth',
  'found','frame','frank','fraud','fresh','front','frost','froze','fruit',
  'fully','funny','genre','ghost','giant','given','glass','gleam','globe',
  'gloom','glory','gloss','glove','going','grace','grade','grain','grand',
  'grant','grasp','grass','great','green','greet','grief','grime','groan',
  'grope','gross','group','grove','gruel','guard','guess','guest','guide',
  'guild','guise','gusto','habit','happy','harsh','haste','haunt','haven',
  'heard','heart','heavy','hedge','hence','hinge','hippo','honey','honor',
  'horse','hotel','house','human','humor','hurry','hyper','icing','ideal',
  'image','imply','inbox','index','indie','inner','input','inter','intro',
  // 6-letter
  'absent','accept','access','action','active','actual','animal','answer',
  'appeal','appear','attach','attack','attend','autumn','battle','beauty',
  'before','behind','belong','border','bottle','bottom','bridge','bright',
  'broken','budget','butter','button','camera','cancel','canvas','carbon',
  'castle','cellar','center','change','charge','choice','choose','circle',
  'client','coffee','coming','common','cookie','corner','cotton','course',
  'cousin','create','crisis','custom','damage','danger','debate','decide',
  'defend','define','degree','desert','design','detail','differ','dinner',
  'direct','divide','doctor','dollar','double','dragon','easily','effect',
  'effort','empire','enable','engage','engine','enough','ensure','entire',
  'escape','expect','expert','fabric','family','father','finger','flight',
  'forest','forget','formal','foster','friend','frozen','future','garden',
  'gentle','global','golden','ground','growth','happen','health','hidden',
  'highly','honest','hunger','impact','import','income','indeed','injury',
  'insect','inside','invent','island','itself','jacket','junior','jungle',
  'kernel','killer','knight','launch','leader','lively','lonely','longer',
  'magnet','manage','manner','marble','market','matter','member','mental',
  'method','mirror','modern','moment','monkey','mostly','mother','muscle',
  'mutual','narrow','native','nature','nearby','nearly','needle','notice',
  'number','object','obtain','office','online','opened','orange','outlet',
  'output','outside','palace','parent','partly','patrol','pencil','person',
  'phrase','planet','plastic','please','pocket','police','polish','portal',
  'potato','praise','prefer','pretty','prince','prison','proper','public',
  'purple','puzzle','rabbit','random','rather','reason','recent','record',
  'reduce','reform','relate','remain','remind','repeat','rescue','result',
  'return','reveal','review','reward','rising','rocket','rubber','ruling',
  'safely','sample','school','screen','search','season','second','secret',
  'select','series','settle','simple','single','sister','skills','smooth',
  'socket','source','stable','street','strong','studio','submit','sudden',
  'supply','system','talent','target','thanks','theory','timber','timing',
  'toggle','travel','tunnel','though','toward','unable','unique','update',
  'useful','valley','velvet','vendor','versus','victim','vision','visual',
  'wallet','wealth','weapon','weekly','window','winter','wisdom','wonder',
  'yellow','zombie',
].filter((w, i, arr) => arr.indexOf(w) === i); // deduplicate

// ── Constants ──────────────────────────────────────────────────────────────

const DURATION = 60;
const POINTS_PER_WORD = 10;

// ── Helpers ────────────────────────────────────────────────────────────────

function scramble(word: string): string {
  const letters = word.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  // Ensure it's actually different from the original (retry once if not)
  const result = letters.join('');
  if (result === word && word.length > 1) return scramble(word);
  return result;
}

function pickWord(used: Set<string>): string {
  const available = WORDS.filter((w) => !used.has(w));
  if (available.length === 0) return WORDS[Math.floor(Math.random() * WORDS.length)];
  return available[Math.floor(Math.random() * available.length)];
}

// ── Types ──────────────────────────────────────────────────────────────────

type GamePhase = 'menu' | 'playing' | 'gameover';

interface LetterTile {
  id: number;    // unique id within current word
  letter: string;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function WordScrambleGame() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [score, setScore] = useState(0);
  const [personalBest, setPersonalBest] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [scrambledTiles, setScrambledTiles] = useState<LetterTile[]>([]);
  const [answerTiles, setAnswerTiles] = useState<LetterTile[]>([]);
  const [shakeAnswer, setShakeAnswer] = useState(false);
  const [flashSuccess, setFlashSuccess] = useState(false);

  const trackerRef = useRef(new ScoreTracker('word-scramble'));
  const timerRef = useRef<GameTimer | null>(null);
  const soundRef = useRef(new SoundManager());
  const usedWordsRef = useRef<Set<string>>(new Set());
  const phaseRef = useRef<GamePhase>('menu');

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    setPersonalBest(trackerRef.current.personalBest);
  }, []);

  useEffect(() => () => timerRef.current?.pause(), []);

  function setupWord(word: string) {
    const scrambledStr = scramble(word);
    const tiles: LetterTile[] = scrambledStr.split('').map((letter, i) => ({ id: i, letter }));
    setCurrentWord(word);
    setScrambledWord(scrambledStr);
    setScrambledTiles(tiles);
    setAnswerTiles([]);
  }

  const startGame = useCallback(() => {
    timerRef.current?.pause();
    trackerRef.current.reset();
    usedWordsRef.current = new Set();
    soundRef.current.unlock();

    setScore(0);
    setIsNewBest(false);
    setTimeLeft(DURATION);
    setShakeAnswer(false);
    setFlashSuccess(false);

    const word = pickWord(usedWordsRef.current);
    usedWordsRef.current.add(word);
    setupWord(word);

    const timer = new GameTimer(DURATION);
    timerRef.current = timer;
    timer.onTick = (remaining) => setTimeLeft(Math.ceil(remaining));
    timer.onComplete = () => {
      const newBest = trackerRef.current.save();
      setIsNewBest(newBest);
      setPersonalBest(trackerRef.current.personalBest);
      setPhase('gameover');
      phaseRef.current = 'gameover';
    };

    setPhase('playing');
    phaseRef.current = 'playing';
    timer.start();
  }, []);

  // Move a tile from scrambled → answer
  const tapScrambled = useCallback((tile: LetterTile) => {
    if (phaseRef.current !== 'playing') return;
    soundRef.current.unlock();
    vibrate('tap');
    soundRef.current.play('tap');

    setScrambledTiles((prev) => prev.filter((t) => t.id !== tile.id));
    setAnswerTiles((prev) => {
      const next = [...prev, tile];

      // Auto-check when all letters are placed
      if (next.length === currentWord.length) {
        const guess = next.map((t) => t.letter).join('');
        if (guess === currentWord) {
          // Correct!
          vibrate('tap');
          soundRef.current.play('tap');
          const newScore = trackerRef.current.add(POINTS_PER_WORD);
          setScore(newScore);
          setFlashSuccess(true);
          setTimeout(() => {
            setFlashSuccess(false);
            const nextWord = pickWord(usedWordsRef.current);
            usedWordsRef.current.add(nextWord);
            setupWord(nextWord);
          }, 400);
        } else {
          // Wrong — shake and reset
          vibrate('error');
          soundRef.current.play('error');
          setShakeAnswer(true);
          setTimeout(() => {
            setShakeAnswer(false);
            // Return all tiles to scrambled (re-scramble)
            setCurrentWord((w) => {
              setupWord(w);
              return w;
            });
          }, 500);
        }
      }

      return next;
    });
  }, [currentWord]);

  // Move a tile from answer → back to scrambled
  const tapAnswer = useCallback((tile: LetterTile) => {
    if (phaseRef.current !== 'playing') return;
    setAnswerTiles((prev) => prev.filter((t) => t.id !== tile.id));
    setScrambledTiles((prev) => [...prev, tile]);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  const timerPct = (timeLeft / DURATION) * 100;
  const timerColor = timeLeft > 20 ? '#22C55E' : timeLeft > 10 ? '#EAB308' : '#EF4444';

  if (phase === 'menu') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-4xl font-bold tracking-tight">Word Scramble</h1>
              <p className="text-center text-zinc-400">
                Unscramble as many words as you can in 60 seconds.
              </p>
            </div>

            {personalBest > 0 && (
              <p className="text-zinc-500">
                Personal best: <span className="font-bold text-white">{personalBest}</span>
              </p>
            )}

            <button
              onClick={startGame}
              className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
            >
              Play
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <p className="text-zinc-400">Time&apos;s up!</p>
              <p className="text-6xl font-bold">{score}</p>
              {isNewBest ? (
                <p className="font-semibold text-yellow-400">New personal best!</p>
              ) : (
                <p className="text-zinc-500">
                  Best: <span className="text-white">{personalBest}</span>
                </p>
              )}
            </div>

            <AdUnit slot="1000000006" format="rectangle" />

            <button
              onClick={startGame}
              className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
            >
              Play again
            </button>

            <OtherGames currentHref="/games/word-scramble" />
          </div>
        </div>
      </div>
    );
  }

  // Playing
  return (
    <div className="flex h-svh flex-col bg-zinc-950 px-4 py-6 text-white overflow-y-auto">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-5 justify-between">
        <div className="flex flex-col gap-5">
          {/* Home link */}
          <HomeLink />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold tabular-nums">{score}</div>
            <div className="text-3xl font-bold tabular-nums" style={{ color: timerColor }}>
              {timeLeft}
            </div>
          </div>

          {/* Timer bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
            />
          </div>

          {/* Scrambled word display */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs uppercase tracking-widest text-zinc-500">Unscramble this word</p>
            <div className="flex gap-2">
              {scrambledWord.split('').map((letter, i) => (
                <span
                  key={i}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-2xl font-bold uppercase text-zinc-200"
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>

          {/* Answer area */}
          <div
            className="flex min-h-[4rem] flex-wrap items-center justify-center gap-2 rounded-2xl border-2 px-3 py-3 transition-all"
            style={{
              borderColor: flashSuccess ? '#22C55E' : shakeAnswer ? '#EF4444' : '#3f3f46',
              backgroundColor: flashSuccess ? '#14532d22' : shakeAnswer ? '#7f1d1d22' : 'transparent',
              transform: shakeAnswer ? 'translateX(-4px)' : 'none',
            }}
          >
            {answerTiles.length === 0 ? (
              <p className="text-sm text-zinc-600">Tap letters below to build the word</p>
            ) : (
              answerTiles.map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => tapAnswer(tile)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-700 text-xl font-bold uppercase text-white transition active:scale-90"
                >
                  {tile.letter}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5 pb-2">
          {/* Scrambled letters */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {scrambledTiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => tapScrambled(tile)}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold uppercase text-white transition active:scale-90 hover:bg-indigo-500"
              >
                {tile.letter}
              </button>
            ))}
          </div>

          {/* Skip */}
          <button
            onClick={() => {
              const nextWord = pickWord(usedWordsRef.current);
              usedWordsRef.current.add(nextWord);
              setupWord(nextWord);
            }}
            className="mx-auto text-sm text-zinc-600 underline-offset-2 hover:text-zinc-400"
          >
            Skip word
          </button>
        </div>
      </div>
    </div>
  );
}
