// PrimeFactorizer: Efficient prime factorization up to a specified maximum
// Usage: const pf = new PrimeFactorizer(max); pf.getPrimeFactors(n)

export class PrimeFactorizer {
	private readonly max: number;
	private readonly primes: number[];

	constructor(max: number) {
		this.max = max;
		this.primes = this.sievePrimes(
			Math.floor(Math.sqrt(max))
		);
	}

	// Sieve of Eratosthenes up to n
	private sievePrimes(n: number): number[] {
		if (n < 2) return [];
		const isPrime = new Array(n + 1).fill(true);
		isPrime[0] = isPrime[1] = false;
		for (let i = 2; i * i <= n; i++) {
			if (isPrime[i]) {
				for (let j = i * i; j <= n; j += i) {
					isPrime[j] = false;
				}
			}
		}
		const primes: number[] = [];
		for (let i = 2; i <= n; i++) {
			if (isPrime[i]) primes.push(i);
		}
		return primes;
	}

	// Returns an array of prime factors (with multiplicity) for n
	getPrimeFactorsWithMultiplicity(n: number): number[] {
		if (n < 2) return [];
		const factors: number[] = [];
		let remaining = n;
		for (const p of this.primes) {
			if (p * p > remaining) break;
			while (remaining % p === 0) {
				factors.push(p);
				remaining = Math.floor(remaining / p);
			}
		}
		if (remaining > 1) factors.push(remaining);
		return factors;
	}

	getPrimeFactors(n: number): number[] {
		const factors =
			this.getPrimeFactorsWithMultiplicity(n);
		const uniqueFactors = new Set(factors);
		return Array.from(uniqueFactors);
	}
}
