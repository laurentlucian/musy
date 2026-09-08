import { expect, test } from "bun:test";
import { parseGenres } from "../app/components/utils";

test("parses stored JSON genres without exposing array syntax", () => {
  expect(parseGenres('["soft pop","brazilian hip hop"]')).toEqual([
    "soft pop",
    "brazilian hip hop",
  ]);
  expect(parseGenres("[]")).toEqual([]);
  expect(parseGenres('["pop",null,""]')).toEqual(["pop"]);
});

test("supports legacy comma-separated genres and empty metadata", () => {
  expect(parseGenres(" pop, rock, ")).toEqual(["pop", "rock"]);
  expect(parseGenres("")).toEqual([]);
  expect(parseGenres("[broken")).toEqual([]);
});
