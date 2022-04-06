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

	// profile page
	const profileDiv = document.querySelector('#profile-page');
	if (profileDiv) {
		const user = await auth0.getUser();
		
		const nickname = profileDiv.querySelector('#nickname');
		nickname.innerHTML = user.nickname;
	}
}

