let gulp = require('gulp');
let htmlmin = require('gulp-htmlmin');
let sass = require('gulp-sass');
let cleanCSS = require('gulp-clean-css');
let uglify = require('gulp-terser');
let browserSync = require('browser-sync').create();
let autoprefixer = require('gulp-autoprefixer');
let ts = require('gulp-typescript');
let gulpif = require('gulp-if');
let babel = require('gulp-babel');

gulp.task('build:html', () => {
  return gulp.src('src/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('build:scss', () => {
  return gulp.src('src/scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
      cascade: true
    }))
    .pipe(cleanCSS({
      compatibility: 'ie8'
    }))
    .pipe(gulp.dest('build/css'));
});

gulp.task('build:js', function () {
  return gulp.src(['src/js/*.js'])
    .pipe(babel({
      "presets": [
        "@babel/preset-env"
      ],
      "plugins": ["@babel/plugin-proposal-object-rest-spread", "@babel/plugin-proposal-class-properties"]
    }))
    .pipe(uglify())
    .pipe(gulp.dest('build/js'))
});

gulp.task('build:ts', function () {
  return gulp.src(['src/ts/*.ts'])
    .pipe(ts({
      "noImplicitAny": true,
      "target": "ES6"
    }))
    .pipe(babel({
      "presets": [
        "@babel/preset-env"
      ],
      "plugins": ["@babel/plugin-proposal-object-rest-spread", "@babel/plugin-proposal-class-properties"]
    }))
    .pipe(uglify())
    .pipe(gulp.dest('build/ts'))
});

gulp.task('build:resources', async () => {
  return gulp.src('src/resources/**/*', {
      dot: true,
      allowEmpty: true
    })
    .pipe(gulp.dest('build'))
});

gulp.task('build',
  gulp.parallel(
    'build:html',
    'build:scss',
    'build:js',
    'build:ts',
    'build:resources'
  ));

gulp.task('serve', () => {
  browserSync.init({
    server: {
      baseDir: './build'
    }
  });
});

gulp.task('watch', () => {
  gulp.watch('src/*.html', gulp.series('build:html'));
  gulp.watch('src/scss/**/*.scss', gulp.series('build:scss'));
  gulp.watch('src/js/**/*.js', gulp.series('build:js'));
  gulp.watch('src/ts/**/*.ts', gulp.series('build:ts'));
  gulp.watch(['src/resources/**/*', 'src/resources/**/.*'], gulp.series('build:resources'));
  gulp.watch('build/**/*').on('change', browserSync.reload);
});

gulp.task('default', gulp.series(
  'build',
  gulp.parallel(
    'serve',
    'watch'
  )
));