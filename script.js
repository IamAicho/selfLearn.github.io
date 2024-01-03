//------------------------- BLE 連接 ESP32_Audio ---------------------
let deviceAudio;
var servAudio_uuid = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'.toLowerCase();
var charAudio_uuid = '6e400004-b5a3-f393-e0a9-e50e24dcca9e'.toLowerCase();
let characteristicAudio;
let valueStr;  // 傳給ESP32_Audio的字串指令

$(function () {
    $("#scanAudio").on('click', async function () {
        if (deviceAudio && deviceAudio.gatt.connected) {
            await deviceAudio.gatt.disconnect();
            characteristicAudio = null;
            $("#content").text('藍芽裝置已斷開連接！需重新連接');
            $('#scanAudio').css('color', 'red');
            $('#scanAudio').css('background', '#fff');
            $('#scanAudio').on('mouseenter', function () {
                $(this).css('color', '#fff');
                $(this).css('background', '#02457a');
            });
            $('#scanAudio').on('mouseleave', function () {
                $(this).css('color', 'red');
                $(this).css('background', '#fff');
            });
            console.log('> 已斷開 ESP32_Audio 連接。');
        } else {
            console.log('尋找 ESP32_BLE_Audio...')
            try {
                deviceAudio = await navigator.bluetooth.requestDevice({
                    filters: [{ namePrefix: 'ESP32_BLE_Audio' }],
                    optionalServices: [servAudio_uuid]
                });
                console.log('連接 ESP32_BLE_Audio 中...');
                $("#content").text('藍芽裝置連接中...');

                const server = await deviceAudio.gatt.connect();
                const service = await server.getPrimaryService(servAudio_uuid);
                characteristicAudio = await service.getCharacteristic(charAudio_uuid);
                $('#scanAudio').css('color', '#fff');
                $('#scanAudio').css('background', '#02457a');
                $('#scanAudio').on('mouseleave', function () {
                    $(this).css('color', '#fff');
                    $(this).css('background', '#02457a');
                });
                $("#content").text('藍芽裝置已連接！');
                console.log('> 已連接到 ESP32_Audio 。');
            } catch (error) {
                // $("#content").text('藍芽裝置尚未連接！');
                console.error('連接 ESP32_Audio 失敗!!', error);
            }
        }

    });

    // 斷開連接按鈕
    // $("#disconnectAudio").on('click', async function () {
    //     if (deviceAudio && deviceAudio.gatt.connected) {
    //         await deviceAudio.gatt.disconnect();
    //         characteristicAudio = null;
    //         $("#content").text('藍芽裝置已斷開連接！需重新連接');
    //         $('#scanAudio').css('color', 'red');
    //         $('#scanAudio').css('background', '#fff');
    //         $('#scanAudio').on('mouseenter', function () {
    //             $(this).css('color', '#fff');
    //             $(this).css('background', '#02457a');
    //         });
    //         $('#scanAudio').on('mouseleave', function () {
    //             $(this).css('color', 'red');
    //             $(this).css('background', '#fff');
    //         });
    //         console.log('> 已斷開 ESP32_Audio 連接。');
    //     }
    // });

});

// 定義收到上下左右訊息的函式(傳指令給 ESP32_Audio)
async function downSpeaker() {
    if (!characteristicAudio) return;
    valueStr = 'DOWN';
    console.log('> 傳送給ESP32_Audio: ' + valueStr);
    await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));
}
async function leftSpeaker() {
    if (!characteristicAudio) return;
    valueStr = 'LEFT';
    console.log('> 傳送給ESP32_Audio: ' + valueStr);
    await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));
}
async function rightSpeaker() {
    if (!characteristicAudio) return;
    valueStr = 'RIGHT';
    console.log('> 傳送給ESP32_Audio: ' + valueStr);
    await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));
}
async function upSpeaker() {
    if (!characteristicAudio) return;
    valueStr = 'UP';
    console.log('> 傳送給ESP32_Audio: ' + valueStr);
    await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));
}

//---------------------- 隨機播放函式功能 -------------------------
var videos = [
    'video/D1.mp4', 'video/L1.mp4', 'video/R1.mp4', 'video/U1.mp4',
    // 'video/D2.mp4', 'video/L2.mp4', 'video/R2.mp4', 'video/U2.mp4',
    // 'video/D3.mp4', 'video/L3.mp4', 'video/R3.mp4', 'video/U3.mp4',
    'video/D4.mp4', 'video/L4.mp4', 'video/R4.mp4', 'video/U4.mp4',
    'video/D5.mp4', 'video/L5.mp4', 'video/R5.mp4', 'video/U5.mp4'
];

// 隨機排序陣列的函式
function shuffleArray(array) {
    let currentIndex = array.length, randomIndex, temporaryValue;
    while (currentIndex !== 0) {
        // 隨機挑選一個索引
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // 交換目前索引和隨機選中的索引的元素
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
};

let currentVideoIndex = 0; // 記錄當前播放的影片索引
let currentVideoName = ''; // 記錄當前播放的聲音方向

let shuffledVideos = shuffleArray(videos.slice());
// 每個方向隨機各播放一遍
function playRandomVideo() {
    // 將播放器的影片路徑設定為隨機排序後的路徑
    videoPlayer.src = shuffledVideos[currentVideoIndex];
    let videoName = videoPlayer.src;
    if (currentVideoIndex < shuffledVideos.length) {
        // 判斷該播放的聲音方向
        if (videoName.includes('video/D')) {
            downSpeaker();
            currentVideoName = '下方';
        } else if (videoName.includes('video/L')) {
            leftSpeaker();
            currentVideoName = '左方';
        } else if (videoName.includes('video/R')) {
            rightSpeaker();
            currentVideoName = '右方';
        } else if (videoName.includes('video/U')) {
            upSpeaker();
            currentVideoName = '上方';
        }
        if (isProjecting == true) {
            sendMessage(videoName);
        }
        videoPlayer.load();
        videoPlayer.play();
        currentVideoIndex++;
        console.log(currentVideoIndex + ', ' + String(videoName));
        log(currentVideoIndex + ', ' + currentVideoName + ', ' + $('#vol').text());

        let loopVideos = document.getElementById("videoPlayer");
        // 影片播放結束事件
        loopVideos.onended = function () {
            // alert("The video has ended");
            playRandomVideo();
        };
    } else {
        // 所有影檔播放完畢，將索引歸零並重新整理播放順序
        videoPlayer.src = '';
        currentVideoIndex = 0;
        currentVideoName = '';
        console.log('> 結束隨機播放');
        log('> 結束隨機播放');
        shuffledVideos = shuffleArray(videos.slice())
    }
};

$("#playRandomVideo").on('click', function () {
    if (isProjecting == true) {
        // 傳字串指令到投影頁面
        presentationConnection.send(JSON.stringify({ "message": "playRandomVideo" }));
        console.log('> 傳送給投影頁的字串：playRandomVideo');
        playRandomVideo();

    } else {
        playRandomVideo();
    }
});

$("#pauseVideo").on('click', function () {
    if (!videoPlayer.paused) {
        if (isProjecting == true) {
            presentationConnection.send(JSON.stringify({ "message": "pauseVideo" }));
            console.log('> 傳送給投影頁的字串：pauseVideo');
        };
        console.log('視頻原本正在播放');
        videoPlayer.pause();
        videoPlayer.src = '';
        currentVideoIndex = 0;
        currentVideoName = '';
        console.log('> 停止播放');
        log('> 停止播放');
        shuffledVideos = shuffleArray(videos.slice())
    } else {
        console.log('視頻原本就已暫停或停止');
    }
});

// function setFullVolume() {
//     $("#vol").text(videoPlayer.volume*10);
//     videoPlayer.volume = 1.0;
// }
// function setQuartersVolume() {
//     $("#vol").text(videoPlayer.volume*10);
//     videoPlayer.volume = 0.75;
// }
// function setHalfVolume() {
//     $("#vol").text(videoPlayer.volume*10);
//     videoPlayer.volume = 0.5;
// }
// function setQuarterVolume() {
//     $("#vol").text(videoPlayer.volume*10);
//     videoPlayer.volume = 0.25;
// }
videoPlayer.volume = 0.5;
$("#vol").text(parseInt(videoPlayer.volume * 10));
console.log(videoPlayer.volume);
let volume;
function setVolumeLow() {
    if (parseFloat(videoPlayer.volume.toFixed(1)) >= 0.1) {
        videoPlayer.volume -= 0.1;
    } else {
        videoPlayer.volume = 0;
    }
    console.log(videoPlayer.volume);
    volume = parseInt(videoPlayer.volume.toFixed(1) * 10);
    $("#vol").text(parseInt(volume));
}
function setVolumeHigh() {
    if (parseFloat(videoPlayer.volume.toFixed(1)) <= 0.9) {
        videoPlayer.volume += 0.1;
    } else {
        videoPlayer.volume = 1;
    }
    console.log(videoPlayer.volume);
    volume = parseInt(videoPlayer.volume.toFixed(1) * 10);
    $("#vol").text(parseInt(volume));
}

//---------------- 上下左右按鈕播放功能 ------------------------
// let n = 0;
// $("#upSpeaker").on('click', function () {
//     upSpeaker();
//     if (videos.length == 0) {
//         $('#status').css('color', 'red');
//     } else if (videos[3].includes('U_500')) {
//         n++;
//         // log(n + ', UP, 500Hz, ' + videoPlayer.volume);
//         log(n + ', 上方, 500Hz, ' + videoPlayer.volume);
//         playOneVideo(3);
//     } else if (videos[3].includes('U_2000')) {
//         n++;
//         // log(n + ', UP, 2000Hz, ' + videoPlayer.volume);
//         log(n + ', 上方, 2000Hz, ' + videoPlayer.volume);
//         playOneVideo(3);
//     }
// });
// $("#leftSpeaker").on('click', function () {
//     leftSpeaker();
//     if (videos.length == 0) {
//         $('#status').css('color', 'red');
//     } else if (videos[1].includes('L_500')) {
//         n++;
//         // log(n + ', LEFT, 500Hz, ' + videoPlayer.volume);
//         log(n + ', 左方, 500Hz, ' + videoPlayer.volume);
//         playOneVideo(1);
//     } else if (videos[1].includes('L_2000')) {
//         n++;
//         // log(n + ', LEFT, 2000Hz, ' + videoPlayer.volume);
//         log(n + ', 左方, 2000Hz, ' + videoPlayer.volume);
//         playOneVideo(1);
//     }
// });
// $("#downSpeaker").on('click', function () {
//     downSpeaker();
//     if (videos.length == 0) {
//         $('#status').css('color', 'red');
//     } else if (videos[0].includes('D_500')) {
//         n++;
//         // log(n + ', DOWN, 500Hz, ' + videoPlayer.volume);
//         log(n + ', 下方, 500Hz, ' + videoPlayer.volume);
//         playOneVideo(0);
//     } else if (videos[0].includes('D_2000')) {
//         n++;
//         // log(n + ', DOWN, 2000Hz, ' + videoPlayer.volume);
//         log(n + ', 下方, 2000Hz, ' + videoPlayer.volume);
//         playOneVideo(0);
//     }
// });
// $("#rightSpeaker").on('click', function () {
//     rightSpeaker();
//     if (videos.length == 0) {
//         $('#status').css('color', 'red');
//     } else if (videos[2].includes('R_500')) {
//         n++;
//         // log(n + ', RIGHT, 500Hz');
//         log(n + ', 右方, 500Hz');
//         playOneVideo(2);
//     } else if (videos[2].includes('R_2000')) {
//         n++;
//         // log(n + ', RIGHT, 2000Hz');
//         log(n + ', 右方, 2000Hz');
//         playOneVideo(2);
//     }
// });
// function playOneVideo(num) {
//     videoPlayer.src = videos[num];
//     videoPlayer.load();
//     videoPlayer.play();
//     function onendedVideo(str) {
//         let oneVideo = document.getElementById("videoPlayer");
//         oneVideo.onended = function () {
//             if (str.includes("U")) {
//                 console.log('上方播放結束');
//             } else if (str.includes("L")) {
//                 console.log('左方播放結束');
//             } else if (str.includes("D")) {
//                 console.log('下方播放結束');
//             } else if (str.includes("R")) {
//                 console.log('右方播放結束');
//             }

//         };
//     }
//     onendedVideo(videos[num]);
// }



//------------------------- 開啟投影 ---------------------
// 創建一個 PresentationRequest 對象，指定要投影的內容為 ['presentation.html']。
const presentationRequest = new PresentationRequest(['presentation.html']);
// 將這個投影請求設置為在瀏覽器菜單中的 "Cast" 選項的默認投影請求。
navigator.presentation.defaultRequest = presentationRequest;

// 判斷網頁是否可以開啟投影。
$(function () {
    if (isProjecting == false) {
        presentationRequest.getAvailability()
            .then(availability => {
                // 當投影設備可用性發生變化時觸發。
                availability.addEventListener('change', function () {
                    if (availability.value) {
                        console.log('> 可支援投影： ' + availability.value);
                        $("#status").text('> 目前設備可支援投影');
                    } else {
                        console.log('> 不可支援投影： ' + availability.value);
                        $("#status").text('> 目前設備不可支援投影');
                    }
                });
            })
            .catch(error => {
                $("#status").text('> 投影失敗，目前設備不可支援投影');
                console.log('> 不支援投影，' + error.name + ': ' + error.message);
            });
    }
})

let isProjecting = false; // 追蹤投影狀態
$("#projecOpen").on('click', function () {
    $("#status").text('開啟投影中...');
    console.log('開啟投影中...');
    presentationRequest.start()
        .then(connection => {
            isProjecting = true;
            // $("#status").text('> 已開啟投影, 已連接到:' + connection.url + ', ID: ' + connection.id);
            console.log('> 已開啟投影, 已連接到:' + connection.url + ', ID: ' + connection.id)
            $("#status").text('> 已開啟投影');
        })
        .catch(error => {
            isProjecting = false;
            console.error('開啟失敗！' + error.message);
            if (error.message.includes("No screens")) {
                $("#status").text('> 投影失敗，目前設備沒有可支援裝置');
            } else if (error.message.includes("Dialog closed")) {
                $("#status").text('> 投影失敗，未選取裝置，請再試一次');
            } else {
                $("#status").text('> 投影失敗');
            }
        });
});

$("#projecClose").on('click', function () {
    if (presentationConnection && isProjecting) {
        presentationConnection.terminate();
        $("#displayState_Presentate").text('關閉投影畫面中...');
        console.log('關閉投影畫面中...');
        // 更新投影狀態為關閉
        isProjecting = false;
    } else {
        console.log('投影並未開啟。');
    }
});

// 用於存儲投影連接的變數
let presentationConnection;
//當成功連接投影後，執行此函式
presentationRequest.addEventListener('connectionavailable', function (event) {
    // 存儲可用的投影連接。
    presentationConnection = event.connection;

    // 監聽投影連接的 "terminate" 事件，當關閉投影時觸發。
    presentationConnection.addEventListener('terminate', function () {
        $("#status").text('> 已關閉投影');
        console.log('> 已關閉投影畫面。');
    });

    // 監聽投影連接的 "message" 事件，當收到消息時觸發。
    presentationConnection.addEventListener('message', function (event) {
        console.log('> 從投影頁回傳的字串: ' + event.data);
    });

});

function sendMessage(str) {
    let message;

    // 先判斷聲音的方向
    const substrings = ['U', 'L', 'D', 'R'];
    for (const substring of substrings) {
        if (str.includes('video/' + substring)) {
            message = 'video/' + substring;
            break; // 找到後跳出迴圈
        }
    }
    // 再判斷聲音方向的第幾個影檔
    for (let i = 1; i <= 5; i++) {
        const searchString = message + i;
        if (str.includes(searchString)) {
            message = searchString;
            break; // 找到後跳出迴圈
        }
    }
    presentationConnection.send(JSON.stringify({ message }));
    console.log('> 傳送給投影頁的字串：' + message);

}



//---------------- 聲音播放紀錄功能 ------------------------
$("#cleanLog").on('click', function () {
    console.log('清除播放紀錄的 LOG');
    chromeSamples.clearLog();
    n = 0;
});

$("#saveLog").on('click', function () {
    // 獲取<pre id="log">元素中的文本內容
    const logContent = document.getElementById('log').innerText;
    // 創建一個 Blob 對象，將文本內容轉換為 Blob
    const blob = new Blob([logContent], { type: 'text/plain' });
    // 創建下載連結
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    // 設置下載文件名稱
    let fileName = '(自定義檔案名稱)';
    downloadLink.download = fileName + '.txt';
    // 將下載連結點擊，觸發下載
    downloadLink.click();
});
