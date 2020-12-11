const moduleB = require('@m_alfred/module-b');

function moduleA() {
  return 'it\'s module a';
}

console.log('moduleB:', moduleB());

module.exports = moduleA;
