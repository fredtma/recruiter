"use strict";

const SYSCONFIG = require("./configs/sys.config.json");
const ARGV      = require("yargs").argv;// --dev, --live, --debug
const BROWSER   = require("browser-sync").create();
const CACHE     = require("gulp-cache");
const BABEL     = require("gulp-babel");
const CONCAT    = require("gulp-concat");
const CONCATCSS = require("gulp-concat-css");
const CRISPER   = require("gulp-crisper");
const CLEANCSS  = require("gulp-clean-css");
const FLATTEN   = require("gulp-flatten");
const GULP      = require("gulp");
const GULPIF    = require("gulp-if");
const HTMLMIN   = require("gulp-htmlmin");
const IGNORE    = require("gulp-ignore");
const IMAGEMIN  = require("gulp-imagemin");
const POLYLINT  = require("gulp-polylint");
const RENAME    = require("gulp-rename");
const SASS      = require("gulp-sass");
const SOURCE    = require("gulp-sourcemaps");
const VULCANIZE = require("gulp-vulcanize");
const UTIL      = require("gulp-util");
const UGLY      = require("gulp-uglify");

const CONFIG    = (SYSCONFIG.env === "dev") ? SYSCONFIG.dev : SYSCONFIG.live;
const DEBUG     = ARGV.debug || SYSCONFIG.debug || true;
const ENV       = (ARGV.dev) ? "dev" : (ARGV.live) ? "live" : (SYSCONFIG.env) ? SYSCONFIG.env : "dev";
const RUN       = !!(ENV === "live" || !DEBUG || true);
const VSOURCE   = false;//vendor source

GULP.task("build:all", ["css:vendor", "image", "fonts", "js:client", "js:vendor", "sass", "vulcanize"]);
GULP.task("build:min", ["js:client", "sass", "vulcanize"]);
GULP.task("build", ["css:vendor", "js:client", "js:vendor", "sass", "vulcanize"]);

GULP.task("browser", browser);
GULP.task("css:vendor", cssVendor);
GULP.task("image", image);
GULP.task("fonts", fonts);
GULP.task("js:client", jsClient);
GULP.task("js:watch", ["js:client"], jsWatch);
GULP.task("js:vendor", jsVendor);
GULP.task("sass", sass);
GULP.task("sass:watch", ["sass"], sassWatch);
GULP.task("serve", ["browser"]);
GULP.task("watch", ["sass:watch", "js:watch", "vulcanize:watch"]);

function browser()
{
    BROWSER.init({
        server: {
            baseDir: "./app",
        },
        open : "local",
        port: 3000,
        logLevel: DEBUG ? "debug" : "info",
        logFileChanges: false,
        browser: ["google chrome"],
        notify: DEBUG
    });
}

function cssVendor()
{
    return GULP.src(CONFIG.vendor.css)
        .pipe(GULPIF(VSOURCE, SOURCE.init()))
        .pipe(CONCATCSS("all.css", {rebaseUrls:false}))
        //.pipe(CSSNANO({discardDuplicates:true, discardEmpty:true, mergeLonghand: true, mergeRules: true, normalizeUrl: false}))
        .pipe(CLEANCSS())
        .pipe(GULPIF(VSOURCE, SOURCE.write('.')))
        .pipe(GULP.dest(CONFIG.output.css));
}

function image()
{
    return GULP.src(CONFIG.source.img)
        .pipe(CACHE(IMAGEMIN({interlaced: true})))
        .pipe(GULP.dest(CONFIG.source.img));
}

function fonts()
{
    return GULP.src(CONFIG.source.font)
        .pipe(FLATTEN())
        .pipe(GULP.dest(CONFIG.output.font));
}

function jsClient()
{
    return GULP.src(CONFIG.client.js)
        .pipe(SOURCE.init({loadMaps: true}))
        .pipe(BABEL({presets: ['es2015']}))
        .pipe(CONCAT("app.min.js"))
        .pipe(GULPIF(RUN, UGLY()))
        .pipe(SOURCE.write("."))
        .pipe(GULP.dest(CONFIG.output.js))
        .on("end", function(e){success("js:client"); });
}

function jsWatch()
{
    GULP.watch(CONFIG.client.js, ["js:client"], BROWSER.reload);
}

function jsVendor()
{
    return GULP.src(CONFIG.vendor.js)
        .pipe(GULPIF(VSOURCE, SOURCE.init({loadMaps: true})))
        .pipe(CONCAT("vendors.min.js"))
        .pipe(GULPIF(RUN, UGLY()))
        .pipe(GULPIF(VSOURCE, SOURCE.write()))
        .pipe(GULP.dest(CONFIG.output.js))
        .on("end", function(){success("js:vendor"); });
}

function sass()
{
    return GULP.src(CONFIG.client.sass)
        .pipe(SASS({outputStyle: 'compressed'}))
        //.pipe(RENAME({"suffix":"-compiled"}))
        .pipe(GULP.dest(CONFIG.output.css));
}

function sassWatch()
{
    GULP.watch(CONFIG.client.sass, ["sass"], function(){
        BROWSER.reload({stream:true});
    });
}

function success(msg)
{
    msg = msg || "";
    UTIL.log(UTIL.colors.green("Successfully ran:", UTIL.colors.blue.bold(msg) ));
}

function vulcanize()
{
    let lint = 0;
    return GULP.src(CONFIG.source.elements)
        .pipe(GULPIF(lint, POLYLINT()))
        .pipe(GULPIF(lint, POLYLINT.reporter(POLYLINT.reporter.stylishlike)))
        .pipe(GULPIF(lint, POLYLINT.reporter.fail({ buffer: true, ignoreWarnings: false })))
        .on("end", function(){success("PolyLinted"); })
        .pipe(VULCANIZE({
            stripComments: true,
            inlineScripts: false,
            inlineCss: true,
            stripExcludes: ["polymer.html"]
        }))
        .on("error", function(e, b){console.log(e) })
        .on("end", function(){success("vulcanized"); })
        //.pipe(RENAME({"suffix":".vulcanize"}))
        .pipe(GULPIF(RUN, HTMLMIN({
            customAttrAssign: [/\$=/],
            removeComments: true,
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true
        })))
        .on("end", function(){success("HTML Mimified"); })
        //.pipe(CRISPER({scriptInHead: false, onlySplit: false}))
        .pipe(GULP.dest(CONFIG.output.elements))
        .on("end", function(){success("Destination"); });
}

function vulcanizeWatch()
{
    GULP.watch(CONFIG.source.elements, ["vulcanize"], BROWSER.reload)
}
