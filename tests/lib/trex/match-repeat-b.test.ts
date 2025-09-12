import {
  MatchRepeat,
  MatchOpt,
  MatchCodePoint,
  NumberOfMatches,
  AltFirstLastMatchers,
  MatchAll,
  MatchEndSlice,
  MatchCodePointCategories,
  MutMatchNav
} from "@/trex";

describe("MatchRepeat: Opt Repeat with Opt AltFirst", () => {
  const repeatMatcher = MatchRepeat.from(
    MatchOpt.from(MatchCodePoint.fromString("B")),
    NumberOfMatches.between(2, 3),
    AltFirstLastMatchers.fromAltFirst(MatchOpt.from(MatchCodePoint.fromString("A")))
  );
  test.each([
    ["BB", "BB"],
    ["AB", "AB"],
    ["BBB", "BBB"],
    ["ABB", "ABB"],
    ["BBBA", "BBB"],
    ["BBBC", "BBB"]
  ])("matches '%s' -> '%s'", (input, expected) => {
    const nav = MutMatchNav.fromString(input);
    const result = repeatMatcher.match(nav);
    expect(result?.captureMatch.value).toBe(expected);
  });
  test.each([
    "A",
    "B",
    "BA",
    "AA",
    "AAB"
  ])("does not match '%s'", (input) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
  test.each([
    ["BBBB", "over match"],
    ["ABBB", "over match"]
  ])("over matches '%s'", (input, _msg) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
});

describe("MatchRepeat: Opt Repeat with Opt AltLast", () => {
  const repeatMatcher = MatchRepeat.from(
    MatchOpt.from(MatchCodePoint.fromString("B")),
    NumberOfMatches.between(2, 3),
    AltFirstLastMatchers.fromAltLast(MatchOpt.from(MatchCodePoint.fromString("C")))
  );
  test.each([
    ["BB", "BB"],
    ["BC", "BC"],
    ["BBB", "BBB"],
    ["BBC", "BBC"],
    ["BBA", "BB"],
    ["BBBA", "BBB"],
    ["BCA", "BC"],
    ["BBCA", "BBC"]
  ])("matches '%s' -> '%s'", (input, expected) => {
    const nav = MutMatchNav.fromString(input);
    const result = repeatMatcher.match(nav);
    expect(result?.captureMatch.value).toBe(expected);
  });
  test.each([
    "B",
    "C",
    "CB",
    "CBB"
  ])("does not match '%s'", (input) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
  test.each([
    ["BBBB", "over match"],
    ["BBBC", "over match"]
  ])("over matches '%s'", (input, _msg) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
});

describe("MatchRepeat: Opt Repeat with Opt AltFirst and Opt AltLast", () => {
  const repeatMatcher = MatchRepeat.from(
    MatchOpt.from(MatchCodePoint.fromString("B")),
    NumberOfMatches.between(2, 3),
    AltFirstLastMatchers.fromBoth(
      MatchOpt.from(MatchCodePoint.fromString("A")),
      MatchOpt.from(MatchCodePoint.fromString("C"))
    )
  );
  test.each([
    ["BB", "BB"],
    ["AB", "AB"],
    ["BC", "BC"],
    ["AC", "AC"],
    ["ABB", "ABB"],
    ["ABC", "ABC"],
    ["BBB", "BBB"],
    ["BBC", "BBC"],
    ["ABA", "AB"],
    ["ACC", "AC"],
    ["BCC", "BC"],
    ["BBA", "BB"],
    ["ABBA", "ABB"],
    ["ABCA", "ABC"],
    ["BBBA", "BBB"]
  ])("matches '%s' -> '%s'", (input, expected) => {
    const nav = MutMatchNav.fromString(input);
    const result = repeatMatcher.match(nav);
    expect(result?.captureMatch.value).toBe(expected);
  });
  test.each([
    "A",
    "B",
    "BA",
    "AA",
    "AAB"
  ])("does not match '%s'", (input) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
  test.each([
    ["BBBC", "over match"],
    ["BBBB", "over match"],
    ["ABBB", "over match"],
    ["ABBC", "over match"]
  ])("over matches '%s'", (input, _msg) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
});

describe("MatchRepeat: Full String Opt Repeat with Opt AltFirst and Opt AltLast", () => {
  const repeatMatcher = MatchAll.fromMatchers(
    MatchRepeat.from(
      MatchOpt.from(MatchCodePoint.fromString("B")),
      NumberOfMatches.between(2, 3),
      AltFirstLastMatchers.fromBoth(
        MatchOpt.from(MatchCodePoint.fromString("A")),
        MatchOpt.from(MatchCodePoint.fromString("C"))
      )
    ),
    MatchEndSlice.default
  );
  test.each([
    ["BB", "BB"],
    ["AB", "AB"],
    ["BC", "BC"],
    ["AC", "AC"],
    ["ABB", "ABB"],
    ["ABC", "ABC"],
    ["BBB", "BBB"],
    ["BBC", "BBC"]
  ])("matches '%s' -> '%s'", (input, expected) => {
    const nav = MutMatchNav.fromString(input);
    const result = repeatMatcher.match(nav);
    expect(result?.captureMatch.value).toBe(expected);
  });
  test.each([
    "A",
    "B",
    "BA",
    "AA",
    "AAB"
  ])("does not match '%s'", (input) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
  test.each([
    ["ABA", "not full match"],
    ["ACC", "not full match"],
    ["BCC", "not full match"],
    ["BBA", "not full match"],
    ["ABBA", "not full match"],
    ["ABCA", "not full match"],
    ["BBBA", "not full match"],
    ["BBCA", "not full match"]
  ])("not full match '%s'", (input, _msg) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
  test.each([
    ["BBBC", "over match"],
    ["BBBB", "over match"],
    ["ABBB", "over match"],
    ["ABBC", "over match"]
  ])("over matches '%s'", (input, _msg) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
});

describe("MatchRepeat: Full String Opt Repeat Req AltLast", () => {
  const repeatMatcher = MatchAll.fromMatchers(
    MatchRepeat.from(
      MatchOpt.from(MatchCodePoint.fromString("B")),
      NumberOfMatches.between(2, 3),
      AltFirstLastMatchers.fromAltLast(MatchCodePoint.fromString("C"))
    ),
    MatchEndSlice.default
  );
  test.each([
    ["BC", "BC"],
    ["BBC", "BBC"]
  ])("matches '%s' -> '%s'", (input, expected) => {
    const nav = MutMatchNav.fromString(input);
    const result = repeatMatcher.match(nav);
    expect(result?.captureMatch.value).toBe(expected);
  });
  test.each([
    "B",
    "C"
  ])("does not match '%s'", (input) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
  test.each([
    ["BB", "no end match"],
    ["BBB", "no end match"]
  ])("no end match '%s'", (input, _msg) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
  test.each([
    ["BCA", "not full match"],
    ["BBCA", "not full match"]
  ])("not full match '%s'", (input, _msg) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
  test.each([
    ["BBBC", "over match"],
    ["BBBC", "over match"]
  ])("over matches '%s'", (input, _msg) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
});

describe("MatchRepeat: Full String Opt Repeat Req AltFirst", () => {
  const repeatMatcher = MatchAll.fromMatchers(
    MatchRepeat.from(
      MatchOpt.from(MatchCodePoint.fromString("B")),
      NumberOfMatches.between(2, 3),
      AltFirstLastMatchers.fromAltFirst(MatchCodePoint.fromString("A"))
    ),
    MatchEndSlice.default
  );
  test.each([
    ["AB", "AB"],
    ["ABB", "ABB"]
  ])("matches '%s' -> '%s'", (input, expected) => {
    const nav = MutMatchNav.fromString(input);
    const result = repeatMatcher.match(nav);
    expect(result?.captureMatch.value).toBe(expected);
  });
  test.each([
    "A",
    "B"
  ])("does not match '%s'", (input) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
  test.each([
    ["BB", "no first match"],
    ["BBB", "no first match"]
  ])("no first match '%s'", (input, _msg) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
  test.each([
    ["ABC", "not full match"],
    ["ABBC", "not full match"]
  ])("not full match '%s'", (input, _msg) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
  test.each([
    ["ABBB", "over match"]
  ])("over matches '%s'", (input, _msg) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
});

describe("MatchRepeat: Full String Opt Repeat Req AltFirst Opt AltLast", () => {
  const repeatMatcher = MatchAll.fromMatchers(
    MatchRepeat.from(
      MatchOpt.from(MatchCodePoint.fromString("B")),
      NumberOfMatches.between(2, 3),
      AltFirstLastMatchers.fromBoth(
        MatchCodePoint.fromString("A"),
        MatchOpt.from(MatchCodePoint.fromString("C"))
      )
    ),
    MatchEndSlice.default
  );
  test.each([
    ["AB", "AB"],
    ["AC", "AC"],
    ["ABB", "ABB"],
    ["ABC", "ABC"]
  ])("matches '%s' -> '%s'", (input, expected) => {
    const nav = MutMatchNav.fromString(input);
    const result = repeatMatcher.match(nav);
    expect(result?.captureMatch.value).toBe(expected);
  });
  test.each([
    "AA",
    "BA",
    "AAB",
    "AAC",
    "BBB"
  ])("does not match '%s'", (input) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
  test.each([
    ["ABBB", "over match"],
    ["ABBC", "over match"]
  ])("over matches '%s'", (input, _msg) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
});

describe("MatchRepeat: Full String Opt Repeat Opt AltFirst Req AltLast", () => {
  const repeatMatcher = MatchAll.fromMatchers(
    MatchRepeat.from(
      MatchOpt.from(MatchCodePoint.fromString("B")),
      NumberOfMatches.between(2, 3),
      AltFirstLastMatchers.fromBoth(
        MatchOpt.from(MatchCodePoint.fromString("A")),
        MatchCodePoint.fromString("C")
      )
    ),
    MatchEndSlice.default
  );
  test.each([
    ["BC", "BC"],
    ["AC", "AC"],
    ["ABC", "ABC"],
    ["BBC", "BBC"]
  ])("matches '%s' -> '%s'", (input, expected) => {
    const nav = MutMatchNav.fromString(input);
    const result = repeatMatcher.match(nav);
    expect(result?.captureMatch.value).toBe(expected);
  });
  test.each([
    "AB",
    "BB",
    "ABB",
    "BBB"
  ])("does not match '%s'", (input) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
  test.each([
    ["BCA", "not full match"],
    ["ACA", "not full match"],
    ["ABCA", "not full match"],
    ["BBCA", "not full match"]
  ])("not full match '%s'", (input, _msg) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
  test.each([
    ["BBBC", "over match"],
    ["ABBC", "over match"]
  ])("over matches '%s'", (input, _msg) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
});

describe("MatchRepeat: Full String Req Repeat Req AltFirst Req AltLast", () => {
  const repeatMatcher = MatchAll.fromMatchers(
    MatchRepeat.from(
      MatchCodePoint.fromString("B"),
      NumberOfMatches.between(3, 4),
      AltFirstLastMatchers.fromBoth(
        MatchCodePoint.fromString("A"),
        MatchCodePoint.fromString("C")
      )
    ),
    MatchEndSlice.default
  );
  test.each([
    ["ABC", "ABC"],
    ["ABBC", "ABBC"]
  ])("matches '%s' -> '%s'", (input, expected) => {
    const nav = MutMatchNav.fromString(input);
    const result = repeatMatcher.match(nav);
    expect(result?.captureMatch.value).toBe(expected);
  });
  test.each([
    "ABB",
    "ACC",
    "BBB",
    "BBC",
    "CAB",
    "AABC"
  ])("does not match '%s'", (input) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
  test.each([
    ["ABBBC", "over match"]
  ])("over matches '%s'", (input, _msg) => {
    const nav = MutMatchNav.fromString(input);
    expect(repeatMatcher.match(nav)).toBeNull();
  });
});

describe("MatchRepeat: Number Repeat Matcher With AltFirst and AltLast", () => {
  const groupSeparatorMatcher = MatchCodePoint.fromString(",");
  const startGroupMatcher = MatchOpt.from(
    MatchAll.fromMatchers(
      MatchRepeat.from(
        MatchCodePointCategories.fromString("Nd"),
        NumberOfMatches.between(1, 2)
      ),
      groupSeparatorMatcher
    )
  );
  const contentGroupMatcher = MatchOpt.from(
    MatchAll.fromMatchers(
      MatchRepeat.from(
        MatchCodePointCategories.fromString("Nd"),
        NumberOfMatches.exactly(3)
      ),
      groupSeparatorMatcher
    )
  );
  const endGroupMatcher = MatchAll.fromMatchers(
    MatchRepeat.from(
      MatchCodePointCategories.fromString("Nd"),
      NumberOfMatches.between(1, 3)
    ),
    MatchEndSlice.default
  );
  const numberMatcher = MatchRepeat.from(
    contentGroupMatcher,
    NumberOfMatches.between(1, 4),
    AltFirstLastMatchers.fromBoth(startGroupMatcher, endGroupMatcher)
  );
  test.each([
    ["123,12", "123,12"],
    ["12,567", "12,567"],
    ["1,567", "1,567"],
    ["1,567,8", "1,567,8"],
    ["1,567,89", "1,567,89"],
    ["1,567,890", "1,567,890"],
    ["123,567,890", "123,567,890"],
    ["123,567,890,321", "123,567,890,321"],
    ["1,567,890,321", "1,567,890,321"],
    ["1,567,890,3", "1,567,890,3"],
    ["123", "123"],
    ["12", "12"],
    ["1", "1"]
  ])("matches '%s' -> '%s'", (input, expected) => {
    const nav = MutMatchNav.fromString(input);
    const result = numberMatcher.match(nav);
    expect(result?.captureMatch.value).toBe(expected);
  });
  test.each([
    ["12,", "incomplete"],
    ["12,123,", "incomplete"],
    ["123,567,890,321,123", "over match"],
    ["1,567,890,321,123", "over match"],
    ["123,567,890,321,3", "over match"],
    ["1,567,890,321,3", "over match"],
    ["1234", "not handled"]
  ])("does not match '%s' (%s)", (input, _msg) => {
    const nav = MutMatchNav.fromString(input);
    expect(numberMatcher.match(nav)).toBeNull();
  });
});
