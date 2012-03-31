var bridge = require(".."),
    assert = require("assert");

describe("getCurrentPhase", function () {

    it("returns completed if the game is finished", function (done) {
        var phase = bridge.getCurrentPhase({
            cards: ["C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "CT", "CJ", "CQ", "CK", "CA",
                    "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "DT", "DJ", "DQ", "DK", "DA",
                    "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "HT", "HJ", "HQ", "HK", "HA",
                    "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "ST", "SJ", "SQ", "SK", "SA"],
            bids: ["1H", "PASS", "PASS", "PASS"]
        });


        assert.equal(phase, "completed");
        done();
    });

    it("returns play if there are cards left", function (done) {
        var phase = bridge.getCurrentPhase({
            cards: ["C2"],
            bids: ["1H", "PASS", "PASS", "PASS"]
        });

        assert.equal(phase, "play");
        done();
    });

    it("returns auction if the auction is not finished", function (done) {
        var phase = bridge.getCurrentPhase({
            cards: [],
            bids: ["1H", "PASS", "PASS"]
        });

        assert.equal(phase, "auction");
        done();
    });
});
