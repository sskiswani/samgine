import {join} from 'path';
import { ClientConfig, ServerConfig } from './tasks/configHelper';

class ProjectConfig {
    //~ Directories
    root = __dirname;
    src = join(__dirname, 'src');
    dest = join(__dirname, 'bin');
    client = join(__dirname, 'src/server');
    server = join(__dirname, 'src/server');

    //~ File paths & locations
    paths = {
        scripts: [`${this.src}/**/*.{ts,js,jsx}`],
        styles: [`${this.src}/**/*.{css,scss}`],
        bootstrap: join(this.src, 'client/app'),
        outStyles: 'styles.css',
        outJs: 'app.js',
    };

    serverConfig = new ServerConfig();
    clientConfig = new ClientConfig();
}

let config = new ProjectConfig();
console.log('hi ', JSON.stringify(config, null, 4));
export default config;
