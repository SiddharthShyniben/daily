const codemirror = CodeMirror(document.querySelector('div#code'), {
	value: 'print("FizzBuzz")',
	mode: 'javascript',
	theme: 'material-darker',
	autoCloseBrackets: true,
	lineNumbers: true,
})

const getFinishDate = () => {
	const finishDate = new Date();
	finishDate.setDate(finishDate.getDate() + 1)
	finishDate.setHours(5);
	finishDate.setMinutes(30);
	finishDate.setMilliseconds(0);
	return finishDate;
}

let finishDate = getFinishDate();

const remainingTime = finishDate - Date.now();
document.querySelector('#timestring').innerHTML = msToTime(remainingTime);
setInterval(() => {
	if (finishDate - Date.now() <= 0) {
		finishDate = getFinishDate();
	}

	const remainingTime = finishDate - Date.now();
	document.querySelector('#timestring').innerHTML = msToTime(remainingTime);
}, 60000);

function padTo2Digits(num) {
	return num.toString().padStart(2, '0');
}

function msToTime(milliseconds) {
	let seconds = Math.floor(milliseconds / 1000);
	let minutes = Math.floor(seconds / 60);
	let hours = Math.floor(minutes / 60);

	seconds = seconds % 60;
	minutes = seconds >= 30 ? minutes + 1 : minutes;
	minutes = minutes % 60;
	hours = hours % 24;

	return `${padTo2Digits(hours)}h ${padTo2Digits(minutes)}m`;
}

// auth
let auth0 = null;
let authConfig = {
	domain: "dev-epj04vkh.us.auth0.com",
	client_id: "XOmEpVjeiBy8b89BBpU0PXWqu2N5sQsT"
};

const login = async (targetUrl) => {
	try {
		console.log("Logging in", targetUrl);

		const options = {
			redirect_uri: window.location.origin
		};

		if (targetUrl) {
			options.appState = { targetUrl };
		}

		await auth0.loginWithRedirect(options);
	} catch (err) {
		console.log("Log in failed", err);
	}
};

const logout = () => {
	try {
		console.log("Logging out");
		auth0.logout({
			returnTo: window.location.origin
		});
	} catch (err) {
		console.log("Log out failed", err);
	}
};

const configureClient = async () => {
	auth0 = await createAuth0Client(authConfig);
};

const requireAuth = async (fn, targetUrl) => {
	const isAuthenticated = await auth0.isAuthenticated();

	if (isAuthenticated) {
		return fn();
	}

	return login(targetUrl);
};

const loginButton = document.querySelector('#login');
const logoutButton = document.querySelector('#logout');
const isin = document.querySelector('#isin');
const profileImg = document.querySelector('#profile-img');
const profileLink = document.querySelector('#profile-link');

const updateUI = async () => {
	const isAuthenticated = await auth0.isAuthenticated();

	if (isAuthenticated) {
		const user = await auth0.getUser();

		loginButton.style.display = 'none';
		logoutButton.style.display = 'inline-block';
		console.log(JSON.stringify(await auth0.getUser()));
		isin.innerHTML = `Logged in as ${user.name}`;

		profileImg.src = user.picture;
		profileLink.style.display = 'inline-block'
	} else {
		logoutButton.style.display = 'none';
		loginButton.style.display = 'inline-block';
		isin.innerHTML = 'You are not logged in';
		profileLink.style.display = 'none';
	}
}

window.onload = async () => {
	await configureClient();
	
	updateUI();

	const query = window.location.search;
	const shouldParseResult = query.includes("code=") && query.includes("state=");

	if (shouldParseResult) {
		console.log("> Parsing redirect");
		try {
			const result = await auth0.handleRedirectCallback();
			console.log("Logged in!", result);
		} catch (err) {
			console.log("Error parsing redirect:", err);
		}
		updateUI();
	}

	loginButton.addEventListener('click', login);
	logoutButton.addEventListener('click', logout);
}
