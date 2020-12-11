'use strict';
const moduleB = require('@alfred/module-b');
console.log('moduleB:', moduleB());

module.exports = moduleA;

function moduleA() {
    return 'it\'s module a';
}
