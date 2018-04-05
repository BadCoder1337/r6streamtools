socket = io.connect(socketUri);
socket.on('connect', function () {
    console.log('connected!');
    socket.on('message', function (msg) {
        console.log('receive msg: ', msg);
    });
});
