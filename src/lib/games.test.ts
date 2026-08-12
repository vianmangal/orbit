import assert from "node:assert/strict";
import test from "node:test";
import { games, gameSlugs } from "./games.ts";

test("catalog includes all ten unique daily games", () => {
  assert.equal(games.length, 10);
  assert.equal(gameSlugs.size, games.length);
});

test("catalog includes Travle and Worldle at their official URLs", () => {
  assert.equal(
    games.find((game) => game.slug === "travle")?.url,
    "https://travle.earth/",
  );
  assert.equal(
    games.find((game) => game.slug === "worldle")?.url,
    "https://worldle.teuteuf.fr/",
  );
});
