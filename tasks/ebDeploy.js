/*
 * grunt-eb-deploy
 * https://github.com/jjongsma/grunt-eb-deploy
 *
 * Copyright (c) 2015 Jeremy Jongsma
 * Licensed under the MIT license.
 */

'use strict';

var AWS = require('aws-sdk');
var git = require('git-rev');
var fs = require('fs');

module.exports = function(grunt) {

  var compress = require('grunt-contrib-compress/tasks/lib/compress')(grunt);

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('ebDeploy', 'ElasticBeanstalk deployment', function() {

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      archive: '.tmp/dist.zip',
      region: 'us-east-1'
    });

    compress.options = {
      archive: options.archive,
      mode: 'zip',
      level: 1
    };

    var done = this.async();

    // First use grunt-contrib-compress to build an archive
    compress.tar(this.files, function() {

      if (options.profile) {
        AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: options.profile });
        console.log('Using credentials from profile \'' + options.profile + '\'');
      }

      var iam = new AWS.IAM();

      iam.getUser({}, function(err, data) {

        if (err) {

          console.log(err);
          done(false);

        } else {

          git.short(function(rev) { 

            var date = new Date();
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            var d = date.getDate();

            var version = String(y) +
              String(m = (m < 10) ? ('0' + m) : m) +
              String(d = (d < 10) ? ('0' + d) : d) +
              '-' + rev +
              '-' + Math.floor((Math.random() * 899999) + 100000);

            var label = options.application + '-' + version;

            var account = data.User.Arn.split(/:/)[4];
            var bucket = 'elasticbeanstalk-' + options.region + '-' + account;

            var body = fs.createReadStream(options.archive);
            var s3obj = new AWS.S3({ params: { Bucket: bucket, Key: label + '.zip' } });

            console.log('Uploading application bundle');
            s3obj.upload({ Body: body }).send(function(err, data) {

              if (err) {
                console.log(err);
                done(false);
              } else {

                console.log('Creating application version \'' + label + '\'');
                var eb = new AWS.ElasticBeanstalk({ region: options.region });

                eb.createApplicationVersion({
                  ApplicationName: options.application,
                  VersionLabel: label,
                  SourceBundle: {
                    S3Bucket: bucket,
                    S3Key: label + '.zip'
                  }
                }, function (err, data) {

                  if (err) {
                    console.log(err);
                    done(false);
                  } else {

                    console.log('Updating environment \'' + options.environment + '\' to version \'' + label + '\'');
                    eb.updateEnvironment({
                      EnvironmentName: options.environment,
                      VersionLabel: label
                    }, function (err, data) {
                      if (err) {
                        console.log(err);
                        done(false);
                      } else {
                        console.log('Environment update running, please check AWS console for progress');
                        done();
                      }
                    });

                  }

                });

              }

            });

          });

        }

      });

    });

  });

};
