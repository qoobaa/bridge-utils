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

};

var isCardAllowed = function (state, card) {

};

var getCurrentDirection = function (state) {

};

var getCurrentPhase = function (state) {
    if (state.cards.length === 52) {
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
        modifiers = state.bids.slice(state.bids.indexOf(lastContract) + 1).filter(isModifier);

    return lastContract + (modifiers[modifiers.length - 1] || "");
};

// private

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

// var compareContracts = function (a, b) {
//     return CONTRACTS.indexOf(a) - CONTRACTS.indexOf(b);
// };

var isModifier = function (bid) {
    return bid === "X" || bid === "XX";
};

module.exports = {
    getContract: getContract,
    getCurrentPhase: getCurrentPhase
};
