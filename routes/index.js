var express = require('express');
var router = express.Router();
var controller = require('../src/controllers/index')

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// /* GET home page. */
// router.get('/test', function(req, res, next) {
//   res.render('index', { title: 'test' });
// });

router.get('/owners',controller.getOwners)

router.get('/solidity', controller.solidity_test);
router.post('/build',controller.build_contrat)

module.exports = router;
