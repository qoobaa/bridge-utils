// GAME STATE FORMAT
//
// state = {
//     deal: {
//         n: ["HA", "..."],
//         e: ["DA", "..."],
//         s: ["SA", "..."],
//         w: ["CA", "..."]
//     },
//     vulnerability: "BOTH",
//     dealer: "E",
//     bids: ["PASS", "1C", "X", "..."],
//     cards: ["HA", "H2", "..."]
// };

// public

var isBidAllowed = function (state, bid) {
    if (getCurrentPhase(state) !== "auction") {
        return false;
    }

    var contract = getContract(state),
        contractWithoutModifier = contract && contract.replace(/X/g, ""),
        modifier = contract && contract.replace(/[^X]/g, "");

    if (isContract(bid)) {
        return CONTRACTS.indexOf(bid) > CONTRACTS.indexOf(contractWithoutModifier);
    } else if (bid === "X") {
        return modifier === "" && state.bids.indexOf(contractWithoutModifier) % 2 !== state.bids.length % 2;
    } else if (bid === "XX") {
        return modifier === "X" && state.bids.indexOf(contractWithoutModifier) % 2 === state.bids.length % 2;
    } else {
        return bid === "PASS";
    };
};

var isCardAllowed = function (state, card) {
    if (getCurrentPhase(state) !== "play") {
        return false;
    }

    var currentDirection = getCurrentDirection(state),
        lead = state.cards[Math.floor(state.cards.length / 4) * 4],
        hand = state.deal[currentDirection.toLowerCase()],
        hasCard = hand.indexOf(card) !== -1,
        hasLeadSuit = hand.filter(function (card) {
            return lead && card[0] === lead[0];
        }).length > 0;

    return hasCard && state.cards.indexOf(card) === -1 && (!hasLeadSuit || card[0] === lead[0]);
};

var getCurrentDirection = function (state) {
    switch (getCurrentPhase(state)) {
    case "play":
        var currentTrickNumber = Math.floor(state.cards.length / 4),
            previousTrickWinner = getTrickWinner(state, currentTrickNumber - 1);

        return incrementDirection(previousTrickWinner, state.cards.length);
    case "auction":
        return incrementDirection(state.dealer, state.bids.length);
    default:
        return undefined;
    }
};

var getTrickWinner = function (state, number) {
    if (number >= 0) {
        var contract = getContract(state),
            trick = state.cards.slice(number * 4, number * 4 + 4);

        var trumps = trick.filter(function (card) {
            return card[0] === contract[1];
        }).sort(compareCards);

        var cards = trick.filter(function (card) {
            return card[0] === trick[0][0];
        }).sort(compareCards);

        var card = trumps[trumps.length - 1] || cards[cards.length - 1],
            previousWinner = getTrickWinner(state, number - 1);

        return card && incrementDirection(previousWinner, trick.indexOf(card));
    } else {
        return getFirstLead(state);
    }
};

var getCurrentPhase = function (state) {
    if (state.cards.length === 52 || (state.bids.length === 4 && state.bids.every(isPass))) {
        return "completed";
    } else if (state.bids.length > 3 && state.bids.slice(-3).every(isPass)) {
        return "play";
    } else {
        return "auction";
    }
};

var getContract = function (state) {
    var contracts = state.bids.filter(isContract),
        lastContract = contracts[contracts.length - 1],
        modifiers = state.bids.slice(state.bids.indexOf(lastContract) + 1).filter(isModifier),
        modifier = modifiers[modifiers.length - 1];

    return modifier ? lastContract + modifier : lastContract;
};

var getDeclarer = function (state) {
    var contract = getContract(state);

    if (contract) {
        var side = state.bids.indexOf(contract.replace(/X/g, "")) % 2,
            first = state.bids.filter(function (bid, i) {
                return bid[1] === contract[1] && i % 2 === side;
            })[0];

        return incrementDirection(state.dealer, state.bids.indexOf(first));
    } else {
        return undefined;
    }
};

var getDummy = function (state) {
    var declarer = getDeclarer(state);

    return incrementDirection(declarer, 2);
};

var getCurrentHands = function (state, trump) {
    var result = {};

    Object.keys(state.deal).forEach(function (direction) {
        var suitsOrder = getSuitsOrder(state.deal[direction.toLowerCase()], trump);

        result[direction.toLowerCase()] = state.deal[direction.toLowerCase()].filter(function (card) {
            return state.cards.indexOf(card) === -1;
        }).sort(compareCards.bind(this, suitsOrder)).reverse();
    });

    return result;
};

var getCurrentPlayer = function (state) {
    var direction = getCurrentDirection(state),
        dummy = getDummy(state);

    return direction === dummy ? incrementDirection(direction, 2) : direction;
};

// private

var getSuitsOrder = function (cards, trump) {
    var suits = getSuits(cards);

    switch (trump) {
    case "C":
        if (suits.h.length >= suits.d.length) {
            return ["D", "S", "H", "C"];
        } else {
            return ["H", "S", "D", "C"];
        }
    case "D":
        if (suits.s.length >= suits.c.length) {
            return ["C", "H", "S", "D"];
        } else {
            return ["S", "H", "C", "D"];
        }
    case "H":
        if (suits.s.length >= suits.c.length) {
            return ["C", "D", "S", "H"];
        } else {
            return ["S", "D", "C", "H"];
        }
    case "S":
        if (suits.h.length >= suits.d.length) {
            return ["D", "C", "H", "S"];
        } else {
            return ["H", "C", "D", "S"];
        }
    default:
        var result = ["C", "D", "H", "S"].sort(function (a, b) {
            return suits[a.toLowerCase()].length - suits[b.toLowerCase()].length;
        });

        if (isSameColor(result[2], result[3])) {
            result.unshift(result.splice(2, 1)[0]);
        }

        if (isSameColor(result[1], result[2])) {
            result.unshift(result.splice(1, 1)[0]);
        }

        return result;
    }
};

var isSameColor = function (a, b) {
    return a === "C" && b === "S"
        || a === "S" && b === "C"
        || a === "D" && b === "H"
        || a === "H" && b === "D";
};

var getSuits = function (cards) {
    var result = {};

    ["C", "D", "H", "S"].forEach(function (suit) {
        result[suit.toLowerCase()] = cards.filter(function (card) {
            return card[0] === suit;
        });
    });

    return result;
};

var incrementDirection = function (direction, number) {
    return DIRECTIONS[(DIRECTIONS.indexOf(direction) + number) % 4];
};

var getFirstLead = function (state) {
    var declarer = getDeclarer(state);

    return incrementDirection(declarer, 1);
};

var isPass = function (bid) {
    return bid === "PASS";
};

var CONTRACTS = ["1C", "1D", "1H", "1S", "1NT",
                 "2C", "2D", "2H", "2S", "2NT",
                 "3C", "3D", "3H", "3S", "3NT",
                 "4C", "4D", "4H", "4S", "4NT",
                 "5C", "5D", "5H", "5S", "5NT",
                 "6C", "6D", "6H", "6S", "6NT",
                 "7C", "7D", "7H", "7S", "7NT"];

var isContract = function (bid) {
    return CONTRACTS.indexOf(bid) !== -1;
};

var isModifier = function (bid) {
    return bid === "X" || bid === "XX";
};

var DIRECTIONS = ["N", "E", "S", "W"];

var CARDS = ["C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "CT", "CJ", "CQ", "CK", "CA",
             "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "DT", "DJ", "DQ", "DK", "DA",
             "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "HT", "HJ", "HQ", "HK", "HA",
             "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "ST", "SJ", "SQ", "SK", "SA"];

var compareCards = function (suitsOrder, a, b) {
    if (b === undefined) {
        b = a;
        a = suitsOrder;
        suitsOrder = [];
    }

    return (CARDS.indexOf(a) + suitsOrder.indexOf(a[0]) * 100) - (CARDS.indexOf(b) + suitsOrder.indexOf(b[0]) * 100);
};

module.exports = {
    getContract: getContract,
    getCurrentPhase: getCurrentPhase,
    getDeclarer: getDeclarer,
    isBidAllowed: isBidAllowed,
    isCardAllowed: isCardAllowed,
    getCurrentDirection: getCurrentDirection,
    getTrickWinner: getTrickWinner,
    getDummy: getDummy,
    getCurrentHands: getCurrentHands,
    getCurrentPlayer: getCurrentPlayer
};
