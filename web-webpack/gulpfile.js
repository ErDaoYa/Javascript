var gulp = require('gulp'),
    os = require('os'),
    gutil = require('gulp-util'),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    gulpOpen = require('gulp-open'),
    uglify = require('gulp-uglify'),
    cssmin = require('gulp-cssmin'),
    md5 = require('gulp-md5-plus'),
    fileinclude = require('gulp-file-include'),
    clean = require('gulp-clean'),
    spriter = require('gulp-css-spriter'),
    base64 = require('gulp-css-base64'),
    webpack = require('webpack'),
    connect = require('gulp-connect'),
    livereload = require('gulp-livereload'),
    autoprefixer = require('gulp-autoprefixer'),
    obfuscate = require('gulp-obfuscate'),
    vendor = require('./package').vendor,
    argv = require('minimist')(process.argv.slice(2)).env == vendor.ambient,

    //webpack
    CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin"),
    path = require('path'),
    fs = require('fs'),
    CopyWebpackPlugin =require('copy-webpack-plugin'),
    srcDir = path.resolve(process.cwd(), 'src');

function getEntry() {
    var jsPath = path.resolve(srcDir, 'js/entry');
    var dirs = fs.readdirSync(jsPath);
    var matchs = [], files = {};
    dirs.forEach(function (item) {
        matchs = item.match(/(.+)\.js$/);
        if (matchs) {
            files[matchs[1]] = path.resolve(srcDir, 'js/entry', item);
        }
    });
    console.log(JSON.stringify(files));
    //console.log(files);
    return files;
}

//mac chrome: "Google chrome", 
var browser = os.platform() === 'linux' ? 'Google chrome' : (os.platform() === 'darwin' ? 'Google chrome' : (os.platform() === 'win32' ? 'chrome' : 'firefox'));

//将图片拷贝到目标目录
gulp.task('copy:images', function (done) {
    gulp.src(['src/images/**/*']).pipe(gulp.dest('dist/images')).on('end', done);
});

//复制model下的所有到dist目下
gulp.task('model',function(){
    gulp.src('src/js/model/**/*').pipe(gulp.dest('dist/js/model/'));
});

//dev时迁移开发js模块
gulp.task('js', function(done){
    if(argv){
        gulp.src('src/js/vendors/**/*.js').pipe(uglify()).pipe(obfuscate()).pipe(gulp.dest('dist/js/vendors/'));
    }else{
        gulp.src('src/js/vendors/**/*.js').pipe(gulp.dest('dist/js/vendors/'));
    }
});

//压缩合并css, css中既有自己写的.less, 也有引入第三方库的.css
gulp.task('lessmin', function (done) {
    gulp.src(['src/css/main.css', 'src/css/*.css', 'src/css/*.less'])
        .pipe(less())
        //可以自动为css中的某些代码添加如 -moz- 、 -webkit- 等前缀，保证其兼容性
        .pipe(autoprefixer())
        //.pipe(spriter({}))//让每一个css合并为一个雪碧图
        .pipe(concat('style.min.css'))
        .pipe(gulp.dest('dist/css/'))
        .on('end', done);
});

gulp.task('modelCss',function(){
    gulp.src('src/css/**/*.*').pipe(gulp.dest('dist/css/'));
});

//将js加上10位md5,并修改html中的引用路径，该动作依赖build-js
gulp.task('md5:js', ['build-js'], function (done) {
    gulp.src('dist/js/*.js').pipe(md5(10, 'dist/app/**/*.html')).pipe(gulp.dest('dist/js')).on('end', done);
});

//将css加上10位md5，并修改html中的引用路径，该动作依赖sprite
gulp.task('md5:css', ['sprite'], function (done) {
    gulp.src('dist/css/*.css').pipe(md5(10, 'dist/app/**/*.html')).pipe(gulp.dest('dist/css')).on('end', done);
});

//用于在html文件中直接include文件
gulp.task('fileinclude', function (done) {
    gulp.src(['src/app/**/*.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        })).pipe(gulp.dest('dist/app')).pipe(connect.reload()).on('end', done);
});

//雪碧图操作，应该先拷贝图片并压缩合并css
gulp.task('sprite', ['copy:images', 'lessmin'], function (done) {
    var timestamp = +new Date();
    gulp.src('dist/css/style.min.css').pipe(spriter({
        spriteSheet: 'dist/images/spritesheet' + timestamp + '.png',
        pathToSpriteSheetFromCSS: '../images/spritesheet' + timestamp + '.png',
        spritesmithOptions: {
            padding: 10
        }
    })).pipe(base64()).pipe(cssmin()).pipe(gulp.dest('dist/css')).on('end', done);
});

gulp.task('clean', function (done) {
    gulp.src(['dist']).pipe(clean()).on('end', done);
});

gulp.task('reload-dev',['js','model','lessmin','modelCss','build-js', 'fileinclude'],function() {
    gulp.src('src/**/*.*').pipe(connect.reload());
});

gulp.task('watch', function (done) {
    gulp.watch('src/**/*.html', ['reload-dev']);
});

gulp.task('connect', function () {
    connect.server({
        root: vendor.host.path,
        port: vendor.host.port,
        livereload: true
    });
});

gulp.task('open', function (done) {
    gulp.src('').pipe(gulpOpen({
        app: browser,
        uri: vendor.host.host
    })).on('end', done);
});

var webpackConfig = {
    cache: false,
    devtool: "source-map",
    //入口文件配置
    entry: getEntry(),
    //文件导出的配置
    output: {
        path: path.join(__dirname, vendor.publicPath),
        publicPath: vendor.publicPath,
        filename: "[name].js",
        chunkFilename: "[chunkhash].js"
    },
    module: {
        //加载器配置
        loaders: [
            //.css 文件使用 style-loader 和 css-loader 来处理
            { test: /\.css$/, loader: 'style-loader!css-loader'},
            //.js 文件使用 jsx-loader 来编译处理
            { test: /\.js$/, loader: 'jsx-loader?harmony'},
            //.scss 文件使用 style-loader、css-loader 和 sass-loader 来编译处理
            { test: /\.scss$/, loader: 'style!css!sass?sourceMap'},
            //图片文件使用 url-loader 来处理，小于8kb的直接转为base64
            { test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=8192'}
        ]
    },
    //监听
    watch: true,
    //简写
    resolve: {
        extensions: ['', '.js', '.json', '.scss','.css'],
        alias: {
            jquery: srcDir +'/js/lib/jquery.min.js',
            njx: srcDir +'/js/lib/httpAjax.js',
            adminLogin: srcDir +'/js/lib/address.js',
            lib: srcDir +'/js/lib',
            core: srcDir + '/js/core',
            ui:  srcDir + '/js/ui',
            ven: srcDir+'/js/vendors/'
        }
    },
    //全局
    externals:{},
    //公共组件
    plugins: [
        //全局变量不需要进行require
        new webpack.ProvidePlugin({
            $: "jquery",
            jquery: "jquery",
            "jQuery":"jquery",
            "window.jquery":"jquery",
            'njx':"njx",
            'adminLogin':'adminLogin'
        }),
        new CommonsChunkPlugin('common.js',['main']),
        //根据业务渲染
        new CopyWebpackPlugin(vendor.vendor),
        //热备
        new webpack.HotModuleReplacementPlugin()
    ]
};

if(argv){
    webpackConfig.cache = true;
    webpackConfig.watch = false;
    webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
            //给uglify配置drop_console来避免IE8及以下版本console未定义 true停止 false 开启
            drop_console:false
        },
        //排除关键字
        except: ['$super', '$', 'exports', 'require']
    }));
    delete webpackConfig.devtool;
}

//引用webpack对js进行操作
gulp.task("build-js", ['fileinclude'], function(callback) {
    webpack(Object.create(webpackConfig)).run(function(err, stats) {
        if(err) throw new gutil.PluginError("webpack:build-js", err);
        gutil.log("[webpack:build-js]", stats.toString({
            colors: true
        }));
        callback();
    });
});

//发布
gulp.task('default', ['copy:images','fileinclude','lessmin','modelCss','js','model','build-js','md5:css', 'md5:js']);

//开发 gulp dev --env=dev
gulp.task('dev', ['connect', 'copy:images', 'fileinclude','lessmin','modelCss','js','model','build-js','watch', 'open']);

//代理层
//npm install -g supervisor supervisor.cmd .\httpClient.js

//打包(已经无用)==>交由gulp管理
//webpack --config .\webpack.config.js