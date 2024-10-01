import {
	testBasicSeq,
	testLongNumberDirect,
	testLongNumberSeq,
	testNumberFilterSeq,
	testNumbers,
} from "@/app/seq-test";
import JS from "@/utils/js";
import { log } from "@/utils/log";
import { round } from "@/utils/math";

const count = 100_000_000;

// await testLongNumberSeq(count);

// await testNumberFilterSeq(count);

// await testLongNumberDirect(count);

const div = () => {
	log(40);
};

await testBasicSeq();
