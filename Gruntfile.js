// Gruntfile wrapper function
module.exports = function(grunt){

	grunt.initConfig({

		// get the configuration info from package.json
		pkg: grunt.file.readJSON('package.json'),

		// jsHint to ensure JS code quality
		jshint: {
			options: {
				reporter: require('jshint-stylish') 
			},
			files: ['Gruntfile.js', 'src/js/*.js'] 
		}, 

		// SASS for CSS preprocessing
		sass: {
			build: {
				options: {
					compress: false,
				}, 
				files: {
					'public/styles/main.css': 'src/sass/styles.scss'
				}
			}
		},

		// Concat JS into a single file and make it public
		concat: {
			build: {
				src: ['src/js/*.js'],
				dest: 'public/js/all.js'
			}
		},


		// keep watch for code changes and automatically compile/hint/reload the page.
		watch: { 
			options: {
				livereload: true
			},
			js: {
				files: '<%= jshint.files %>',
				tasks: ['jshint', 'concat']
			}, 
			css: {
				files: 'src/sass/*.scss', 
				tasks: ['sass']
			}, 
			html: {
				files: 'public/index.html'
			}
		},



	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');


	grunt.registerTask('default', ['watch']);
};