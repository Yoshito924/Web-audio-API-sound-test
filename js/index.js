'use strict'

const debugInfo = document.getElementById('debugInfo');
const playButton = document.getElementById('playButton');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
let audioContext;
let gainNode;

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
        gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        log(`AudioContextの状態: ${audioContext.state}`);
        document.getElementById('volumeControl').style.display = 'block';
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
            setTimeout(actuallyPlaySound, 500); // 500ms遅延を追加
        }).catch(e => log(`AudioContext再開エラー: ${e.message}`));
    } else {
        setTimeout(actuallyPlaySound, 500); // 500ms遅延を追加
    }
}

function actuallyPlaySound() {
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.connect(gainNode);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
    log('音の再生を試みました');
}

window.addEventListener('load', () => {
    checkAudioSupport();
    log('ページが読み込まれました。音を再生するにはボタンをタップしてください。');
    log('注意: Lineアプリ内ブラウザを使用している場合は、Safariで直接開いてください。');
    log('デバイスの音量が上がっているか、消音モードになっていないか確認してください。');
});

playButton.addEventListener('click', () => {
    log('ボタンがタップされました');
    playSound();
});

volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value;
    if (gainNode) {
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    }
    volumeValue.textContent = `${Math.round(volume * 100)}%`;
    log(`音量が${Math.round(volume * 100)}%に設定されました`);
});

// iOS Safariでのオーディオのロック解除を試みる
document.body.addEventListener('touchstart', function () {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().then(() => log('タッチイベントでAudioContextが再開されました'));
    }
}, false);