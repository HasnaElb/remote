const express = require("express");
const path = require("path");
const Main = require("./controller/Main");
const NodeCache = require("node-cache");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", "views");

// Set up caching with TTL of 2 hours
const cache = new NodeCache({ stdTTL: 7200, checkperiod: 3600 });

// Helper function to format jobs randomly for display
const getRandomJobs = (jobs, num) => {
	return [...jobs]
		.sort(() => Math.random() - 0.5)
		.slice(0, num);
};

// Route for homepage, displays a selection of jobs
app.get("/", async (req, res) => {
	const cachedJobs = cache.get("jobs");

	if (cachedJobs) {
		console.log("Serving cached jobs for homepage");
		return res.render("index", { jobs: getRandomJobs(cachedJobs, 6) });
	} 

	const main = new Main();
	const jobs = await main.getJobs();

	if (jobs.length > 0) {
		cache.set("jobs", jobs);
		console.log("Fetched and cached jobs for homepage");
		return res.render("index", { jobs: getRandomJobs(jobs, 6) });
	} 

	res.render("index", { jobs: [] });
});

//About page
app.get("/about", (req, res) => {
	res.render("about", {
		meta: {
			title: "About",
			description: "Learn more about our remote job platform",
			keywords: "about, remote jobs, job platform, ALX grads",
		},
	});
});

// Route to list all jobs
app.get("/jobs", async (req, res) => {
	const cachedJobs = cache.get("jobs");

	if (cachedJobs) {
		console.log("Serving cached job list");
		return res.render("jobs", { jobs: cachedJobs });
	}

	const main = new Main();
	const jobs = await main.getJobs();

	cache.set("jobs", jobs);
	console.log("Fetched and cached job list");
	res.render("jobs", { jobs });
});

// Route to display individual job details
app.get("/jobs/:id", async (req, res) => {
	const jobId = req.params.id;
	const cachedJobs = cache.get("jobs");

	if (cachedJobs) {
		console.log("Serving cached job details");
		const job = cachedJobs.find((job) => job.slug === jobId);

		if (job && job.description) {
			job.description = job.description
				.replace(/Â/g, "")
				.replace(/â\x82¬/g, "€")
				.replace(/ â\x80¢ /g, " - ")
				.replace(/â\x80\x93/g, "-")
				.replace(/â\x80\x99/g, "'")
				.replace(/ð\x9F\x99\x82/g, "🙂")
				.replace(/â\x80\x94/g, " - ")
				.replace(/â\x80\x98/g, "'");

			return res.render("job", { job, jobs: getRandomJobs(cachedJobs, 5) });
		}
	}

	// Fetch jobs if not cached
	const main = new Main();
	const jobs = await main.getJobs();

	if (jobs.length > 0) {
		cache.set("jobs", jobs);
		const job = jobs.find((job) => job.slug === jobId);
		if (job && job.description) {
			job.description = job.description
				.replace(/Â/g, "")
				.replace(/â\x82¬/g, "€")
				.replace(/ â\x80¢ /g, " - ")
				.replace(/â\x80\x93/g, "-")
				.replace(/â\x80\x99/g, "'")
				.replace(/ð\x9F\x99\x82/g, "🙂")
				.replace(/â\x80\x94/g, " - ")
				.replace(/â\x80\x98/g, "'");
			return res.render("job", { job, jobs: getRandomJobs(jobs, 5) });
		}
	}

	res.status(404).render("404");
});

// Privacy, Terms, and Cookie Policy routes
app.get("/privacy", (req, res) => res.render("privacy"));
app.get("/terms-and-conditions", (req, res) => res.render("tos"));
app.get("/cookie-policy", (req, res) => res.render("cookie-policy"));

// 404 error handling for undefined routes
app.all("*", (req, res) => {
	  res.status(404).render("404");
});

// Start the server
app.listen(3000, () => {
	  console.log("Server is running on port 3000");
});
