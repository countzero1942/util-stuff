type Simplify<T> = {
	[K in keyof T]: T[K];
} & {};

type OnlyValueTypesOf<T> = {
	[key: string]: T;
};
