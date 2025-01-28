import { describe, expect, test } from "@jest/globals";
import {
	KeyBodyReqHead,
	KeyValDefHead,
	LineInfo,
	KeyTrait,
} from "@/parser/types/heads";
import { ParserIndentErr } from "@/parser/types/err-types";
import { parseTrait } from "@/parser/utils/parse-trait";
import { StrSlice } from "@/utils/slice";
import { Range } from "@/utils/seq";
import { ZNum } from "@/parser/types/type-types";

describe("parseTrait - Error Cases", () => {});
