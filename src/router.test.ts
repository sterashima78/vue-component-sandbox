import { getNewPath } from "./router";

describe("router", () => {
  describe("getNewPath", () => {
    test.each([
      [[], [], ""],
      [["a", "b"], ["b", "a"], ""],
      [["a", "b", "c"], ["b", "a"], ""],
      [["a", "b"], ["b", "c", "a"], "c"],
      [["a", "b"], ["b", "b", "a"], ""],
      [["a", "b"], ["b", "c", "d", "a"], "c"]
    ])("before = %j, after = %j の時 %s が返る", (before, after, ans) => {
      expect(getNewPath(before, after)).toBe(ans);
    });
  });
});
