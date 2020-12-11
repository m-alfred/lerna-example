'use strict';
const moduleB = require('module-b');
console.log('moduleB:', moduleB());

module.exports = moduleA;

function moduleA() {
    return 'it\'s module a';
}
