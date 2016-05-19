import {join, resolve} from 'path';

//""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

export interface InjectableDependency {
    src: string;
    inject: string | boolean;
    vendor?: boolean;
    env?: string[] | string;
}

export interface Bundle {
    src: string | string[];
    dest: string;
    bundle: string;
};

const ENV = {
    Dev: 'dev',
    Prod: 'prod'
};

//""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

export class ServerConfig {
    root = resolve(__dirname, '..');
    src = join(__dirname, '../src/server');
    port = 8080;
};

//""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

export class ClientConfig {
    root = resolve(__dirname, '..');
    src = join(this.root, 'src/client');
    dest = join(this.root, 'dest');

    //~ Bundles
    scripts: Bundle = {
        src: `${this.src}/**/*.{ts,js,jsx}]`,
        dest: `${this.dest}/js`,
        bundle: `app.js`
    };

    styles: Bundle = {
        src: [`${this.src}/**/*.{css,scss}`],
        dest: `${this.dest}/css`,
        bundle: `styles.css`
    };

    shimsDest = 'shims.js';

    //~ Dependencies & Angular
    bootstrap = {
        dir: `${this.root}/app`,
        main: `${this.root}/app/main`
    };

    npmDependencies: InjectableDependency[] = [
        { src: 'systemjs/dist/system-polyfills.src.js', inject: 'shim', env: ENV.Dev },
        { src: 'zone.js/dist/zone.js', inject: 'lib' },
        { src: 'reflect-metadata/Reflect.js', inject: 'shims' },
        { src: 'es6-shim/es6-shim.js', inject: 'shim' },
        { src: 'systemjs/dist/system.src.js', inject: 'shim', env: ENV.Dev },
        { src: 'rxjs/bundles/Rx.js', inject: 'lib', env: ENV.Dev }
    ];

    Assets: InjectableDependency[] = [
        { src: this.styles.bundle, inject: true, vendor: false }
    ];

    //~ SystemJS Config
    systemConfig = {
        defaultJSExtensions: true,
        packageConfigPaths: [
            `${this.baseDir}node_modules/*/package.json`,
            `${this.baseDir}node_modules/**/package.json`,
            `${this.baseDir}node_modules/@angular/*/package.json`
        ],
        paths: {
            [this.bootstrap.main]: `${this.baseDir}${this.bootstrap.main}`,
            'rxjs/*': `${this.baseDir}rxjs/*`,
            'app/*': `/app/*`,
            '*': `${this.baseDir}node_modules/*`
        },
        packages: {
            rxjs: { defaultExtension: false }
        }
    };

    /**
     * The system builder configuration of the application.
     * @type {any}
     */
    SYSTEM_BUILDER_CONFIG: any = {
        defaultJSExtensions: true,
        packageConfigPaths: [
            join(this.root, 'node_modules', '*', 'package.json'),
            join(this.root, 'node_modules', '@angular', '*', 'package.json')
        ],
        paths: {
            [`${this.TMP_DIR}/*`]: `${this.TMP_DIR}/*`,
            '*': 'node_modules/*'
        },
        packages: {
            '@angular/core': {
                main: 'index.js',
                defaultExtension: 'js'
            },
            '@angular/compiler': {
                main: 'index.js',
                defaultExtension: 'js'
            },
            '@angular/common': {
                main: 'index.js',
                defaultExtension: 'js'
            },
            '@angular/http': {
                main: 'index.js',
                defaultExtension: 'js'
            },
            '@angular/platform-browser': {
                main: 'index.js',
                defaultExtension: 'js'
            },
            '@angular/platform-browser-dynamic': {
                main: 'index.js',
                defaultExtension: 'js'
            },
            '@angular/router-deprecated': {
                main: 'index.js',
                defaultExtension: 'js'
            },
            '@angular/router': {
                main: 'index.js',
                defaultExtension: 'js'
            },
            'rxjs': {
                defaultExtension: 'js'
            }
        }
    };

    /**
     * The path for the base of the application at runtime.
     * The default path is `/`, which can be overriden by the `--base` flag when
     * running `npm start`.
     * @type {string}
     */
    baseDir = '/';

    /**
     * The port where the application will run, if the `hot-loader` option mode
     * is used.
     * The default hot-loader port is `5578`.
     * @type {number}
     */
    HOT_LOADER_PORT = 5578;

    /**
     * The folder for temporary files.
     * @type {string}
     */
    TMP_DIR = `${this.dest}/tmp`;

    /**
     * The list of editor temporary files to ignore in watcher and asset builder.
     * @type {string[]}
     */
    TEMP_FILES: string[] = [
        '**/*___jb_tmp___',
        '**/*~',
    ];
}

export function getBrowserSyncConfig(client: ClientConfig, port = 5555, open = false) {
    return {
        middleware: [require('connect-history-api-fallback')({ index: `${client.baseDir}index.html` })],
        port: port,
        startPath: client.baseDir,
        open: open,
        server: {
            baseDir: `${client.dest}/empty/`,
            routes: {
                [`${client.baseDir}${client.dest}`]: client.dest,
                [`${client.baseDir}node_modules`]: 'node_modules',
                [`${client.baseDir.replace(/\/$/, '')}`]: client.dest
            }
        }
    };
}

//~ Seed shit
class SeedConfig {
}

/**
 * Normalizes the given `deps` to skip globs.
 * @param {InjectableDependency[]} deps the dependencies to be normalized.
 */
export function normalizeDependencies(deps: InjectableDependency[]) {
    deps
        .filter((d: InjectableDependency) => !/\*/.test(d.src)) // Skip globs
        .forEach((d: InjectableDependency) => d.src = require.resolve(d.src));
    return deps;
}

// /**
//  * Returns the environment of the application.
//  */
// function getEnvironment() {
//   let base: string[] = argv['_'];
//   let prodKeyword = !!base.filter(o => o.indexOf(ENVIRONMENTS.PRODUCTION) >= 0).pop();
//   let env = (argv['env'] || '').toLowerCase();
//   if ((base && prodKeyword) || env === ENVIRONMENTS.PRODUCTION) {
//     return ENVIRONMENTS.PRODUCTION;
//   } else {
//     return ENVIRONMENTS.DEVELOPMENT;
//   }
// }
