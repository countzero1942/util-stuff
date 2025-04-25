import { StrSlice } from "@/utils/slice";
import { MutMatchNav } from "@/trex/nav";
import { MatchStartSlice, MatchEndSlice } from "@/trex/match-position";

describe("MatchStartSlice", () => {
  let matchStartSlice: MatchStartSlice;

  beforeEach(() => {
    matchStartSlice = new MatchStartSlice();
  });

  it("matches at the beginning of the slice", () => {
    const source = StrSlice.from("test string");
    const nav = new MutMatchNav(source, 0);
    
    const result = matchStartSlice.match(nav);
    
    expect(result).not.toBeNull();
    expect(result?.navIndex).toBe(0);
  });

  it("does not match when not at the beginning of the slice", () => {
    const source = StrSlice.from("test string");
    const nav = new MutMatchNav(source, 3);
    
    const result = matchStartSlice.match(nav);
    
    expect(result).toBeNull();
  });

  it("works with empty string", () => {
    const source = StrSlice.from("");
    const nav = new MutMatchNav(source, 0);
    
    const result = matchStartSlice.match(nav);
    
    expect(result).not.toBeNull();
    expect(result?.navIndex).toBe(0);
  });

  it("does not mutate the navigation state on success", () => {
    const source = StrSlice.from("test string");
    const nav = new MutMatchNav(source, 0);
    const originalNavIndex = nav.navIndex;
    
    const result = matchStartSlice.match(nav);
    
    expect(result).not.toBeNull();
    expect(result?.navIndex).toBe(originalNavIndex);
  });
});

describe("MatchEndSlice", () => {
  let matchEndSlice: MatchEndSlice;

  beforeEach(() => {
    matchEndSlice = new MatchEndSlice();
  });

  it("matches at the end of the slice", () => {
    const source = StrSlice.from("test string");
    const nav = new MutMatchNav(source, source.length);
    
    const result = matchEndSlice.match(nav);
    
    expect(result).not.toBeNull();
    expect(result?.navIndex).toBe(source.length);
  });

  it("does not match when not at the end of the slice", () => {
    const source = StrSlice.from("test string");
    const nav = new MutMatchNav(source, 3);
    
    const result = matchEndSlice.match(nav);
    
    expect(result).toBeNull();
  });

  it("works with empty string", () => {
    const source = StrSlice.from("");
    const nav = new MutMatchNav(source, 0);
    
    const result = matchEndSlice.match(nav);
    
    expect(result).not.toBeNull();
    expect(result?.navIndex).toBe(0);
  });

  it("does not mutate the navigation state on success", () => {
    const source = StrSlice.from("test string");
    const nav = new MutMatchNav(source, source.length);
    const originalNavIndex = nav.navIndex;
    
    const result = matchEndSlice.match(nav);
    
    expect(result).not.toBeNull();
    expect(result?.navIndex).toBe(originalNavIndex);
  });
});
