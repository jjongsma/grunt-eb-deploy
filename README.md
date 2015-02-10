# grunt-eb-deploy

A simple Grunt task to replace `eb deploy` from the  Elastic Beanstalk CLI, which also allows deploying a
custom application distribution instead of the entire repository root.

To use this task, you should install the [AWS SDK CLI](http://aws.amazon.com/cli/) and configure your credentials
first with `aws configure`.

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-eb-deploy --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-eb-deploy');
```

## The "ebDeploy" task

### Overview
In your project's Gruntfile, add a section named `ebDeploy` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  ebDeploy: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### File Lists

`ebDeploy` uses `grunt-contrib-compress` internally to generate a ZIP archive before uploading it
to ElasticBeanstalk. For reference on how to specify file lists, please see the
[compress task documentation](https://github.com/gruntjs/grunt-contrib-compress)

### Options

#### options.region
Type: `String`
Default value: `us-east-1`

The AWS region to deploy the application to.

#### options.application
Type: `String`
Required: `true`

The ElasticBeanstalk application name.

#### options.environment
Type: `String`
Required: `true`

The ElasticBeanstalk application environment to update.

#### options.archive
Type: `String`
Default value: `.tmp/dist.zip`

The location of the ZIP archive to generate before uploading to ElasticBeanstalk.

#### options.profile
Type: `String`
Default: none

The local credential profile to use for the AWS SDK (see "Using Profiles with the SDK" section of the
 [Node AWS SDK docs](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html).)

### Usage Examples

#### Single Environment Deployment
Deploy to a single application environment.

```js
grunt.initConfig({
  ebDeploy: {
    options: {
		application: 'eb-test-app',
		environment: 'eb-test-app-dev'
	},
	files: [
	  { src: ['.ebextensions/*'] },
	  { cwd: 'dist/', src: ['**'], expand: true }
	]
  },
});
```

#### Multiple Environment Deployment
Deploy to multiple environments of an application.

```js
grunt.initConfig({
  ebDeploy: {
    options: {
		application: 'eb-test-app',
	},
	dev: {
		options: {
			environment: 'eb-test-app-dev'
		},
		files: [
		  { src: ['.ebextensions/*'] },
		  { cwd: 'dist/', src: ['**'], expand: true }
		]
	},
	prod: {
		options: {
			environment: 'eb-test-app-prod'
		},
		files: [
		  { src: ['.ebextensions/*'] },
		  { cwd: 'dist/', src: ['**'], expand: true }
		]
	},
  },
});
```

## Release History

#### 0.1.3 - Feb 10, 2015

Ok, so I'm new to this. Changed task name to match Grunt conventions.

#### 0.1.2 - Feb 10, 2015

Added ZIP archive generation.

#### 0.1.1 - Feb 10, 2015

Added credential profile support.

#### 0.1.0 - Feb 9, 2015

Initial release.
