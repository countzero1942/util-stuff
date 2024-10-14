import prompts from "prompts";

/**
 * Asks user to choose a number in a prompt.
 *
 * The prompt will show: "message: min to max"
 * and will validate the input to be a number in the range [min, max].
 *
 * @param min Minimum number
 * @param max Maximum number
 * @param message Prompt message. Defaults to "Choose a number"
 * @returns A number between min and max
 */
export const chooseNumberPrompt = async (
	min: number,
	max: number,
	message: string = "Choose a number"
): Promise<number> => {
	const msg = `${message}: ${min} to ${max}`;
	const response = await prompts({
		type: "number",
		name: "value",
		message: msg,
		validate: value => {
			switch (true) {
				case value < min:
					return `Number is less than ${min}`;
				case value > max:
					return `Number is greater than ${max}`;
				default:
					return true;
			}
		},
	});

	return response.value as number;
};

/**
 * Asks user to choose a number in a prompt.
 *
 * The prompt will default to the given defaultNumber.
 *
 * @param min Minimum number
 * @param max Maximum number
 * @param defaultNumber Default number to show in the prompt.
 * @param message Prompt message. Defaults to "Choose a number"
 * @returns A number between min and max
 */
export const chooseDefaultNumberPrompt = async (
	min: number,
	max: number,
	defaultNumber: number,
	message: string = "Choose a number"
): Promise<number> => {
	const msg = `${message}: ${min} to ${max}`;
	const response = await prompts({
		type: "number",
		name: "value",
		message: msg,
		initial: defaultNumber,
		validate: value => {
			switch (true) {
				case value < min:
					return `Number is less than ${min}`;
				case value > max:
					return `Number is greater than ${max}`;
				default:
					return true;
			}
		},
	});

	return response.value;
};

export const pressEnterToContinue = async (): Promise<
	"Continue" | "Exit"
> => {
	const response = await prompts({
		type: "text",
		name: "value",
		message: "Press enter to continue (or 'x' to exit)",
	});

	const value = response.value as string;
	switch (true) {
		case value === "":
			return "Continue";
		default:
			return "Exit";
	}
};
