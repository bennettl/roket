module.exports = (grunt) ->
    grunt.initConfig(
        pkg: grunt.file.readJSON('package.json')
        coffee:
            files:
                src: ['krave/src/js/**/*.coffee']
                dest: 'krave/assets/js/script.js'
    )
    
    grunt.loadNpmTasks('grunt-contrib-coffee')
    
    grunt.registerTask('default', ['coffee'])
