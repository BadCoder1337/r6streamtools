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
        console.log('recieved reload');
        if (msg.id == getQueryVariable('id')) {
            location.reload();
        }
    });

    socket.on('swap', function (msg) {
        console.log('recieved swap');
        if (msg.id == getQueryVariable('id')) {
            $('#defenders.pickrates').fadeIn();
            $('#defenders.operators-grid-wrapper').fadeIn();
            $('#attackers.pickrates').fadeOut();
            $('#attackers.operators-grid-wrapper').fadeOut();
        }
    })

    socket.on('message', function (msg) {
        console.log('msg: ', msg);
        var match = msg.match;
        if (match.id != getQueryVariable('id')) {return;}
        console.log('match recieved');

        match.votesOps.forEach((v, i) => {
            if (i<2) {//attackers
                $(`#B${i}`).css('top', 153.25*Math.floor(match.ops.atk.indexOf(v)/4));
                // console.log('index: ', match.ops.atk.indexOf(v));
                // console.log('top: ', Math.floor(match.ops.atk.indexOf(v)/4));
                // console.log('left: ', match.ops.atk.indexOf(v)%4);
                $(`#B${i}`).css('left', 153.33*(match.ops.atk.indexOf(v)%4));

                if (match.ops.topAtk.includes(v)) {
                    $(`.atk-pickrates-op${match.ops.topAtk.indexOf(v)}`).css('filter', 'grayscale(100%)');
                    $(`.atk-pickrates-op${match.ops.topAtk.indexOf(v)} >> i`).text('clear');
                }
            } else {//defenders
                $(`#B${i}`).css('top', 153.25*Math.floor(match.ops.def.indexOf(v)/4));
                // console.log('index: ', match.ops.def.indexOf(v));
                // console.log('top: ', Math.floor(match.ops.def.indexOf(v)/4));
                // console.log('left: ', match.ops.def.indexOf(v)%4);
                $(`#B${i}`).css('left', 153.33*(match.ops.def.indexOf(v)%4));
                if (match.ops.topDef.includes(v)) {
                    $(`.def-pickrates-op${match.ops.topDef.indexOf(v)}`).css('filter', 'grayscale(100%)');
                    $(`.def-pickrates-op${match.ops.topDef.indexOf(v)} >> i`).text('clear');
                }
            }
            $(`.ban-op${i} > .ban-ops-name`).text(v.toUpperCase());
            $(`.ban-op${i}`).css('background-image', `url(images/operators/${v}.png)`);
            $(`.ban-op${i}`).fadeIn();
            $(`#B${i}`).fadeIn();
        });
        
        // match.votes.forEach((v, i) => {
        //     //console.log(v);
        //     $(`#A${i}`).css('background-image', `url(images/maps/${v}.jpg)`);
        //     $(`#A${i} p`).text(match.pool.name[match.pool.id.indexOf(v)].toUpperCase());
        //     if (i < (9-mapAmount)) {
        //         $(`#A${i} i`).text('clear');
        //         $(`#A${i}`).addClass('team-action-red');
        //     } else if (i != 8) {
        //         $(`#A${i} i`).text('check');
        //         $(`#A${i}`).addClass('team-action-green');
        //     }
        //     if (i != 8) {
        //         $(`#overlay-${v} img`).attr('src', `images/teams/${match['code'+(i%2+1)]}.png`);
        //     }
        //     $(`#overlay-${v}`).fadeIn();
        //     $(`#A${i}`).fadeIn();
        // });
    });
});