import path from 'path';


const __dirname = path.resolve();

// config 우선순위 (환경변수 > APP_CONFIG_FILE 경로의 YAML > default)
const config = {
    as_uri: 'https://localhost:8443/',
    ws_uri: 'ws://localhost:8888/kurento',
    static_path: path.join(__dirname,'static')
};


export default config;
// module.exports = config;