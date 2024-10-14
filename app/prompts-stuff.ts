import prompts from "prompts";

export const getAgeForNightclub = async () => {
	const response = await prompts({
		type: "number",
		name: "value",
		message: "How old are you?",
		validate: value =>
			value < 18 ? `Nightclub is 18+ only` : true,
	});

	return response.value;
};

export const chooseANumberMinMax = async (
	min: number,
	max: number
): Promise<number> => {
	const response = await prompts({
		type: "number",
		name: "value",
		message: `Choose a number between ${min} and ${max}`,
		validate: value =>
			value < min || value > max ? `Number is out of range` : true,
	});

	return response.value;
};
