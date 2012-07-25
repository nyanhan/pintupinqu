var WIN = /win/i.test(process.platform) && !/darwin/i.test(process.platform);

exports.WIN = WIN;
exports.EOF = WIN ? "\r\n" : "\n";
exports.SLASH = WIN ? "\\" : "/" ;