import { log } from "console";
import { ReadonlyTuple } from "type-fest";

const getPrototype = (item: any) => {
	return Object.prototype.toString.call(item).slice(8, -1);
};

/**
 * Gets the Name of a Class object.
 * @param item The Class object to retrieve Class name from
 * @returns The Class Name
 */
export const getClassName = (item: Object) => item.constructor.name;

export const hasClassName = (item: Object, className: string) => {
	const type = getType(item);
	log(`===><hasClassName> type: ${type}`);

	if (type !== "Class") {
		log(`===><hasClassName> type !== "Class" -> return FALSE`);
		return false;
	}

	let next = Object.getPrototypeOf(item);

	while (next !== null) {
		const name = next?.constructor?.name;

		if (name === null || name === "Object") {
			return false;
		}
		log(`===><hasClassName> ctor name: ${name}`);

		if (next.constructor.name === className) {
			log(
				`===><hasClassName> ancestor class matches -> return TRUE`
			);

			return true;
		}
		next = Object.getPrototypeOf(next);
	}
	log(
		`===><hasClassName> next = Object.getPrototypeOf(next) -> return FALSE`
	);
	return false;
};

/**
 * Gets the Type name of an object. The return type covers
 * most Type name cases. But can cast as string to compare
 * those not listed in the Union.
 * @param item The object to get the Type of
 * @returns The object Type name
 */
export const getType = (
	item: any
):
	| "Number"
	| "String"
	| "Boolean"
	| "Undefined"
	| "Null"
	| "RegEx"
	| "Date"
	| "Array"
	| "Function"
	| "Object"
	| "Class"
	| "Error"
	| "Map"
	| "Set" => {
	if (item === null) {
		return "Null";
	}
	if (typeof item === "undefined") {
		return "Undefined";
	}
	const prototype: ReturnType<typeof getType> = getPrototype(
		item
	) as ReturnType<typeof getType>;
	if (
		prototype === "Object" &&
		getClassName(item as Object) != "Object"
	) {
		return "Class";
	}
	return prototype;
};

export type FullType = {
	type:
		| "Number"
		| "String"
		| "Boolean"
		| "Undefined"
		| "Null"
		| "RegEx"
		| "Date"
		| "Array"
		| "Function"
		| "Object"
		| "Class"
		| "Error"
		| "Map"
		| "Set";
	className: string;
};

export const getFullType = (item: any): FullType => {
	const type = getType(item);
	const name = type === "Class" ? getClassName(item) : "";
	return { type, className: name };
};

export const isFullType = (item: any, fullType: FullType) => {
	const fullTypeItem = getFullType(item);
	return (
		fullTypeItem.type === fullType.type &&
		fullTypeItem.className === fullType.className
	);
};

/**
 * This compares the Types of two objects and returns
 * true if they match. Every object that is a class
 * will yield a Type match of Type "Class".
 *
 * @param a The object A to compare
 * @param b The object B to compare
 * @returns True if the Types are a match. All class objects
 * will match with the Type of "Class"
 */
export const isTypeMatch = (a: any, b: any) =>
	getType(a) === getType(b);

/**
 * This will match two objects for the same Type; and if both
 * are type "Class" then it will test to see if both Class-Names
 * are also a match.
 *
 * @param a The object A to compare
 * @param b The object B to compare
 * @returns True if Types are a match; and if Classes,
 * ClassNames are also a match.
 */
export const isTypeAndClassNameMatch = (a: any, b: any) => {
	const ta = getType(a);
	const tb = getType(b);

	if (ta === "Class" && tb === "Class") {
		return getClassName(a) === getClassName(b);
	}

	return ta === tb;
};

/**
 * This compares the Types and Class-Names of two objects
 * and returns the related info.
 *
 * @param a The object A to compare
 * @param b The object B to compare
 * @returns The related-info Object
 */
export const compareTypeAndClassName = (
	a: any,
	b: any
): {
	isTypeMatch: boolean;
	isClassNameMatch: boolean;
	isTypeAndClassNameMatch: boolean;
	typeA: ReturnType<typeof getType>;
	classNameA?: string;
	typeB: ReturnType<typeof getType>;
	classNameB?: string;
} => {
	const typeA = getType(a);
	const typeB = getType(b);

	const isTypeMatch = typeA === typeB;

	if (typeA === "Class" && typeB === "Class") {
		const classNameA = getClassName(a);
		const classNameB = getClassName(b);
		const isClassMatch = classNameA === classNameB;

		return {
			isTypeMatch,
			isClassNameMatch: isClassMatch,
			isTypeAndClassNameMatch: isClassMatch,
			typeA,
			typeB,
			classNameA,
			classNameB,
		};
	}

	return {
		isTypeMatch,
		isClassNameMatch: false,
		isTypeAndClassNameMatch: isTypeMatch,
		typeA,
		typeB,
	};
};

/**
 * Can be used with array.filter to filter out undefined members
 * Can also be used to narrow an array's type in a filter function.
 *
 * @param obj This is typically the element of an array
 * during a filter callback
 * @returns The 'obj' cast as T if it is defined.
 */
export const isDefined = <T>(obj: T | undefined): obj is T => {
	return obj !== undefined;
};

/**
 * This method can be called in the 'default' case of a switch
 * that matches the discriminated key-value in a discriminated
 * union to ensure each type is implemented.
 */
export const exhaustiveGuard = (_: never): never => {
	throw Error("Never");
};

/**
 * These are the keys to methods that mutate the contents
 * of an array. They are removed in FixedLengthArray of T, L
 */
export type ArrayLengthMutationKeys =
	| "splice"
	| "push"
	| "pop"
	| "shift"
	| "unshift";

export const toReadonlyTuple = <
	L extends number,
	TArray extends readonly any[]
>(
	arr: TArray,
	length: L
) => {
	if (length > arr.length) {
		throw RangeError(
			"FixedLengthArray L greater than 'arr.length'"
		);
	}

	return arr as unknown as ReadonlyTuple<TArray, L>;
};
