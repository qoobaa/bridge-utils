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

};

var getCurrentDirection = function (state) {
    switch (getCurrentPhase(state)) {
    case "play":
        var contract = getContract(state),
            trump = contract[1],
            currentTrickNumber = Math.floor(state.cards.length / 4),
            currentTrick = state.cards.slice(currentTrick * 4, currentTrick * 4 + 4);



        return undefined;
    case "auction":
        return DIRECTIONS[(state.bids.length + DIRECTIONS.indexOf(state.dealer)) % 4];
    default:
        return undefined;
    }
};

var getTrickWinner = function (state, number) {
    var contract = getContract(state),
        trick = state.cards.slice(number * 4, number * 4 + 4);

    var trumps = trick.filter(function (card) {
        return card[0] === contract[1];
    }).sort(compareCards);

    var cards = trick.filter(function (card) {
        return card[0] === trick[0][0];
    }).sort(compareCards);

    var card = trumps[trumps.length - 1] || cards[cards.length - 1],
        previousWinner = number ? getTrickWinner(state, number - 1) : getFirstLead(state);

    return card && DIRECTIONS[(DIRECTIONS.indexOf(previousWinner) + trick.indexOf(card)) % 4];
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

var getContract = function (state, skipModifier) {
    var contracts = state.bids.filter(isContract),
        lastContract = contracts[contracts.length - 1],
        modifiers = state.bids.slice(state.bids.indexOf(lastContract) + 1).filter(isModifier),
        modifier = modifiers[modifiers.length - 1];

    return (modifier && !skipModifier) ? lastContract + modifier : lastContract;
};

var getDeclarer = function (state) {
    var contract = getContract(state, true);

    if (contract) {
        var side = state.bids.indexOf(contract) % 2,
            first = state.bids.filter(function (bid, i) {
                return bid[1] === contract[1] && i % 2 === side;
            })[0];

        return DIRECTIONS[(state.bids.indexOf(first) + DIRECTIONS.indexOf(state.dealer)) % 4];
    } else {
        return undefined;
    }
};

// private

var getFirstLead = function (state) {
    var declarer = getDeclarer(state);

    return DIRECTIONS[(DIRECTIONS.indexOf(declarer) + 1) % 4];
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

// var compareContracts = function (a, b) {
//     return CONTRACTS.indexOf(a) - CONTRACTS.indexOf(b);
// };

var DIRECTIONS = ["N", "E", "S", "W"];

var CARDS = ["C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "CT", "CJ", "CQ", "CK", "CA",
             "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "DT", "DJ", "DQ", "DK", "DA",
             "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "HT", "HJ", "HQ", "HK", "HA",
             "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "ST", "SJ", "SQ", "SK", "SA"];

var compareCards = function (a, b) {
    return CARDS.indexOf(a) - CARDS.indexOf(b);
};

module.exports = {
    getContract: getContract,
    getCurrentPhase: getCurrentPhase,
    getDeclarer: getDeclarer,
    isBidAllowed: isBidAllowed,
    getCurrentDirection: getCurrentDirection,
    getTrickWinner: getTrickWinner
};
