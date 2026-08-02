export type GameCategory = "Geography" | "Words & logic" | "Visual";

export type Game = {
  slug: string;
  name: string;
  description: string;
  category: GameCategory;
  url: string;
  minutes: number;
  accent: string;
  icon: "flag" | "angle" | "globe" | "capital" | "word" | "tiles" | "connections" | "strands";
};

export const games: Game[] = [
  {
    slug: "flagle",
    name: "Flagle",
    description: "Reveal a flag and follow distance clues.",
    category: "Geography",
    url: "https://www.flagle.io/",
    minutes: 4,
    accent: "#df6f45",
    icon: "flag",
  },
  {
    slug: "angle",
    name: "Angle",
    description: "Estimate today’s angle by sight.",
    category: "Visual",
    url: "https://angle.wtf/",
    minutes: 2,
    accent: "#df5f8a",
    icon: "angle",
  },
  {
    slug: "globle",
    name: "Globle",
    description: "Find the mystery country by proximity.",
    category: "Geography",
    url: "https://globle-game.com/",
    minutes: 5,
    accent: "#438d70",
    icon: "globe",
  },
  {
    slug: "globle-capitals",
    name: "Globle: Capitals",
    description: "Navigate the globe to a mystery capital.",
    category: "Geography",
    url: "https://globle-capitals.com/game",
    minutes: 5,
    accent: "#417a9e",
    icon: "capital",
  },
  {
    slug: "wordle",
    name: "Wordle",
    description: "Solve the five-letter word in six tries.",
    category: "Words & logic",
    url: "https://www.nytimes.com/games/wordle/index.html",
    minutes: 4,
    accent: "#c88434",
    icon: "word",
  },
  {
    slug: "tiles",
    name: "Tiles",
    description: "Match layered patterns into a long chain.",
    category: "Visual",
    url: "https://www.nytimes.com/puzzles/tiles",
    minutes: 4,
    accent: "#7966a9",
    icon: "tiles",
  },
  {
    slug: "connections",
    name: "Connections",
    description: "Group sixteen words by hidden links.",
    category: "Words & logic",
    url: "https://www.nytimes.com/games/connections",
    minutes: 5,
    accent: "#8f71ad",
    icon: "connections",
  },
  {
    slug: "strands",
    name: "Strands",
    description: "Uncover themed words in a letter grid.",
    category: "Words & logic",
    url: "https://www.nytimes.com/games/strands",
    minutes: 5,
    accent: "#2e8b91",
    icon: "strands",
  },
];

export const gameSlugs = new Set(games.map((game) => game.slug));
