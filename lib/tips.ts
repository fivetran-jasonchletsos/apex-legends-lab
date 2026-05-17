// Movement tech, secrets, and hidden mechanics.
// Every tip has a "why it works" so the brain learns the pattern, not just the keys.

export type Tip = {
  id: string;
  title: string;
  category:
    | "movement"
    | "aim"
    | "audio"
    | "gunplay"
    | "team"
    | "endgame"
    | "secret"
    | "settings";
  difficulty: 1 | 2 | 3 | 4 | 5;
  console: "PC" | "Console" | "Both";
  text: string;
  why: string;
  drill?: string; // how to practice
};

export const TIPS: Tip[] = [
  {
    id: "tap-strafe",
    title: "Tap Strafe",
    category: "movement",
    difficulty: 4,
    console: "PC",
    text:
      "Bind scroll wheel to forward. Mid-air, scroll while pressing A or D — your character snaps 90° instantly.",
    why:
      "Scroll up sends multiple 'forward' inputs per frame, letting velocity stack at new angles without losing speed.",
    drill: "Octane pad → tap-strafe 90° onto a roof in Firing Range. Repeat 50x.",
  },
  {
    id: "super-glide",
    title: "Super Glide",
    category: "movement",
    difficulty: 5,
    console: "Both",
    text:
      "Climb a wall, and the exact frame your character mantles, press jump THEN crouch.",
    why:
      "The frame perfect jump+crouch preserves the climb velocity and converts it into a super-fast slide.",
    drill: "https://apexlegendsstatus.com/superglide — calibrates frame timing for your monitor.",
  },
  {
    id: "wall-bounce",
    title: "Wall Bounce",
    category: "movement",
    difficulty: 3,
    console: "Both",
    text:
      "Sprint at a wall, jump into it, and IMMEDIATELY strafe direction (A or D) the moment you touch.",
    why:
      "Contact with the wall converts your forward momentum into lateral, throwing off aim assist and tracking.",
    drill: "Wall-bounce off a building corner 20x. Add a shot at the end of each.",
  },
  {
    id: "slide-jump",
    title: "Slide Jump",
    category: "movement",
    difficulty: 1,
    console: "Both",
    text: "Sprint → crouch on a downhill → jump at the end of the slide.",
    why: "The slide preserves momentum, and jumping ends the slide with a velocity boost — fastest way to cross open ground.",
    drill: "Cross Skull Town's main gap in one slide-jump.",
  },
  {
    id: "punch-boost",
    title: "Punch Boost",
    category: "movement",
    difficulty: 2,
    console: "Both",
    text: "Mid-air, punch in the direction you're moving — your velocity briefly spikes forward.",
    why: "The melee animation grants a small horizontal velocity vector that compounds with your existing momentum.",
    drill: "Octane pad → punch at apex of jump → measure how much farther you land.",
  },
  {
    id: "lurch",
    title: "Lurch",
    category: "movement",
    difficulty: 3,
    console: "PC",
    text: "Mid-air, change strafe key (A → D or vice versa) — your character snaps direction once per air-time.",
    why: "Each strafe change grants 1 mid-air direction correction. Stack with tap-strafe for absurd movement.",
    drill: "Jump in firing range → A → lurch to D → land. Repeat 30x.",
  },
  {
    id: "neo-strafe",
    title: "Neo Strafe",
    category: "movement",
    difficulty: 5,
    console: "PC",
    text: "Tap-strafe to rapidly oscillate left-right mid-air, creating a 'phasing' effect that breaks aim assist.",
    why: "Stacks tap-strafe lurches in opposite directions on alternating frames — the camera can't track it.",
    drill: "Apex training mod → neo strafe lane. Hard, but god-tier when mastered.",
  },
  {
    id: "ads-strafe",
    title: "ADS Strafe Cancel",
    category: "gunplay",
    difficulty: 2,
    console: "Both",
    text:
      "While shooting, briefly UN-ADS then re-ADS during strafes. Resets your strafe speed each cycle.",
    why:
      "ADS slows strafe speed. Quick un-ADS resets to full speed mid-fight — much harder to hit you.",
    drill: "Strafe-shoot dummies in Firing Range with un-ADS pulses. Notice the speed difference.",
  },
  {
    id: "swap-shot",
    title: "Weapon Swap Shot",
    category: "gunplay",
    difficulty: 2,
    console: "Both",
    text: "Empty your primary mag → swap to secondary (Y / Triangle) — faster than reloading.",
    why: "Weapon swap is ~0.6s. Reload is 2-3s. Same DPS, half the downtime.",
    drill: "Set both guns to no-spare-ammo training and force swap-shot loops.",
  },
  {
    id: "crouch-strafe",
    title: "Crouch Spam",
    category: "gunplay",
    difficulty: 1,
    console: "Both",
    text: "In close-range gunfights, tap crouch repeatedly to bob your hitbox up and down.",
    why:
      "Crouch lowers head/shoulder hitboxes — the easiest targets — making aim assist drift onto your body, which mitigates damage.",
    drill: "Pubs only — feels cheesy but works. Pair with strafe direction changes.",
  },
  {
    id: "audio-cues",
    title: "Footstep Direction",
    category: "audio",
    difficulty: 1,
    console: "Both",
    text:
      "Apex stereo is precise — enemy footsteps tell you direction, floor (above/below), and roughly distance.",
    why:
      "Apex uses HRTF (head-related transfer function) audio. Wired headphones give 2-3x more positional info than speakers.",
    drill: "Settings → Audio → set output to 'Headphones' even with speakers. Vastly improved directional cues.",
  },
  {
    id: "reload-cancel",
    title: "Reload Cancel",
    category: "gunplay",
    difficulty: 2,
    console: "Both",
    text:
      "Start a reload, then mid-animation swap weapons — when you swap back the reload is COMPLETE.",
    why:
      "The reload completion is queued to the weapon, not the player. Swap-cancel gives you instant access to fire.",
    drill: "Empty R-99 → start reload → swap to pistol → swap back. Mag is full.",
  },
  {
    id: "evo-farm",
    title: "EVO Farm Order",
    category: "endgame",
    difficulty: 2,
    console: "Both",
    text:
      "Damage first → execute on knock. Don't kill outright until you've cracked their shield, because shield-damage feeds your EVO bar.",
    why:
      "EVO progress comes from damage dealt. Headshots = more damage = more EVO progress per fight.",
    drill: "Track your EVO bar after every fight — Red Evo by ring 3 is the goal.",
  },
  {
    id: "third-party",
    title: "Anti Third-Party",
    category: "team",
    difficulty: 2,
    console: "Both",
    text:
      "After every fight, hold position for 5 seconds. Listen. Heal. Don't loot until silent.",
    why:
      "60% of Apex deaths are post-fight 3rd parties. The team that healed first wins the next engagement.",
    drill: "Set a mental 5-count after every kill — never break it for loot.",
  },
  {
    id: "ring-prep",
    title: "Ring Prep",
    category: "endgame",
    difficulty: 3,
    console: "Both",
    text:
      "Move to the next zone 20+ seconds BEFORE the ring closes. Late rotations get caught and shot in the back.",
    why:
      "Ring damage stacks per ring. Late zone players have already lost 20-40 HP — easy kills for prepared teams.",
    drill: "Watch the ring timer. Set your own 'leave by' timer 20s early.",
  },
  {
    id: "battery-grenade",
    title: "Battery Mid-Grenade",
    category: "endgame",
    difficulty: 3,
    console: "Both",
    text:
      "If a grenade lands at your feet, throw a battery in the OPPOSITE direction and ride the recoil.",
    why:
      "Battery use animation grants brief invincibility frames against the explosion damage. Saves you from a knock.",
    drill: "Hard to drill — but knowing the trick saves you twice a week.",
  },
  {
    id: "knockdown-shield-trick",
    title: "Knockdown Shield Block",
    category: "team",
    difficulty: 2,
    console: "Both",
    text: "When knocked, equip your knockdown shield — it blocks all damage from the front (gold blocks more).",
    why:
      "Even white shields block 100 damage from one direction. Gold blocks 800. Buys time for rezzers.",
    drill: "Default keybind to 'use knockdown shield' — must press fast on knock.",
  },
  {
    id: "fire-range-fundamentals",
    title: "Firing Range Routine",
    category: "aim",
    difficulty: 1,
    console: "Both",
    text:
      "Pre-game: 60s strafe-shooting on dummies at 20m, 60s at 50m, 60s with your sidearm. Every match.",
    why: "Cold-game aim is the worst aim. 3 minutes of warm-up cuts your first-fight death rate in half.",
    drill: "Track headshot % on dummies. 30%+ is good. 50%+ is master tier.",
  },
  {
    id: "settings-fov",
    title: "FOV 104",
    category: "settings",
    difficulty: 1,
    console: "PC",
    text: "Set Field of View to 104 (max). Larger FOV = see more flanks and rotations.",
    why:
      "Apex's FOV slider is fair — 104 doesn't disadvantage hitbox. It just shows more of the world.",
  },
  {
    id: "settings-sensitivity",
    title: "Mouse cm/360",
    category: "settings",
    difficulty: 2,
    console: "PC",
    text:
      "Aim for 30-40 cm/360. Lower = more precise micro-aim. Higher = faster flicks but harder tracking.",
    why:
      "Most Apex pros sit in this band. Below 25cm/360 hurts tracking; above 50 hurts micro-aim.",
  },
  {
    id: "secret-ziprail-jump",
    title: "Ziprail Crouch Hop",
    category: "secret",
    difficulty: 3,
    console: "Both",
    text:
      "Riding a zipline, crouch and jump in rapid succession — you bounce off and re-attach faster, gaining speed.",
    why:
      "Zipline reattachment grants a momentum spike. Multiple jumps compound the speed.",
    drill: "Broken Moon ziprails (what's left of them) — practice on the long lines.",
  },
  {
    id: "secret-octane-pad-strafe",
    title: "Octane Pad Tap Strafe",
    category: "secret",
    difficulty: 5,
    console: "PC",
    text:
      "Hit the launch pad, scroll-forward at peak, then strafe-redirect mid-air. You can change direction 180° in one jump.",
    why:
      "Combines all three movement tricks: vertical velocity, scroll redirect, lurch. Pro-level only.",
    drill: "Pubs only. Don't ranked-test this — you will fall to your death.",
  },
  {
    id: "secret-door-block",
    title: "Door Block Revive",
    category: "secret",
    difficulty: 2,
    console: "Both",
    text:
      "Stand in a doorway WHILE reviving — your body blocks the door from being opened.",
    why:
      "Door physics treat any character body in the frame as blocking. Free protection during revive.",
    drill: "Practice in a private match with a friend pushing the door.",
  },
  {
    id: "secret-supply-bin-camera",
    title: "Supply Bin Peek",
    category: "secret",
    difficulty: 2,
    console: "Both",
    text:
      "Open a supply bin and stay in the menu — your character is stuck, but you can survey the surroundings safely.",
    why:
      "While in the bin UI you can still hear footsteps and gunfire — free safe-mode listening.",
    drill: "Use in early-game POIs to listen for nearby teams without committing.",
  },
];

export const TIP_CATEGORIES: { id: Tip["category"]; label: string; color: string }[] = [
  { id: "movement", label: "Movement", color: "plasma" },
  { id: "aim", label: "Aim", color: "blood" },
  { id: "gunplay", label: "Gunplay", color: "gold" },
  { id: "audio", label: "Audio", color: "nessie" },
  { id: "team", label: "Team", color: "violet" },
  { id: "endgame", label: "Endgame", color: "blood" },
  { id: "secret", label: "Secrets", color: "gold" },
  { id: "settings", label: "Settings", color: "muted" },
];
