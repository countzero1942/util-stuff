import { describe, expect, test } from "@jest/globals";
import {
	KeyBodyReqHead,
	KeyValDefHead,
	LineInfo,
	KeyTrait,
} from "../../../../lib/parser/types/heads";
import { ParserIndentErr } from "../../../../lib/parser/types/err-types";
import { parseTrait } from "../../../../lib/parser/utils/parse-trait";
import { StrSlice } from "../../../../lib/utils/slice";
import { Range } from "../../../../lib/utils/seq";

describe("parseTrait - Error Cases", () => {});
