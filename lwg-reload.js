/*
 lwg-reload
 A live-AI reloader for http://www.littlewargame.com/ AI development.

 Author Greg Kindel https://github.com/gkindel/  2016

 Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 */
(function (self) {

    var URL = "http://workspace/ai_lwg/main.js";
    var INTERVAL_MS = 5 * 1000;

    if (!self.init)
        self.init = init();

    tick(scope);

    function tick(scope) {
        var time = now();
        if (!self.lastPoll || time > self.lastPoll + INTERVAL_MS) {
            self.lastPoll = time;
            poll();
        }
        try {
            game_tick(scope);
        }
        catch (e) {
            console.error(e);
        }
    }

    function init() {
        self.player = "Player " + scope.getMyPlayerNumber();
        return true;
    }

    function game_tick(scope) {
        if (self.ai && self.ai.update)
            self.ai.update(scope);
    }

    function now() {
        return (new Date()).getTime();
    }

    function poll() {
        if (self.request)
            return;

        self.request = get(URL, function (src) {
            if (src != self.src) {
                self.src = src;
                try {
                    self.ai = {
                        counter: 0,
                        update: __eval(src)
                    };
                    console.log("UPDATE: new AI loaded for " + self.player);
                }
                catch (e) {
                    console.error(e);
                }
            }
            self.request = null;
        })
    }

    function get(url, callback) {
        var r = new XMLHttpRequest();
        r.open("GET", url, true);
        r.onreadystatechange = function () {
            if (r.readyState != 4)
                return;
            if (r.status != 200)
                return;
            callback(r.responseText);
        };
        r.send();
        return r;
    }
})(this);

// wrapped externally for better variable isolation
function __eval(src) {
    var __FN__;
    return eval("__FN__ = function () {" + src + "}");
}

