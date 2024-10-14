module.exports = {
	apps: [
		{
			name: "remote-website",
			script: "./index.js",
			env: {
				NODE_ENV: "production",
			},
		},
	],
};
