import * as fs from 'fs';

const audioBuffer = fs.readFileSync('./audio/audio.wav');

export default audioBuffer;