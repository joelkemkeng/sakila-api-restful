"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogError = exports.LogErrorWithTag = exports.LogWarn = exports.LogWarnWithTag = exports.Log = exports.LogWithTag = void 0;
const winston_1 = require("winston");
const logger = (0, winston_1.createLogger)({
    level: 'info',
    format: (process.env.NODE_ENV === 'prod' ? winston_1.format.json() : winston_1.format.simple()),
    transports: [
        new winston_1.transports.Console({})
    ]
});
const constructMeta = (tag, data) => {
    const meta = {
        tag
    };
    if (data) {
        meta.details = data;
    }
    return meta;
};
const _Log = (level, tag, message, data) => {
    logger.log(level, message, constructMeta(tag, data));
};
const LogWithTag = (tag, message, data) => {
    _Log('info', tag, message, data);
};
exports.LogWithTag = LogWithTag;
const Log = (message, data) => {
    (0, exports.LogWithTag)('exec', message, data);
};
exports.Log = Log;
const LogWarnWithTag = (tag, message, data) => {
    _Log('warn', tag, message, data);
};
exports.LogWarnWithTag = LogWarnWithTag;
const LogWarn = (message, data) => {
    (0, exports.LogWarnWithTag)('exec', message, data);
};
exports.LogWarn = LogWarn;
const LogErrorWithTag = (tag, message, data) => {
    _Log('error', tag, message, data);
};
exports.LogErrorWithTag = LogErrorWithTag;
const LogError = (message, data) => {
    (0, exports.LogErrorWithTag)('exec', message, data);
};
exports.LogError = LogError;
