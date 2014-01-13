// This was designed to automate voting in online polls, specifically a Constant Contact survey.
// Because that site uses sessions, and stores cookies, we're going to make an initial request to get that,
// then make the actual vote request using the same headers as before, but with the cookie.

// Fill these in with the settings for voting.

	// The form page itself.
var page = 'http://survey.constantcontact.com/survey/a07e8sd4s5xhqd06wkx/start',
	// The page that linked to the initial form request.
	referrer = 'http://www.example.com/',
	// This is the data for the vote itself. Include any other form data it needs.
	formData = {
		'currentResponsePageQuestions[0].currentResponseSelected': 3
	},
	// We're going to wait a random time between votes. This is the max time for the random number in milliseconds.
	// The target number of votes per day. It won't be this actual amount, since we're going to use it as a guide for randomness.
	targetVotesPerDay = 50,

	// These are a list of the user agents that we'll randomly select from.
	userAgents = [
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
		'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
		'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; GTB6.3; .NET CLR 1.1.4322; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; AskTbORJ/5.13.1.18107)',
		'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:25.0) Gecko/20100101 Firefox/25.0',
		'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/536.26.14 (KHTML, like Gecko) Version/6.0.1 Safari/536.26.14',
		'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; en-us) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
		'Mozilla/5.0 (iPad; CPU OS 6_1_3 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B329 Safari/8536.25',
		'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; WOW64; Trident/6.0; Touch; MDDCJS)',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0_4 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11B554a Safari/9537.53',
		'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; WOW64; Trident/4.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; InfoPath.3; MS-RTC LM 8)',
		'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0;  WOW64;  Trident/5.0)',
		'Mozilla/5.0 (Windows NT 5.1; rv:26.0) Gecko/20100101 Firefox/26.0',
		'Mozilla/5.0 (Linux; U; Android 4.1.2; en-us; GT-N8013 Build/JZO54K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30'
	],

	Socks5ClientHttpAgent = require('socks5-http-client/lib/Agent'),
	request = require('request');

function vote() {
	// Get random user agent.
	var thisUA = userAgents[ Math.floor( Math.random() * userAgents.length ) ];
	console.log( 'Voting as ' + thisUA );
	// Make a new cookie jar for this vote.
	var cookieJar = request.jar();
	// Set up the request.
	var requestOptions = {
		url: page,
		agent: new Socks5ClientHttpAgent({ socksPort: 9050 }),
		jar: cookieJar,
		// These headers could be set up based on which user agent is being used.
		headers: {
			'User-Agent': thisUA,
			'Referer': referrer
		}
	};
	// Make the call.
	request( requestOptions, function( error, response, body ) {
		// Assuming it didn't error out, then make the second request,
		// using the same user agent and cookie jar.
		if ( !error ) {
			console.log('Form page loaded, now sending vote.');
			// Wait 12 seconds before voting.
			setTimeout( function() {
				// This page will redirect you to a new form page, with a unique URL.
				requestOptions.url = response.request.uri.href;
				// Make adjustments for the form posting.
				requestOptions.method = 'POST';
				requestOptions.form = formData;
				// Set the referrer to be the page we hit first.
				requestOptions.headers['Referer'] = page;
				// Now post the actual form.
				request( requestOptions, function( e, r, b ) {
					console.log( r );
				});
			}, 12000 );
		} else {
			console.log( error );
		}
	});
	// We queue up the next vote, regardless of if this one went through.
	waitAndVote();
}

function waitAndVote() {
	// Now wait a random time
	// Get the maximum from the votes per day.
	// There are 86400000 milliseconds in a day, so 50 votes per day is 1728000.
	var maxTime = Math.round( 86400000 / targetVotesPerDay );
	// We'll wait at least 1 second, as a minimum.
	var waitTime = getRandomInt( 1000, maxTime );
	console.log('Next vote in ' + waitTime);
	setTimeout( vote, waitTime );
}

function getRandomInt(min, max) {
	return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

// Start it off.
vote();
