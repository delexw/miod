<p align="center">
  <img src="docs/miod.png" alt="miod logo: a honey-amber music note with code brackets" width="200">
</p>

# miod

I'm an engineer, but these days I solve the boring problems entirely by vibe coding. Somewhere along the way I felt I had lost the creativity and curiosity I used to have when writing code myself.

So I started thinking about how to make vibe coding fun again. miod is the first try: while the agent does the work, you get to hear it think, read, edit, fail and fix, with a little piece of music no one has heard before.

Feel free to add more moods and styles. Each mood is one row in `hooks/moods.ts`, and each sound style is one entry in `hooks/styles.ts`.

Feeling it's a bit too noisy? 🙉 No hard feelings. Just [turn it off](#usage) with `/miod off`.

## What miod is

Generative music for Claude Code. Every task gets its own tune, and the mood follows what the agent is doing and how fast it spends tokens.

miod is a Claude Code mod (MIDI + mod). It listens to the session while Claude works and plays short phrases of music it writes on the spot. No music files, no library, no AI model: the notes are worked out in code and turned into audio.

## What it does

- **A new tune for every task.** Each prompt picks its own key, scale, tempo, sound and theme, so no two tasks sound alike.
- **Mood follows the work.** Reading is airy, editing is bright, running commands has a steady beat, tests get a busy beat, and subagents add harmony voices.
- **Failures sound tense.** A failed command turns the music minor and uneasy until a command passes again, then a short bright "fixed" phrase plays.
- **Energy follows token use.** The faster tokens are spent, the busier the music. A filling context window lifts the melody and adds a low drone.
- **An ending.** When the task finishes, a short rising chord plays. If you stop the task, it just goes quiet.
- **Status line.** While it plays, the status line shows the tune and mood, like `♪ D dorian, 104 bpm, bright, energy 60%`.

## Installation

Requirements: Claude Code 2.1.290 or newer (miod is a mod, so older builds load nothing) and macOS, since the audio plays through `afplay`.

```bash
claude plugin marketplace add delexw/miod
claude plugin install miod@miod
```

Or from inside a session:

```
/plugin install miod --marketplace delexw/miod
```

Then start a new session.

## Usage

```
/miod        say whether miod is on or off
/miod off    stop the music and keep tasks silent
/miod on     play music again from the next task
```

## How the music is decided

The music is made in three layers. Each layer lives in its own file.

### 1. The task picks the tune — `hooks/task.ts`

When you send a prompt, the prompt text and the time become a number. That number picks, once per task:

- a key (the root note)
- a home scale: major, minor, dorian, mixolydian, or a pentatonic
- a tempo between 84 and 131 bpm
- a sound style from `hooks/styles.ts`: sine, triangle or soft square
- an 8-note theme the melody keeps coming back to

So every task sounds different, even with the same prompt.

### 2. What the agent is doing picks the mood — `hooks/activity.ts` and `hooks/moods.ts`

Each tool call is sorted into an activity:

| The agent is… | Because it used… | The music feels… |
| --- | --- | --- |
| thinking | no tool | calm: slow notes and a soft pad |
| reading | Read, Grep, Glob, MCP tools | airy: slow, higher, soft pad |
| exploring | WebSearch, WebFetch | curious: lydian scale, floating and higher |
| planning | TodoWrite, plan mode | hopeful: major pentatonic, slow, warm pad |
| asking | AskUserQuestion | waiting: lydian, almost silent, held pad |
| editing | Edit, Write | bright: major scale, light beat |
| running | Bash | driving: steady beat |
| installing | Bash with npm, yarn, pnpm, bun, pip, brew, gem or bundle install | patient: minor pentatonic, sparse, steady beat |
| testing | Bash with test, check, lint or tsc in the command | focused: dorian scale, busy beat |
| shipping | Bash with git commit, push, merge or tag, or gh pr create or merge | triumphant: mixolydian, fast, higher, busy beat |
| deleting | Bash with rm -r, git reset --hard, git clean or drop table | ominous: phrygian, low, slow, uneasy drone |
| delegating | Agent | layered: one harmony voice per running subagent |
| failing | a Bash command that failed | tense: minor scale, lower, uneasy drone |

The scales follow how musicians usually describe each mode. Lydian floats and sounds full of wonder, which is why film scores use it for discovery. Mixolydian is major with an edge, the sound of anthems. Phrygian is the darkest, for tension and foreboding. Dorian is serious but hopeful. Pentatonic scales come across as warm and calm. Sources: the [musical-u guide to modes](https://www.musical-u.com/learn/the-many-moods-of-musical-modes/) and [Jiang et al. 2024](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1414014/full) on pentatonic warmth.

The music is played in short phrases of 8 beats. If several activities happen in one phrase, the strongest wins, in this order: failing, shipping, deleting, testing, editing, installing, running, delegating, planning, exploring, asking, reading, thinking. The order lives in `STRONGEST_FIRST` in `hooks/activity.ts`, and a test fails if a mood is missing from it.

Failing stays on until a command passes again. Then a quick bright "fixed" phrase plays.

To change how a mood sounds, edit its row in `MOODS` in `hooks/moods.ts`. To add a mood, add its name to `Activity` and `STRONGEST_FIRST` in `hooks/activity.ts`, decide which tools or commands lead to it there, then give it a row in `MOODS`:

- `scale`: `home` keeps the task's own scale, or name another one
- `notesPerBeat`: 1, 2 or 4
- `fill`: how often the gaps between beats get a note, from 0 to 1
- `octave`: shift the melody up or down
- `drums`: none, light, steady or busy
- `pad`: a soft held chord underneath
- `clash`: the uneasy low drone

### 3. Token use and context set the energy — `hooks/compose.ts`

- **Token rate:** tokens spent in the last minute become an energy level from 0 to 1. More energy fills more gaps with notes. Above 66% the notes per beat double, and above 50% the bass walks between two notes.
- **Tool calls:** each one adds two hi-hat clicks.
- **Context window:** past 60% full the melody moves up an octave. Past 80% the uneasy drone joins in.

When the task ends, a short rising chord plays. If you stop the task, it just goes quiet.

### Making the sound — `hooks/styles.ts` and `hooks/synth.ts`

No music library is used. Each note is drawn as a sound wave in code, mixed together, and saved as a WAV that Claude Code plays through the Mac's `afplay`.

A sound style is the shape of the wave the melody uses. Each one is a row in `STYLES` in `hooks/styles.ts`: a function that takes how far through its cycles a note is and gives back a value between -1 and 1. To add a style, add a row. Every task can then pick it, and a test checks it stays between -1 and 1. The bass and pad always use the sine style.

## Files

| File | What it decides |
| --- | --- |
| `hooks/register.ts` | listens to Claude Code and plays each phrase |
| `hooks/task.ts` | the tune for each task |
| `hooks/activity.ts` | which activity a tool call counts as |
| `hooks/moods.ts` | how each activity sounds |
| `hooks/styles.ts` | the sound styles a task can pick |
| `hooks/compose.ts` | turns tune, mood and energy into notes |
| `hooks/theory.ts` | scales and note pitches |
| `hooks/synth.ts` | turns notes into WAV audio |
| `hooks/random.ts` | repeatable random choices |

## Develop

```sh
claude plugin validate .
claude plugin test .
```

To run a checkout without installing it, start Claude Code with `claude --plugin-dir <path to this repo>`.

## Limitations

- Sound plays on macOS only. On Linux and Windows the mod runs but plays nothing.
- The sound is simple synthesized tones, chiptune style. There are no real instrument samples.
- miod hears only the session it is loaded in, not other Claude Code windows.
- A failed command is any Bash call that reports an error. A failure in another tool, like an Edit that does not match, does not change the mood.
