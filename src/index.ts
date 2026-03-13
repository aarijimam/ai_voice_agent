import { startTimer } from "./utils/logger.js";

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function randomLoop(): void{
    const randomNum = Math.floor(Math.random() * 100);
    console.log(randomNum);
    delay(randomNum);
}

const timer = startTimer("Random Loop Timer");
randomLoop();
timer.end();

console.log(`Random loop has been running for ${timer.end()} milliseconds.`);