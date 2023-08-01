"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.solveFixIt = exports.solveFindIt = exports.findChallengeById = exports.findChallengeByName = exports.notSolved = exports.sendNotification = exports.solve = exports.solveIf = void 0;
const sequelize_1 = require("sequelize");
const challenge_1 = require("../models/challenge");
const logger_1 = __importDefault(require("./logger"));
const config_1 = __importDefault(require("config"));
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const safe_1 = __importDefault(require("colors/safe"));
const utils = __importStar(require("./utils"));
const antiCheat_1 = require("./antiCheat");
const webhook = __importStar(require("./webhook"));
const accuracy = __importStar(require("./accuracy"));
const challenges = require('../data/datacache').challenges;
const notifications = require('../data/datacache').notifications;
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const solveIf = function (challenge, criteria, isRestore = false) {
    if ((0, exports.notSolved)(challenge) && criteria()) {
        (0, exports.solve)(challenge, isRestore);
    }
};
exports.solveIf = solveIf;
const solve = function (challenge, isRestore = false) {
    challenge.solved = true;
    challenge.save().then((solvedChallenge) => {
        logger_1.default.info(`${isRestore ? safe_1.default.grey('Restored') : safe_1.default.green('Solved')} ${solvedChallenge.difficulty}-star ${safe_1.default.cyan(solvedChallenge.key)} (${solvedChallenge.name})`);
        (0, exports.sendNotification)(solvedChallenge, isRestore);
        if (!isRestore) {
            const cheatScore = (0, antiCheat_1.calculateCheatScore)(challenge);
            if (process.env.SOLUTIONS_WEBHOOK) {
                webhook.notify(solvedChallenge, cheatScore).catch((error) => {
                    logger_1.default.error('Webhook notification failed: ' + safe_1.default.red(utils.getErrorMessage(error)));
                });
            }
        }
    });
};
exports.solve = solve;
const sendNotification = function (challenge, isRestore) {
    if (!(0, exports.notSolved)(challenge)) {
        const flag = utils.ctfFlag(challenge.name);
        const notification = {
            key: challenge.key,
            name: challenge.name,
            challenge: challenge.name + ' (' + entities.decode((0, sanitize_html_1.default)(challenge.description, { allowedTags: [], allowedAttributes: {} })) + ')',
            flag: flag,
            hidden: !config_1.default.get('challenges.showSolvedNotifications'),
            isRestore: isRestore
        };
        const wasPreviouslyShown = notifications.find(({ key }) => key === challenge.key) !== undefined;
        notifications.push(notification);
        if (global.io && (isRestore || !wasPreviouslyShown)) {
            // @ts-expect-error
            global.io.emit('challenge solved', notification);
        }
    }
};
exports.sendNotification = sendNotification;
const notSolved = (challenge) => challenge && !challenge.solved;
exports.notSolved = notSolved;
const findChallengeByName = (challengeName) => {
    for (const c in challenges) {
        if (Object.prototype.hasOwnProperty.call(challenges, c)) {
            if (challenges[c].name === challengeName) {
                return challenges[c];
            }
        }
    }
    logger_1.default.warn('Missing challenge with name: ' + challengeName);
};
exports.findChallengeByName = findChallengeByName;
const findChallengeById = (challengeId) => {
    for (const c in challenges) {
        if (Object.prototype.hasOwnProperty.call(challenges, c)) {
            if (challenges[c].id === challengeId) {
                return challenges[c];
            }
        }
    }
    logger_1.default.warn('Missing challenge with id: ' + challengeId);
};
exports.findChallengeById = findChallengeById;
const solveFindIt = async function (key, isRestore) {
    const solvedChallenge = challenges[key];
    await challenge_1.ChallengeModel.update({ codingChallengeStatus: 1 }, { where: { key, codingChallengeStatus: { [sequelize_1.Op.lt]: 2 } } });
    logger_1.default.info(`${isRestore ? safe_1.default.grey('Restored') : safe_1.default.green('Solved')} 'Find It' phase of coding challenge ${safe_1.default.cyan(solvedChallenge.key)} (${solvedChallenge.name})`);
    if (!isRestore) {
        accuracy.storeFindItVerdict(solvedChallenge.key, true);
        accuracy.calculateFindItAccuracy(solvedChallenge.key);
        await (0, antiCheat_1.calculateFindItCheatScore)(solvedChallenge);
    }
};
exports.solveFindIt = solveFindIt;
const solveFixIt = async function (key, isRestore) {
    const solvedChallenge = challenges[key];
    await challenge_1.ChallengeModel.update({ codingChallengeStatus: 2 }, { where: { key } });
    logger_1.default.info(`${isRestore ? safe_1.default.grey('Restored') : safe_1.default.green('Solved')} 'Fix It' phase of coding challenge ${safe_1.default.cyan(solvedChallenge.key)} (${solvedChallenge.name})`);
    if (!isRestore) {
        accuracy.storeFixItVerdict(solvedChallenge.key, true);
        accuracy.calculateFixItAccuracy(solvedChallenge.key);
        await (0, antiCheat_1.calculateFixItCheatScore)(solvedChallenge);
    }
};
exports.solveFixIt = solveFixIt;
//# sourceMappingURL=challengeUtils.js.map