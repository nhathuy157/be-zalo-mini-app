// utils/xmlUtils.js

import xml2js from 'xml2js';

// Chuyển đổi XML sang JSON
async function parseXML(xml) {
  const parser = new xml2js.Parser();
  return parser.parseStringPromise(xml);
}

export default parseXML;
