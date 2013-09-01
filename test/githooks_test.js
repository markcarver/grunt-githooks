'use strict';

var fs = require('fs'),
    exec = require('child_process').exec,
    grunt = require('grunt');

// Load grunt configuration
require('../Gruntfile.js');

function addTest(testSuite, testID) {

  testSuite[testID] = function (test) {

    test.expect(2);
    var hookPath = 'tmp/' + testID + '/pre-commit';

    test.ok(fs.statSync(hookPath).mode.toString(8).match(/755$/), 'Should generate hook file with appropriate permissions (755)');

    var expected = grunt.file.read('test/expected/pre-commit.' + testID);
    var actual = grunt.file.read(hookPath);
    test.equal(actual, expected, 'Should create hook with appropriate content');
    test.done();
  };
}

/* Most of the testing is done by matching files generated by the `grunt githooks` calls 
 * to expected files stored in the `test/expected` folder of the project. 
 * Use the following naming conventions:
 *  - name the test tasks `test.<testID>`
 *  - name expected hook `pre-commit.<testID>`
 *  - set `dest` option of your task to `tmp/<testId>`
 */
exports.githooks = {

  'logs.defaultLogging': function (test) {

    test.expect(1);
    exec('grunt githooks:logs.defaultLogging', function(err, stdout) {

      test.notEqual(stdout.indexOf('Bound `jshint` to `pre-commit` Git hook'), -1);
      test.done();
    });


  },

  /*// Except for these tests related to the tasks log output
  'logs.warnIfHookNameDoesNotMatchGitHookName': function (test) {

    test.expect(1);
    exec('grunt githooks:log.warnIfHookNameDoesNotMatchGitHookName', function (err, stdout, stderr) {

      console.log(stdout.toString());
      test.done();
    });
  }*/
};

for (var target in grunt.config.data.githooks) {
  
  var TEST_TARGET = /^test.(.*)$/;
  var match = TEST_TARGET.exec(target);
  if (match) {
    addTest(exports.githooks, match[1]);
  }
}