function moduleB() {
  return 'it\'s module b';
}

const _ = require('lodash');

function testLodash() {
  return JSON.stringify(_.assign({ a: 1 }, { name: 'alfred' }));
}
const data = testLodash();
console.log(`data: ${data} in module b`);

module.exports = moduleB;
