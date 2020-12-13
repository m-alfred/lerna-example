const moduleB = require('@m_alfred/module-b');

function moduleA() {
  return 'it\'s module a version: 0.0.9';
}

console.log('moduleB:', moduleB());

module.exports = moduleA;
