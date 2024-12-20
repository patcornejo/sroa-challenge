import { createClient } from 'redis';

const client = createClient({
	url: "redis://localhost:6379"
});

client.connect().then(() => {
	console.log('Connected to Redis');
})
	.catch((error) => {
		console.log(error.message);
	})

client.on('error', (err) => {
    console.log("error", err.message);
})