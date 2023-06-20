import './style.css'
import { WebContainer } from '@webcontainer/api';
import { files } from './files.js';

/**  @type {import(@webcontainer/api').WebContainer}  */
let webcontainerInstance;

window.addEventListener('load', async () => {
    textareaEl.value = files['index.js'].file.contents;

    // Call only once
    webcontainerInstance = await WebContainer.boot();
    await webcontainerInstance.mount(files);

    const exitCode = await installDependencies();
    if (exitCode !== 0) {
        throw new Error('Installation failed');
    }

    startDevServer();

    // const packageJSON = await webcontainerInstance.fs.readFile('package.json', 'utf-8');
    // console.log(packageJSON);
})

document.querySelector('#app').innerHTML = `
    <div class="container">
        <div class="editor">
            <textarea>I am a textarea</textarea>
        </div>
        <div class="preview">
            <iframe src="loading.html"></iframe>
        </div>
    </div>
`;

async function installDependencies() {
    // Install dependencies
    const installProcess = await webcontainerInstance.spawn('npm', ['install']);

    installProcess.output.pipeTo(new WritableStream({
        write(data) {
            console.log(data);
        }
    }));

    // Wait for install cmd to exit
    return installProcess.exit;
}

async function startDevServer() {
    // Run `npm run start` to start the Express app
    await webcontainerInstance.spawn('npm', ['run', 'start']);

    // Wait for `server-ready` event
    webcontainerInstance.on('server-ready', (port, url) => {
        iframeEl.src = url;
    })
}

/** @type {HTMLIFrameElement | null} */
const iframeEl = document.querySelector('iframe');

/** @type {HTMLTextAreaElement | null} */
const textareaEl = document.querySelector('textarea');
