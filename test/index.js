var bridge = require(".."),
    assert = require("assert");

describe("getCurrentPhase", function () {

    it("returns completed if a game is finished", function () {
        var state = {
            cards: ["C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "CT", "CJ", "CQ", "CK", "CA",
                    "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "DT", "DJ", "DQ", "DK", "DA",
                    "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "HT", "HJ", "HQ", "HK", "HA",
                    "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "ST", "SJ", "SQ", "SK", "SA"],
            bids: ["1H", "PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.getCurrentPhase(state), "completed");
    });

    it("returns completed when four passes given", function () {
        var state = {
            cards: [],
            bids: ["PASS", "PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.getCurrentPhase(state), "completed");
    });

    it("returns play if there are cards left", function () {
        var state = {
            cards: ["C2"],
            bids: ["1H", "PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.getCurrentPhase(state), "play");
    });

    it("returns auction if the auction is not finished", function () {
        var state = {
            cards: [],
            bids: ["1H", "PASS", "PASS"]
        };

        assert.equal(bridge.getCurrentPhase(state), "auction");
    });

    it("returns auction if three passes only", function () {
        var state = {
            cards: [],
            bids: ["PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.getCurrentPhase(state), "auction");
    });

    it("returns auction if no bids and no cards", function () {
        var state = {
            cards: [],
            bids: []
        };

        assert.equal(bridge.getCurrentPhase(state), "auction");
    });

});

describe("getContract", function () {

    it("returns contract in a finished auction", function () {
        var state = {
            bids: ["1H", "1S", "PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.getContract(state), "1S");
    });

    it("returns contract in an unfinished auction", function () {
        var state = {
            bids: ["7NT"]
        };

        assert.equal(bridge.getContract(state), "7NT");
    });

    it("returns contract with double modifier", function () {
        var state = {
            bids: ["1H", "1S", "X", "XX", "PASS", "PASS", "1NT", "PASS", "PASS", "X", "PASS"]
        };

        assert.equal(bridge.getContract(state), "1NTX");
    });

    it("returns contract with redouble modifier", function () {
        var state = {
            bids: ["1H", "1S", "PASS", "PASS", "2NT", "PASS", "PASS", "X", "PASS", "PASS", "XX"]
        };

        assert.equal(bridge.getContract(state), "2NTXX");
    });

    it("returns contract with redouble modifier", function () {
        var state = {
            bids: ["1H", "1S", "PASS", "PASS", "2NT", "PASS", "PASS", "X", "PASS", "PASS", "XX"]
        };

        assert.equal(bridge.getContract(state), "2NTXX");
    });

    it("returns undefined when four passes", function () {
        var state = {
            bids: ["PASS", "PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.getContract(state), undefined);
    });

});

describe("getDeclarer", function () {

    it("returns correct declarer when single bid in a suit was given", function () {
        var state = {
            dealer: "E",
            bids: ["1H", "PASS", "1S", "PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.getDeclarer(state), "W");
    });

    it("returns correct declarer when two bids in a suit was given", function () {
        var state = {
            dealer: "W",
            bids: ["1H", "PASS", "2H", "PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.getDeclarer(state), "W");
    });

    it("returns correct declarer when more bids in a suit was given in both sides", function () {
        var state = {
            dealer: "W",
            bids: ["1H", "2H", "3H", "4H", "5H", "6H", "PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.getDeclarer(state), "N");
    });

    it("returns undefined when no contract", function () {
        var state = {
            dealer: "N",
            bids: ["PASS", "PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.getDeclarer(state), undefined);
    });

});

describe("isBidAllowed", function () {

    it("returns true for the first pass", function () {
        var state = {
            cards: [],
            bids: []
        };

        assert.equal(bridge.isBidAllowed(state, "PASS"), true);
    });

    it("returns true for the first contract", function () {
        var state = {
            cards: [],
            bids: []
        };

        assert.equal(bridge.isBidAllowed(state, "1H"), true);
    });

    it("returns false for the first double", function () {
        var state = {
            cards: [],
            bids: []
        };

        assert.equal(bridge.isBidAllowed(state, "X"), false);
    });

    it("returns false for the first redouble", function () {
        var state = {
            cards: [],
            bids: []
        };

        assert.equal(bridge.isBidAllowed(state, "XX"), false);
    });

    it("returns false for lower bid than the current contract", function () {
        var state = {
            cards: [],
            bids: ["1NT"]
        };

        assert.equal(bridge.isBidAllowed(state, "1C"), false);
    });

    it("returns false for the same bid as the current contract", function () {
        var state = {
            cards: [],
            bids: ["1NT"]
        };

        assert.equal(bridge.isBidAllowed(state, "1NT"), false);
    });

    it("returns true for double given by the first opponent", function () {
        var state = {
            cards: [],
            bids: ["1NT"]
        };

        assert.equal(bridge.isBidAllowed(state, "X"), true);
    });

    it("returns true for double given by the second opponent", function () {
        var state = {
            cards: [],
            bids: ["1NT", "PASS", "PASS"]
        };

        assert.equal(bridge.isBidAllowed(state, "X"), true);
    });

    it("returns false for double given by the partner", function () {
        var state = {
            cards: [],
            bids: ["1NT", "PASS"]
        };

        assert.equal(bridge.isBidAllowed(state, "X"), false);
    });

    it("returns true for redouble given by the partner", function () {
        var state = {
            cards: [],
            bids: ["1NT", "X"]
        };

        assert.equal(bridge.isBidAllowed(state, "XX"), true);
    });

    it("returns false for redouble given by the first opponent", function () {
        var state = {
            cards: [],
            bids: ["1NT", "X", "PASS"]
        };

        assert.equal(bridge.isBidAllowed(state, "XX"), false);
    });

    it("returns true for redouble given by the declarer", function () {
        var state = {
            cards: [],
            bids: ["1NT", "X", "PASS", "PASS"]
        };

        assert.equal(bridge.isBidAllowed(state, "XX"), true);
    });

    it("returns true for redouble without double", function () {
        var state = {
            cards: [],
            bids: ["1NT"]
        };

        assert.equal(bridge.isBidAllowed(state, "XX"), false);
    });

    it("returns true for redouble with one pass, without double", function () {
        var state = {
            cards: [],
            bids: ["1NT", "PASS"]
        };

        assert.equal(bridge.isBidAllowed(state, "XX"), false);
    });

    it("returns true for redouble with two passes, without double", function () {
        var state = {
            cards: [],
            bids: ["1NT", "PASS", "PASS"]
        };

        assert.equal(bridge.isBidAllowed(state, "XX"), false);
    });

    it("returns false if the auction is finished", function () {
        var state = {
            cards: [],
            bids: ["1H", "PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.isBidAllowed(state, "PASS"), false);
    });

});

describe("getCurrentDirection", function () {

    it("returns dealer at the beginning", function () {
        var state = {
            dealer: "N",
            cards: [],
            bids: []
        };

        assert.equal(bridge.getCurrentDirection(state), "N");
    });

    it("returns delaer when four bids given", function () {
        var state = {
            dealer: "W",
            cards: [],
            bids: ["PASS", "1H", "PASS", "1S"]
        };

        assert.equal(bridge.getCurrentDirection(state), "W");
    });

});

describe("getTrickWinner", function () {

    it("returns undefined for an empty trick", function () {
        var state = {
            bids: ["1H", "PASS", "PASS", "PASS"],
            dealer: "W",
            cards: []
        };

        assert.equal(bridge.getTrickWinner(state, 0), undefined);
    });

    it("returns dealer for a single card first trick", function () {
        var state = {
            bids: ["1H", "PASS", "PASS", "PASS"],
            dealer: "W",
            cards: [("SA")]
        };

        assert.equal(bridge.getTrickWinner(state, 0), "N");
    });

    it("returns correct direction for a full first trick and no trump", function () {
        var state = {
            bids: ["1NT", "PASS", "PASS", "PASS"],
            dealer: "W",
            cards: ["S2", "C5", ("S3"), "D9"]
        };

        assert.equal(bridge.getTrickWinner(state, 0), "S");
    });

    it("returns correct direction for a full first trick and a single trump", function () {
        var state = {
            bids: ["1C", "PASS", "PASS", "PASS"],
            dealer: "E",
            cards: ["S2", ("C5"), "S3", "D9"]
        };

        assert.equal(bridge.getTrickWinner(state, 0), "W");
    });

    it("returns correct direction for a full first trick and two trumps", function () {
        var state = {
            bids: ["1C", "PASS", "PASS", "PASS"],
            dealer: "E",
            cards: ["S2", "C5", "S3", ("CA")]
        };

        assert.equal(bridge.getTrickWinner(state, 0), "E");
    });

    it("returns correct directions for a second trick", function () {
        var state = {
            bids: ["1C", "PASS", "PASS", "PASS"],
            dealer: "E",
            cards: ["S2",  "C5",  "S3", ("CA"),
                    "H2", ("H3"), "D4",  "S9"]
        };

        assert.equal(bridge.getTrickWinner(state, 0), "E");
        assert.equal(bridge.getTrickWinner(state, 1), "S");
    });

    it("returns undefined for an empty trick", function () {
        var state = {
            bids: ["1C", "PASS", "PASS", "PASS"],
            dealer: "E",
            cards: ["S2",  "C5",  "S3", ("CA")]
        };

        assert.equal(bridge.getTrickWinner(state, 3), undefined);
    });

    it("returns correct directions for a full game", function () {
        var state = {
            bids: ["1NT", "PASS", "PASS", "PASS"],
            dealer: "W",
            cards: [ "C2",   "C3",  "C4", ("C5"), //  0
                     "C6",   "C7",  "C8", ("C9"), //  1
                     "CT",   "CJ",  "CQ", ("CK"), //  2
                    ("CA"),  "D2",  "D3",  "D4",  //  3
                     "D5",   "D6",  "D7", ("D8"), //  4
                     "D9",   "DT",  "DJ", ("DQ"), //  5
                     "DK",  ("DA"), "H2",  "H3",  //  6
                     "H4",   "H5",  "H6", ("H7"), //  7
                     "H8",   "H9",  "HT", ("HJ"), //  8
                     "HQ",   "HK", ("HA"), "S2",  //  9
                     "S3",   "S4",  "S5", ("S6"), // 10
                     "S7",   "S8",  "S9", ("ST"), // 11
                     "SJ",   "SQ",  "SK", ("SA")] // 12
        };

        assert.equal(bridge.getTrickWinner(state,  0), "W");
        assert.equal(bridge.getTrickWinner(state,  1), "S");
        assert.equal(bridge.getTrickWinner(state,  2), "E");
        assert.equal(bridge.getTrickWinner(state,  3), "E");
        assert.equal(bridge.getTrickWinner(state,  4), "N");
        assert.equal(bridge.getTrickWinner(state,  5), "W");
        assert.equal(bridge.getTrickWinner(state,  6), "N");
        assert.equal(bridge.getTrickWinner(state,  7), "W");
        assert.equal(bridge.getTrickWinner(state,  8), "S");
        assert.equal(bridge.getTrickWinner(state,  9), "N");
        assert.equal(bridge.getTrickWinner(state, 10), "W");
        assert.equal(bridge.getTrickWinner(state, 11), "S");
        assert.equal(bridge.getTrickWinner(state, 12), "E");
    });
});

describe("getCurrentDirection", function () {

    it("returns dealer when no bids", function () {
        var state = {
            dealer: "N",
            cards: [],
            bids: []
        };

        assert.equal(bridge.getCurrentDirection(state), "N");
    });

    it("returns correct direction during auction", function () {
        var state = {
            dealer: "W",
            cards: [],
            bids: ["1C", "PASS"]
        };

        assert.equal(bridge.getCurrentDirection(state), "E");
    });

    it("returns first lead when no cards", function () {
        var state = {
            dealer: "W",
            cards: [],
            bids: ["1C", "PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.getCurrentDirection(state), "N");
    });

    it("returns correct player during play", function () {
        var state = {
            dealer: "W",
            cards: ["H2"],
            bids: ["1C", "PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.getCurrentDirection(state), "E");
    });

    it("returns correct player during play on the beginning of second trick", function () {
        var state = {
            dealer: "W",
            cards: ["H2", "H5", "HT", "H3"],
            bids: ["1C", "PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.getCurrentDirection(state), "S");
    });

    it("returns undefined when game is completed", function () {
        var state = {
            dealer: "W",
            bids: ["1C", "PASS", "PASS", "PASS"],
            cards: [ "C2",   "C3",  "C4", ("C5"), //  0
                     "C6",   "C7",  "C8", ("C9"), //  1
                     "CT",   "CJ",  "CQ", ("CK"), //  2
                    ("CA"),  "D2",  "D3",  "D4",  //  3
                     "D5",   "D6",  "D7", ("D8"), //  4
                     "D9",   "DT",  "DJ", ("DQ"), //  5
                     "DK",  ("DA"), "H2",  "H3",  //  6
                     "H4",   "H5",  "H6", ("H7"), //  7
                     "H8",   "H9",  "HT", ("HJ"), //  8
                     "HQ",   "HK", ("HA"), "S2",  //  9
                     "S3",   "S4",  "S5", ("S6"), // 10
                     "S7",   "S8",  "S9", ("ST"), // 11
                     "SJ",   "SQ",  "SK", ("SA")] // 12
        };

        assert.equal(bridge.getCurrentDirection(state), undefined);
    });

});

describe("isCardAllowed", function () {

    it("returns true if no cards played and player has card", function () {
        var state = {
            dealer: "N",
            deal: {
                e: ["H5"]
            },
            cards: [],
            bids: ["1C", "PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.isCardAllowed(state, "H5"), true);
    });

    it("returns false if no cards played and player does not have card", function () {
        var state = {
            dealer: "N",
            deal: {
                e: []
            },
            cards: [],
            bids: ["1C", "PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.isCardAllowed(state, "H5"), false);
    });

    it("returns true if player has card and card is in lead suit", function () {
        var state = {
            dealer: "N",
            deal: {
                s: ["C5"]
            },
            cards: ["C2"],
            bids: ["1C", "PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.isCardAllowed(state, "C5"), true);
    });

    it("returns true if player has card and card is not in lead suit, but player has no lead suit cards", function () {
        var state = {
            dealer: "N",
            deal: {
                s: ["H5"]
            },
            cards: ["C2"],
            bids: ["1C", "PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.isCardAllowed(state, "H5"), true);
    });

    it("returns false if player has card and card is not in lead suit, but player has lead suit cards", function () {
        var state = {
            dealer: "N",
            deal: {
                s: ["C8", "H5"]
            },
            cards: ["C2"],
            bids: ["1C", "PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.isCardAllowed(state, "H5"), false);
    });

    it("returns true if player has card and no lead given", function () {
        var state = {
            dealer: "N",
            deal: {
                s: ["C8", "H5"]
            },
            cards: ["C2", "C5", "D2", "SA"],
            bids: ["1C", "PASS", "PASS", "PASS"]
        };

        assert.equal(bridge.isCardAllowed(state, "H5"), true);
    });

});
