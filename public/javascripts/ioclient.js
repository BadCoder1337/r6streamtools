socket = io.connect(socketUri);
socket.on('connect', function () {
    console.log('connected!');
    socket.on('message', function (msg) {
        console.log('match recieved');
        console.log(match);
        var match = msg.match;
        var mapAmount = parseInt(match.matchType[2]);
        match.votes.forEach((v, i) => {
            console.log(v);
            $(`#A${i}`).css('background-image', `url(images/maps/${v}.jpg)`);
            $(`#A${i} p`).text(match.pool.name[match.pool.id.indexOf(v)].toUpperCase());
            if (i < (9-mapAmount)) {
                $(`#A${i} i`).text('clear');
                $(`#A${i}`).addClass('team-action-red');
            } else if (i != 8) {
                $(`#A${i} i`).text('check');
                $(`#A${i}`).addClass('team-action-green');
            }
            if (i != 8) {
                $(`#overlay-${v} img`).attr('src', `images/teams/${match['code'+(i%2+1)]}.png`);
            }
            $(`#overlay-${v}`).show();
            $(`#A${i}`).show();
        });
    });
});
