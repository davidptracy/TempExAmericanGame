//========================================================
//================ HTTP PORTION ==========================
//========================================================

var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
var url = require('url');
httpServer.listen(5000);

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	console.log("The Request is: " + parsedUrl.pathname);
	
	// Read index.html
	
	fs.readFile(__dirname + parsedUrl.pathname, 
		// Callback function for reading
		function (err, data) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + parsedUrl.pathname);
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(data);
  		}
  	);
}


//========================================================
//============== WEBSOCKETS PORTION ======================
//========================================================

var io = require('socket.io').listen(httpServer);

var connectedSockets = [];

var countDownActive = false;

var contestant1des = 0;
var contestant2des = 0;
var contestant3des = 0;
var contestant4des = 0;

var contestant1avg = 0;
var contestant2avg = 0;
var contestant3avg = 0;
var contestant4avg = 0;

var contestant1via = 0;
var contestant2via = 0;
var contestant3via = 0;
var contestant4via = 0;

var contestant1avgVia = 0;
var contestant2avgVia = 0;
var contestant3avgVia = 0;
var contestant4avgVia = 0;

var desVoteCount = 0;
var viaVoteCount = 0;

io.sockets.on('connection', function (socket){

	console.log("We have a new client: " + socket.id);

	//add it to the array of connected sockets
	connectedSockets.push(socket);

	socket.on('gameTime', function(){
		countDownActive = true;
		countDown();
	});

	socket.on('eToolSelected', function(data){
		socket.broadcast.emit('eToolFromServer', data);
	});

	socket.on('methodSelected', function(data){
		socket.broadcast.emit('methodFromServer', data);
	});

	// socket.on('futureSelected', function(data){
	// 	socket.broadcast.emit('futureFromServer', data);
	// });

	socket.on('purposeSelected', function(data){
		socket.broadcast.emit('purposeFromServer', data);
	});

	socket.on('audAnswers', function(data){

		var audArray = [0,0,0,0]

		desVoteCount ++;

		contestant1des += data[0];
		contestant2des += data[1];
		contestant3des += data[2];
		contestant4des += data[3];

		contestant1avg = contestant1des / desVoteCount;
		contestant2avg = contestant2des / desVoteCount;
		contestant3avg = contestant3des / desVoteCount;
		contestant4avg = contestant4des / desVoteCount;

		audArray[0] = contestant1avg;
		audArray[1] = contestant2avg;
		audArray[2] = contestant3avg;
		audArray[3] = contestant4avg;

		console.log(audArray[0]);
		console.log(audArray[1]);
		console.log(audArray[2]);
		console.log(audArray[3]);

		socket.broadcast.emit('audScore', audArray);

		socket.broadcast.emit('purposeFromServer', data);
	})

	socket.on('ceoAnswers', function(data){

		var ceoArray = [0,0,0,0];

		viaVoteCount ++;

		contestant1via += data[0];
		contestant2via += data[1];
		contestant3via += data[2];
		contestant4via += data[3];

		contestant1avgVia = contestant1via / viaVoteCount;
		contestant2avgVia = contestant2via / viaVoteCount;
		contestant3avgVia = contestant3via / viaVoteCount;
		contestant4avgVia = contestant4via / viaVoteCount;

		ceoArray[0] = contestant1avgVia;
		ceoArray[1] = contestant2avgVia;
		ceoArray[2] = contestant3avgVia;
		ceoArray[3] = contestant4avgVia;

		console.log(ceoArray[0]);
		console.log(ceoArray[1]);
		console.log(ceoArray[2]);
		console.log(ceoArray[3]);

		socket.broadcast.emit('ceoScore', ceoArray);
	})

});

//========================================================
//============== UTILITY FUNCTIONS PORTION ===============
//========================================================

var counter = 60;

var countDown = function(){

	if (countDownActive){
		counter --;
		io.sockets.emit('timer', counter);

		setTimeout(countDown, 1000);
	}

	if (counter == 0){
		countDownActive = false;
		io.sockets.emit('timer', "Time's Up!");
		counter = 60;
	}
}


