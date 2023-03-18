/**
 * Extracts string from numeric-string value
 * @param {String} value
 * @returns {String}
 */
exports.extractString = (value) => value.replace(/[0-9.]/g, "");
