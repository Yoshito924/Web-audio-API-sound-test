'use strict'

const debugInfo = document.getElementById('debugInfo');
const playButton = document.getElementById('playButton');
let audioContext;

function log(message) {
    console.log(message);
    debugInfo.innerHTML += message + '<br>';
}

function checkAudioSupport() {
    log(`Web Audio API サポート: ${!!(window.AudioContext || window.webkitAudioContext)}`);
    log(`ユーザーエージェント: ${navigator.userAgent}`);
}

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        log(`AudioContextの状態: ${audioContext.state}`);
    } catch (e) {
        log(`AudioContext初期化エラー: ${e.message}`);
    }
}

function playSound() {
    if (!audioContext) {
        initAudio();
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            log('AudioContextが再開されました');
            actuallyPlaySound();
        }).catch(e => log(`AudioContext再開エラー: ${e.message}`));
    } else {
        actuallyPlaySound();
    }
}

function actuallyPlaySound() {
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
    log('音の再生を試みました');
}

window.addEventListener('load', () => {
    checkAudioSupport();
    log('ページが読み込まれました。音を再生するにはボタンをタップしてください。');
});

playButton.addEventListener('click', () => {
    log('ボタンがタップされました');
    playSound();
});

// iOS Safariでのオーディオのロック解除を試みる
document.body.addEventListener('touchstart', function () {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().then(() => log('タッチイベントでAudioContextが再開されました'));
    }
}, false);
