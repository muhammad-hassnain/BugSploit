"use strict";
/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
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
const fs = require("fs");
const config_1 = __importDefault(require("config"));
const utils = __importStar(require("../utils"));
const replace = require('replace');
const customizeApplication = () => {
    if (config_1.default.get('application.name')) {
        customizeTitle();
    }
    if (config_1.default.get('application.logo')) {
        void customizeLogo();
    }
    if (config_1.default.get('application.favicon')) {
        void customizeFavicon();
    }
    if (config_1.default.get('application.theme')) {
        customizeTheme();
    }
    if (config_1.default.get('application.cookieConsent')) {
        customizeCookieConsentBanner();
    }
    if (config_1.default.get('application.promotion')) {
        void customizePromotionVideo();
        void customizePromotionSubtitles();
    }
    if (config_1.default.get('hackingInstructor')) {
        void customizeHackingInstructorAvatar();
    }
    if (config_1.default.get('application.chatBot')) {
        void customizeChatbotAvatar();
    }
};
const customizeLogo = async () => {
    await retrieveCustomFile('application.logo', 'frontend/dist/frontend/assets/public/images');
};
const customizeChatbotAvatar = async () => {
    const avatarImage = await retrieveCustomFile('application.chatBot.avatar', 'frontend/dist/frontend/assets/public/images');
    fs.copyFileSync('frontend/dist/frontend/assets/public/images/' + avatarImage, 'frontend/dist/frontend/assets/public/images/ChatbotAvatar.png');
};
const customizeHackingInstructorAvatar = async () => {
    const avatarImage = await retrieveCustomFile('hackingInstructor.avatarImage', 'frontend/dist/frontend/assets/public/images');
    fs.copyFileSync('frontend/dist/frontend/assets/public/images/' + avatarImage, 'frontend/dist/frontend/assets/public/images/hackingInstructor.png');
};
const customizeFavicon = async () => {
    const favicon = await retrieveCustomFile('application.favicon', 'frontend/dist/frontend/assets/public');
    replace({
        regex: /type="image\/x-icon" href="assets\/public\/.*"/,
        replacement: `type="image/x-icon" href="assets/public/${favicon}"`,
        paths: ['frontend/dist/frontend/index.html'],
        recursive: false,
        silent: true
    });
};
const customizePromotionVideo = async () => {
    await retrieveCustomFile('application.promotion.video', 'frontend/dist/frontend/assets/public/videos');
};
const customizePromotionSubtitles = async () => {
    await retrieveCustomFile('application.promotion.subtitles', 'frontend/dist/frontend/assets/public/videos');
};
const retrieveCustomFile = async (sourceProperty, destinationFolder) => {
    let file = config_1.default.get(sourceProperty);
    if (utils.isUrl(file)) {
        const filePath = file;
        file = utils.extractFilename(file);
        await utils.downloadToFile(filePath, destinationFolder + '/' + file);
    }
    return file;
};
const customizeTitle = () => {
    const title = `<title>${config_1.default.get('application.name')}</title>`;
    replace({
        regex: /<title>.*<\/title>/,
        replacement: title,
        paths: ['frontend/dist/frontend/index.html'],
        recursive: false,
        silent: true
    });
};
const customizeTheme = () => {
    const bodyClass = '"mat-app-background ' + config_1.default.get('application.theme') + '-theme"';
    replace({
        regex: /"mat-app-background .*-theme"/,
        replacement: bodyClass,
        paths: ['frontend/dist/frontend/index.html'],
        recursive: false,
        silent: true
    });
};
const customizeCookieConsentBanner = () => {
    const popupProperty = '"popup": { "background": "' + config_1.default.get('application.cookieConsent.backgroundColor') + '", "text": "' + config_1.default.get('application.cookieConsent.textColor') + '" }';
    replace({
        regex: /"popup": { "background": ".*", "text": ".*" }/,
        replacement: popupProperty,
        paths: ['frontend/dist/frontend/index.html'],
        recursive: false,
        silent: true
    });
    const buttonProperty = '"button": { "background": "' + config_1.default.get('application.cookieConsent.buttonColor') + '", "text": "' + config_1.default.get('application.cookieConsent.buttonTextColor') + '" }';
    replace({
        regex: /"button": { "background": ".*", "text": ".*" }/,
        replacement: buttonProperty,
        paths: ['frontend/dist/frontend/index.html'],
        recursive: false,
        silent: true
    });
    const contentProperty = '"content": { "message": "' + config_1.default.get('application.cookieConsent.message') + '", "dismiss": "' + config_1.default.get('application.cookieConsent.dismissText') + '", "link": "' + config_1.default.get('application.cookieConsent.linkText') + '", "href": "' + config_1.default.get('application.cookieConsent.linkUrl') + '" }';
    replace({
        regex: /"content": { "message": ".*", "dismiss": ".*", "link": ".*", "href": ".*" }/,
        replacement: contentProperty,
        paths: ['frontend/dist/frontend/index.html'],
        recursive: false,
        silent: true
    });
};
module.exports = customizeApplication;
//# sourceMappingURL=customizeApplication.js.map