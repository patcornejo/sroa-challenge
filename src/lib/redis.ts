import Redis from 'ioredis';

const cache = new Redis();

export const setAttempt = async (email: string) => {
	const attempts = await cache.get(email) ?? "0";
	console.log("attempts", attempts);
	const attemptsInt = parseInt(attempts) + 1;
	await cache.set(email, attemptsInt, "EX", 60 * 15);
	return attemptsInt;
};

export const getAttempt = async (email: string) => {
	const attempts = await cache.get(email) ?? "0";
	return parseInt(attempts);
}
