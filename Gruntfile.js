module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      dist: {
        src: [
          'lib/melonJS-<%= pkg.version %>.js',
          'lib/plugins/*.js',
          'js/game.js',
          'build/js/resources.js',
          'js/**/*.js',
        ],
        dest: 'build/js/app.js'
      }
    },

    copy: {
      dist: {
        files: [{
          src: 'index.css',
          dest: 'build/index.css'
        },{
          src: 'main.js',
          dest: 'build/main.js'
        },{
          src: 'pirates-server.js',
          dest: 'build/pirates-server.js'
        },{
          src: 'manifest.json',
          dest: 'build/manifest.json'
        },{
          src: 'package.json',
          dest: 'build/package.json'
        },{
          src: 'data/**/*',
          dest: 'build/',
          expand: true
        },{
          src: 'icons/*',
          dest: 'build/',
          expand: true
        },{
          src: 'server/**/*',
          dest: 'build/'
        }]
      }
    },

    clean: {
      app: ['build/js/app.js'],
      dist: ['build/','bin/'],
    },

    processhtml: {
      dist: {
        options: {
          process: true,
          data: {
            title: '<%= pkg.name %>',
          }
        },
        files: {
          'build/index.html': ['index.html']
        }
      }
    },

    replace : {
      dist : {
        options : {
          usePrefix : false,
          force : true,
          patterns : [
            {
              match : /this\._super\(\s*([\w\.]+)\s*,\s*["'](\w+)["']\s*(,\s*)?/g,
              replacement : '$1.prototype.$2.apply(this$3'
            },
          ],
        },
        files : [
          {
            src : [ 'build/js/app.js' ],
            dest : 'build/js/app.js'
          }
        ]
      },
    },

    uglify: {
      options: {
        report: 'min',
        preserveComments: false,
        screwIE8: true,
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
              '<%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.url %> */',
        global_defs: {
          "me.game.HASH.debug": false
        },
        dead_code: true
      },
      dist: {
        files: {
          'build/js/app.min.js': [
            'build/js/app.js'
          ]
        }
      }
    },

    execute: {
      target: {
        src: ['pirates-server.js']
      }
    },

    'download-electron': {
      version: '0.31.0',
      outputDir: 'bin',
      rebuild: false,
    },

    asar: {
      dist: {
        cwd: 'build',
        src: ['**/*', '!js/app.js'],
        expand: true,
        dest: 'bin/' + (
          process.platform === 'darwin'
            ? 'Electron.app/Contents/Resources/'
            : 'resources/'
        ) + 'app.asar'
      },
    },

    resources: {
      dist: {
        options: {
          dest: 'build/js/resources.js',
          varname: 'game.resources',
        },
        files: [{
          src: ['data/bgm/**/*', 'data/sfx/**/*'],
          type: 'audio'
        },{
          src: ['data/img/**/*.png'],
          type: 'image'
        },{
          src: ['data/img/**/*.json'],
          type: 'json'
        },{
          src: ['data/map/**/*.tmx', 'data/map/**/*.json'],
          type: 'tmx'
        },{
          src: ['data/map/**/*.tsx'],
          type: 'tsx'
        }]
      }
    },

    watch: {
      resources: {
        files: ['data/**/*'],
        tasks: ['resources'],
        options: {
          spawn: false,
        },
      },
    },

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks("grunt-replace");
  grunt.loadNpmTasks('grunt-execute');
  grunt.loadNpmTasks('grunt-download-electron');
  grunt.loadNpmTasks('grunt-asar');

  // Custom Tasks
  grunt.loadTasks('tasks');

  grunt.registerTask('default', [
    'resources',
    'concat',
    'replace',
    'uglify',
    'copy',
    'processhtml',
    'clean:app',
  ]);
  grunt.registerTask('dist', ['default', 'download-electron', 'asar']);
  grunt.registerTask('serve', ['resources', 'execute', 'watch']);
}
