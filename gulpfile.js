const { src, dest, watch, series, parallel } = require("gulp");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const postcss = require("gulp-postcss");
const cssnext = require("postcss-cssnext")
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const imagemin = require("gulp-imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");
const imageminSvgo = require("imagemin-svgo");
const browserSync = require("browser-sync");
// const fiber = require('fibers');
//////////////
// 今までのsass
//////////////
const sass = require('gulp-sass')(require('sass'));
// const sassGlob = require('gulp-sass-glob');

//////////////
// dartsass
//////////////
// const sass = require('gulp-dart-sass');
const sassGlob = require('gulp-sass-glob-use-forward');

const srcPath = {
    css: 'src/sass/**/*.scss',
    js: 'src/js/**/*.js',
    img: 'src/images/**/*',
    html: './**/*.html',
    php: './**/*.php',
}
const destPath = {
    css: 'assets/css/',
    js: 'assets/js/',
    img: 'assets/images/'
}
const browsers = [
    'last 2 versions',
    '> 5%',
    'ie = 11',
    'not ie <= 10',
    'ios >= 8',
    'and_chr >= 5',
    'Android >= 5',
]
const browserSyncOption = {
  server: "./"
}
const cssSass = () => {
    return src(srcPath.css)
        .pipe(sourcemaps.init())
        .pipe(
            plumber({
                errorHandler: notify.onError('Error:<%= error.message %>')
            }))
        .pipe(sassGlob())
        // .pipe(sass({ // sass option
        //     fiber: fiber,
        //     outputStyle: "expanded"
        // }))
        .pipe(sass({
            includePaths: ['src/sass'],
            outputStyle: 'expanded'
        }).on('error', sass.logError)) //指定できるキー expanded compressed
        .pipe(postcss([cssnext(browsers)]))
        .pipe(dest(destPath.css))
        .pipe(notify({
            message: 'Sassをコンパイルしました！',
            onLast: true
        }))
}

const jsBabel = () => {
    return src(srcPath.js)
        .pipe(
            plumber(
                {
                    errorHandler: notify.onError('Error: <%= error.message %>')
                }
            )
        )
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(dest(destPath.js))
        .pipe(uglify())
        .pipe(
            rename(
                { extname: '.min.js' }
            )
        )
        .pipe(dest(destPath.js))
}
const imgImagemin = () => {
    return src(srcPath.img)
        .pipe(
            imagemin(
                [
                    imageminMozjpeg({
                        quality: 80
                    }),
                    imageminPngquant(),
                    imageminSvgo({
                        plugins: [
                            {
                                removeViewbox: false
                            }
                        ]
                    })
                ],
                {
                    verbose: true
                }
            )
        )
        .pipe(dest(destPath.img))
}
const browserSyncFunc = () => {
    browserSync.init(browserSyncOption);
}
const browserSyncReload = (done) => {
    browserSync.reload();
    done();
}
const watchFiles = () => {
    watch(srcPath.css, series(cssSass, browserSyncReload))
    watch(srcPath.js, series(jsBabel, browserSyncReload))
    watch(srcPath.img, series(imgImagemin, browserSyncReload))
    watch(srcPath.html, series(browserSyncReload))
    watch(srcPath.php, series(browserSyncReload))
}
exports.default = series(series(cssSass, jsBabel, imgImagemin), parallel(watchFiles, browserSyncFunc));
exports.build = series(cssSass, jsBabel, imgImagemin);
