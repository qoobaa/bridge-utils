var bridge = require(".."),
    assert = require("assert");

describe("getCurrentPhase", function () {

    it("returns completed if a game is finished", function () {
        var phase = bridge.getCurrentPhase({
            cards: ["C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "CT", "CJ", "CQ", "CK", "CA",
                    "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "DT", "DJ", "DQ", "DK", "DA",
                    "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "HT", "HJ", "HQ", "HK", "HA",
                    "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "ST", "SJ", "SQ", "SK", "SA"],
            bids: ["1H", "PASS", "PASS", "PASS"]
        });

        assert.equal(phase, "completed");
    });

    it("returns play if there are cards left", function () {
        var phase = bridge.getCurrentPhase({
            cards: ["C2"],
            bids: ["1H", "PASS", "PASS", "PASS"]
        });

        assert.equal(phase, "play");
    });

    it("returns auction if the auction is not finished", function () {
        var phase = bridge.getCurrentPhase({
            cards: [],
            bids: ["1H", "PASS", "PASS"]
        });

        assert.equal(phase, "auction");
    });

    it("returns auction if three passes only", function () {
        var phase = bridge.getCurrentPhase({
            cards: [],
            bids: ["PASS", "PASS", "PASS"]
        });

        assert.equal(phase, "auction");
    });

    it("returns auction if no bids and no cards", function () {
        var phase = bridge.getCurrentPhase({
            cards: [],
            bids: []
        });

        assert.equal(phase, "auction");
    });

});

describe("getContract", function () {

    it("returns contract in a finished auction", function () {
        var contract = bridge.getContract({
            bids: ["1H", "1S", "PASS", "PASS", "PASS"]
        });

        assert.equal(contract, "1S");
    });

    it("returns contract in an unfinished auction", function () {
        var contract = bridge.getContract({
            bids: ["7NT"]
        });

        assert.equal(contract, "7NT");
    });

    it("returns contract with double modifier", function () {
        var contract = bridge.getContract({
            bids: ["1H", "1S", "X", "XX", "PASS", "PASS", "1NT", "PASS", "PASS", "X", "PASS"]
        });

        assert.equal(contract, "1NTX");
    });

    it("returns contract with redouble modifier", function () {
        var contract = bridge.getContract({
            bids: ["1H", "1S", "PASS", "PASS", "2NT", "PASS", "PASS", "X", "PASS", "PASS", "XX"]
        });

        assert.equal(contract, "2NTXX");
    });

    it("returns contract with redouble modifier", function () {
        var contract = bridge.getContract({
            bids: ["1H", "1S", "PASS", "PASS", "2NT", "PASS", "PASS", "X", "PASS", "PASS", "XX"]
        });

        assert.equal(contract, "2NTXX");
    });

    it("returns undefined when four passes", function () {
        var contract = bridge.getContract({
            bids: ["PASS", "PASS", "PASS", "PASS"]
        });

        assert.equal(contract, undefined);
    });

});

describe("getDeclarer", function () {

    it("returns correct declarer when single bid in a suit was given", function () {
        var declarer = bridge.getDeclarer({
            dealer: "E",
            bids: ["1H", "PASS", "1S", "PASS", "PASS", "PASS"]
        });

        assert.equal(declarer, "W");
    });

    it("returns correct declarer when two bids in a suit was given", function () {
        var declarer = bridge.getDeclarer({
            dealer: "W",
            bids: ["1H", "PASS", "2H", "PASS", "PASS", "PASS"]
        });

        assert.equal(declarer, "W");
    });

    it("returns correct declarer when more bids in a suit was given in both sides", function () {
        var declarer = bridge.getDeclarer({
            dealer: "W",
            bids: ["1H", "2H", "3H", "4H", "5H", "6H", "PASS", "PASS", "PASS"]
        });

        assert.equal(declarer, "N");
    });

    it("returns undefined when no contract", function () {
        var declarer = bridge.getDeclarer({
            dealer: "N",
            bids: ["PASS", "PASS", "PASS", "PASS"]
        });

        assert.equal(declarer, undefined);
    });

});
