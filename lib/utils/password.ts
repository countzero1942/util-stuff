import { div } from "@/utils/log";
import { log } from "console";
import cryptoRandomString from "crypto-random-string";

export const generatePassword = (length: number = 15): string => {
	const pwCharsAlphaLower = "abcdefghijklmnopqrstuvwxyz";
	const pwCharsAlphaUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const pwCharsNumeric = "0123456789";
	const pwCharsSpecial = "!@#$%^&*_";

	const pwChars =
		`${pwCharsAlphaLower}${pwCharsAlphaUpper}` +
		`${pwCharsNumeric}${pwCharsSpecial}`;

	let attempts = 1;
	while (true) {
		const pw = cryptoRandomString({
			length,
			characters: pwChars,
		});
		if (
			/[a-z]/.test(pw) &&
			/[A-Z]/.test(pw) &&
			/[0-9]/.test(pw) &&
			/[!@#$%^&*_]/.test(pw)
		) {
			return pw;
		}
		log(`--> Failed attempt ${attempts}. Retrying...`);
	}
};

export const logGeneratePassword = (length: number = 15) => {
	const pw = generatePassword(length);
	div();
	log();
	log(pw);
	log();
	div();
};
