const gulp = require('gulp')
const download = require('gulp-download2')

gulp.task('bootstrap', () => {
    return gulp
        .src([
            'node_modules/bootstrap/dist/css/bootstrap.min.css',
            'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
        ])
        .pipe(gulp.dest('src/dist/bootstrap'))
})

gulp.task('clipboard', () => {
    return gulp
        .src('node_modules/clipboard/dist/clipboard.min.js')
        .pipe(gulp.dest('src/dist/clipboard'))
})

gulp.task('fontawesome', () => {
    return gulp
        .src(
            [
                'node_modules/@fortawesome/fontawesome-free/css/all.min.css',
                'node_modules/@fortawesome/fontawesome-free/webfonts/fa-regular-*',
                'node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-*',
            ],
            {
                base: 'node_modules/@fortawesome/fontawesome-free',
                encoding: false,
            }
        )
        .pipe(gulp.dest('src/dist/fontawesome'))
})

gulp.task('jquery', () => {
    return gulp
        .src('node_modules/jquery/dist/jquery.min.js')
        .pipe(gulp.dest('src/dist/jquery'))
})

// gulp.task('qr-code-styling', () => {
//     return download([
//         'https://cdn.jsdelivr.net/npm/qr-code-styling@1.9.2/lib/qr-code-styling.min.js',
//     ]).pipe(gulp.dest('src/dist/qr-code-styling'))
// })

gulp.task('qr-code-styling', () => {
    return gulp
        .src('node_modules/qr-code-styling/lib/qr-code-styling.js')
        .pipe(gulp.dest('src/dist/qr-code-styling'))
})

gulp.task(
    'default',
    gulp.parallel(
        'bootstrap',
        'clipboard',
        'fontawesome',
        'jquery',
        'qr-code-styling'
    )
)
