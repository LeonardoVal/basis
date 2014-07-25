﻿/** Gruntfile for [creatartis-base](http://github.com/LeonardoVal/creatartis-base).
*/
module.exports = function(grunt) {
	var SOURCE_FILES = ['src/__prologue__.js',
		'src/core.js', 'src/polyfill.js', 'src/objects.js',
		'src/text.js', 
		'src/typed.js', 'src/Initializer.js',
		'src/iterables.js', // iterators and FP utilities. 
		'src/Future.js', 'src/HttpRequest.js', 'src/Parallel.js', // asynchronism
		'src/Events.js', // functions.
		'src/Randomness.js', // math.
		'src/Chronometer.js', 'src/Statistic.js', 'src/Statistics.js', // statistic gathering.
		'src/Logger.js', // logging.
		'src/__epilogue__.js'];

	grunt.file.defaultEncoding = 'utf8';
// Init config. ////////////////////////////////////////////////////////////////
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat_sourcemap: { ////////////////////////////////////////////////////
			build: {
				src: SOURCE_FILES,
				dest: 'build/<%= pkg.name %>.js',
				options: {
					separator: '\n\n'
				}
			},
		},
		karma: { ///////////////////////////////////////////////////////////////
			options: {
				configFile: 'tests/karma.conf.js'
			},
			build: { browsers: ['PhantomJS'] },
			chrome: { browsers: ['Chrome'] },
			firefox: { browsers: ['Firefox'] },
			opera: { browsers: ['Opera'] },
			iexplore: { browsers: ['IE'] }
		},
		uglify: { //////////////////////////////////////////////////////////////
			build: {
				src: 'build/<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js',
				options: {
					banner: '//! <%= pkg.name %> <%= pkg.version %>\n',
					report: 'min',
					sourceMap: true,
					sourceMapIn: 'build/<%= pkg.name %>.js.map',
					sourceMapName: 'build/<%= pkg.name %>.min.js.map'
				}
			}
		},
		docker: { //////////////////////////////////////////////////////////////
			build: {
				src: ["src/**/*.js", "README.md"],
				dest: "docs/docker",
				options: {
					colourScheme: 'borland',
					ignoreHidden: true,
					exclude: 'src/__prologue__.js,src/__epilogue__.js'
				}
			}
		},
		bowercopy: { ///////////////////////////////////////////////////////////
			options: {
				clean: true,
				runBower: true,
				srcPrefix: 'bower_components'
			},
			lib: {
				options: {
					destPrefix: 'lib'
				},
				files: {
					'require.js': 'requirejs/require.js'
				},
			}
		}
	});
// Load tasks. /////////////////////////////////////////////////////////////////
	grunt.loadNpmTasks('grunt-concat-sourcemap');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-docker');
	grunt.loadNpmTasks('grunt-bowercopy');
// Register tasks. /////////////////////////////////////////////////////////////
	grunt.registerTask('compile', ['concat_sourcemap:build', 'uglify:build']); 
	grunt.registerTask('build', ['concat_sourcemap:build', 'karma:build', 
		'uglify:build', 'docker:build']);
	grunt.registerTask('default', ['build']);
	grunt.registerTask('test', ['concat_sourcemap:build', 'karma:build', 
		'karma:chrome', 'karma:firefox', /*'karma:opera',*/ 'karma:iexplore']);
	grunt.registerTask('lib', ['bowercopy:lib']);
};