const codemirror = CodeMirror(document.querySelector('div#code'), {
	value: 'print("FizzBuzz")',
	mode: 'javascript',
	theme: 'material-darker',
	autoCloseBrackets: true,
	lineNumbers: true,
})

const finishDate = new Date();
finishDate.setDate(finishDate.getDate() + 1)
finishDate.setHours(5);
finishDate.setMinutes(30);
finishDate.setMilliseconds(0);

const remainingTime = finishDate - Date.now();
document.querySelector('#timestring').innerHTML = msToTime(remainingTime);
setInterval(() => {
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
