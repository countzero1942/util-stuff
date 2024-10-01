import {
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

const obj = {
	a: "a string",
	"kebab-var": {
		name: {
			first: "Alex",
			last: "kebab-Son",
		},
		d: 42,
		e: true,
	},
	x: 1234567890,
	y: 6.283185,
};

const s = JS.stringify(obj);
div();
log("Object:");
log(obj);
div();
log("JS.stringify:");
log(s);
div();
