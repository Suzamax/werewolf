module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: [
                    {
                        expand: true,
                        cwd: './src/assets/sass',
                        src: ['*.sass'],
                        dest: './dist/public/css',
                        ext: '.css'
                    }
                ]
            }
        },
        copy: {
            build: {
                files: [
                    {
                        expand: true,
                        cwd: './public',
                        src: ['**'],
                        dest: './dist/public'
                    },
                    {
                        expand: true,
                        cwd: './src/views',
                        src: ['**'],
                        dest: './dist/views'
                    }
                ]
            }
        },
        ts: {
            app: {
                files: [
                    {
                        src: ['src/**/*.ts', '!src/.baseDir.ts'],
                        dest: './dist'
                    }
                ],
                tsconfig: true
            }
        },
        watch: {
            ts: {
                files: ['src/**/*.ts'],
                tasks: ['ts']
            },
            views: {
                files: ['src/views/**/*.pug'],
                tasks: ['copy']
            },
            sass: {
                files: ['src/assets/sass/*.sass'],
                tasks: ['sass']
            },

        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-ts');

    grunt.registerTask('default', ['copy', 'ts', 'sass']);
};