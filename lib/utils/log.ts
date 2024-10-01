export const logln = (length: number = 20) =>
	console.log("-".repeat(length));

export const log = (...data: any) => {
	const arg1 = data[0];
	if (arg1 !== undefined && typeof arg1 === "number") {
		logln(arg1);
	} else {
		console.log(...data);
	}
};
export const logh = (header: string) => {
	log();
	const line = "-".repeat(header.length);
	log(line);
	log(header);
	log(line);
};
