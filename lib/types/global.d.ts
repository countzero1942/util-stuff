type Simplify<T> = {
	[K in keyof T]: T[K];
} & {};

type OnlyValueTypesOf<T> = {
	[key: string]: T;
};

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

type KeyType = string | number | symbol;
