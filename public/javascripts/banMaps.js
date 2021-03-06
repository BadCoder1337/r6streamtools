function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
}

socket = io.connect(socketUri, { query: 'id='+getQueryVariable('id')});
socket.on('connect', function () {
    console.log('connected!');

    socket.on('reload', function (msg) {
        if (msg.match.id == getQueryVariable('id')) {
            location.reload();
        }
    });

    socket.on('message', function (msg) {
        console.log('msg: ', msg);
        var match = msg.match;
        if (match.id != getQueryVariable('id')) {return;}
        if (msg.type == 'reload') {location.reload();}
        console.log('match recieved');
        var mapAmount = parseInt(match.matchType[2]);
        match.votes.forEach((v, i) => {
            //console.log(v);
            $(`#A${i}`).css('background-image', `url(images/maps/${v}.jpg)`);
            $(`#A${i} p`).text(match.pool.name[match.pool.id.indexOf(v)].toUpperCase());
            if ((match.matchType == 'bo1') || (match.matchType == 'bo3' && !([3,2].includes(i))) || (match.matchType == 'bo5' && !([5,4,3,2].includes(i)))) {
                $(`#A${i} i`).text('clear');
                $(`#A${i}`).addClass('team-action-red');
            } else /*if (i != match.pool.id.length-1) */ {
                $(`#A${i} i`).text('check');
                $(`#A${i}`).addClass('team-action-green');
            }
            // if (i != match.pool.id.length-1) {
            //     $(`#overlay-${v} img`).attr('src', `images/teams/${match['code'+(i%2+1)]}.png`);
            // }
            $(`#overlay-${v}`).fadeIn();
            $(`#A${i}`).fadeIn();
        });
    });
});
