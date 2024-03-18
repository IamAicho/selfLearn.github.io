//------------------------- BLE 連接 ESP32_Audio ---------------------
let deviceAudio;
var servAudio_uuid = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'.toLowerCase();
var charAudio_uuid = '6e400004-b5a3-f393-e0a9-e50e24dcca9e'.toLowerCase();
let characteristicAudio;
let valueStr;  // 傳給ESP32_Audio的字串指令

$(function () {
    $("#scanAudio").change(async function () {
        if (deviceAudio && deviceAudio.gatt.connected && !$(this).is(':checked')) {
            await deviceAudio.gatt.disconnect();
            characteristicAudio = null;
            $("#ble_status").text('藍芽已斷開！需重新連接');
            $('#scanAudio').prop('checked', false);
            console.log('> 已斷開 ESP32_Audio 連接。');
        } else {
            console.log('尋找 ESP32_BLE_Audio...');
            try {
                deviceAudio = await navigator.bluetooth.requestDevice({
                    filters: [{ namePrefix: 'ESP32_BLE_Audio' }],
                    optionalServices: [servAudio_uuid]
                });
                console.log('連接 ESP32_BLE_Audio 中...');
                $("#ble_status").text('藍芽裝置連接中...');

                const server = await deviceAudio.gatt.connect();
                const service = await server.getPrimaryService(servAudio_uuid);
                characteristicAudio = await service.getCharacteristic(charAudio_uuid);
                $("#ble_status").text('藍芽裝置已連接！');
                console.log('> 已連接到 ESP32_Audio 。');
            } catch (error) {
                $('#scanAudio').prop('checked', false);
                if (error.message.includes('cancelled')) {
                    $("#ble_status").text('已取消藍芽連接');
                    console.error('連接 ESP32_Audio 失敗！', error);
                } else {
                    console.error('連接 ESP32_Audio 失敗！', error);
                }
            }
        }

    });

});

// 定義收到上下左右訊息的函式(傳指令給 ESP32_Audio)
async function downSpeaker() {
    if (!deviceAudio || !characteristicAudio || !deviceAudio.gatt.connected) {
        $('#scanAudio').prop('checked', false);
        return;
    } else {
        valueStr = 'DOWN';
        console.log('> 傳送給ESP32_Audio: ' + valueStr);
    }

    await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));
}
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const source = audioCtx.createMediaElementSource($("#videoPlayer")[0]);
const splitter = audioCtx.createChannelSplitter(2);
const merger = audioCtx.createChannelMerger(2);
source.connect(splitter);
splitter.connect(merger, 0, 0); // 左聲道
splitter.connect(merger, 1, 1); // 右聲道
merger.connect(audioCtx.destination);
// 初始化左右声道音量
let leftVolume = 1;
let rightVolume = 1;
function updateVolume() {
    source.mediaElement.volume = leftVolume;
    merger.disconnect();
    splitter.disconnect();
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 1, 1);
    merger.connect(audioCtx.destination);
}
async function leftSpeaker() {
    if (!deviceAudio || !characteristicAudio || !deviceAudio.gatt.connected) {
        $('#scanAudio').prop('checked', false);

        console.log("目前尚未連接藍芽喇叭，預設用雙聲道播放左邊聲音。");
        leftVolume = 1;
        rightVolume = 0;
        updateVolume();
        return;
    } else {
        valueStr = 'LEFT';
        console.log('> 傳送給ESP32_Audio: ' + valueStr);
    }

    await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));
}
async function rightSpeaker() {
    if (!deviceAudio || !characteristicAudio || !deviceAudio.gatt.connected) {
        $('#scanAudio').prop('checked', false);

        console.log("目前尚未連接藍芽喇叭，預設用雙聲道播放右邊聲音。");
        leftVolume = 1;
        rightVolume = 0;
        updateVolume();
        return;
    } else {
        valueStr = 'RIGHT';
        console.log('> 傳送給ESP32_Audio: ' + valueStr);
    }

    await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));
}
async function upSpeaker() {
    if (!deviceAudio || !characteristicAudio || !deviceAudio.gatt.connected) {
        $('#scanAudio').prop('checked', false);
        return;
    } else {
        valueStr = 'UP';
        console.log('> 傳送給ESP32_Audio: ' + valueStr);
    }

    await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));
}

//---------------------- 隨機播放函式功能 -------------------------
let videos = [ // 此為預設的影音檔
    "video/highF_D1.mp4", "video/highF_L1.mp4", "video/highF_U1.mp4",
    "video/lowF_D1.mp4", "video/lowF_L2.mp4", "video/lowF_R2.mp4",
];
$("#videoInputedAmount").text(videos.length);

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
let currentVideoFrequency = ''; // 記錄當前播放的聲音頻率


let shuffledVideos = shuffleArray(videos.slice());

// 每個方向隨機各播放一遍
function playRandomVideo() {
    // 將播放器的影片路徑設定為隨機排序後的路徑
    videoPlayer.src = shuffledVideos[currentVideoIndex];
    let videoName = videoPlayer.src;
    if (currentVideoIndex < shuffledVideos.length) {
        // 判斷該播放的聲音頻率
        if (videoName.includes('high')) {
            currentVideoFrequency = '高頻';
        } else if (videoName.includes('low')) {
            currentVideoFrequency = '低頻';
        }
        // 判斷該播放的聲音方向
        if (videoName.includes('F_D')) {
            downSpeaker();
            currentVideoName = '下方';
        } else if (videoName.includes('F_L')) {
            leftSpeaker();
            currentVideoName = '左方';
        } else if (videoName.includes('F_R')) {
            rightSpeaker();
            currentVideoName = '右方';
        } else if (videoName.includes('F_U')) {
            upSpeaker();
            currentVideoName = '上方';
        }
        if (isProjecting == true) {
            sendMessage(videoName);
        }
        videoPlayer.load();
        videoPlayer.play();

        // 使用 jQuery 選取 tbody 中的所有 tr 元素
        let numberOfTrs = $('#log tbody tr').length;
        console.log(numberOfTrs);
        if (numberOfTrs == 0) {
            numberOfTrs = 1;
        } else {
            // 選擇 tbody 中的最後一個 tr，並獲取其第一個 td 元素的內容（數字）
            var numberStr = $('tbody tr:last td:first').text();
            // 使用 parseInt 將字符串轉換為整數
            numberOfTrs = parseInt(numberStr, 10);
            console.log('最後一個 tr 的數字:', numberOfTrs);
            numberOfTrs++;
        }

        console.log(numberOfTrs + ', ' + String(videoName));
        console.log(currentVideoFrequency + ', ' + currentVideoName + ', vol_' + $('#vol').text());
        // 創建新的表格行元素
        let newRow = $('<tr>');
        newRow.append(`<td>${numberOfTrs}</td>`);
        newRow.append(`<td>${currentVideoFrequency}</td>`);
        newRow.append(`<td>${currentVideoName}</td>`);
        newRow.append(`<td>${$('#vol').text()}</td>`);
        newRow.append(`<td>
                        <input type="radio" id="noReact${numberOfTrs}" name="reaction${numberOfTrs}" value="noReact" checked>
                        <label for="noReact${numberOfTrs}">無反應</label><br>
                        <input type="radio" id="wrongReact${numberOfTrs}" name="reaction${numberOfTrs}" value="wrongReact">
                        <label for="wrongReact${numberOfTrs}">找錯方向</label>
                        <input type="radio" id="rightReact${numberOfTrs}" name="reaction${numberOfTrs}" value="rightReact">
                        <label for="rightReact${numberOfTrs}">找對方向</label>
                    </td>`);
        newRow.append(`<td><a href='javascript:;'>刪除</a></td>`);
        // 為新行中的刪除按鈕設置點擊事件處理程序
        newRow.find('a').click(function () {
            // 在點擊時，刪除最近的祖先表格行
            $(this).closest('tr').remove();
        });
        // 在表格主體的頂部添加新行
        // $('tbody').prepend(newRow);
        // 在表格主體的底部添加新行
        $('tbody').append(newRow);

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
        currentVideoFrequency = '';
        console.log('> 結束隨機播放');
        shuffledVideos = shuffleArray(videos.slice())

        playRandomVideo();
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
$("#upSpeaker").on('click', function () {
    upSpeaker();
    console.log("> 點擊上方按鈕");
    if (videoPlayer.paused) {
        console.log("目前上傳後的影音個數:" + videoFiles.length);
        if (videoFiles.length != 0) {
            if (isProjecting == true) {
                // 傳字串指令到投影頁面
                presentationConnection.send(JSON.stringify({ "message": "playRandomVideo" }));
                console.log('> 傳送給投影頁的字串：playRandomVideo');
                playOneVideoFiles("F_U");

            } else {
                playOneVideoFiles("F_U");
            }
        } else {
            if (isProjecting == true) {
                // 傳字串指令到投影頁面
                presentationConnection.send(JSON.stringify({ "message": "playRandomVideo" }));
                console.log('> 傳送給投影頁的字串：playRandomVideo');
                playOneVideo("F_U");

            } else {
                playOneVideo("F_U");
            }
        }

    } else {
        console.log("影片原本正在播放");
        if (isProjecting == true) {
            presentationConnection.send(JSON.stringify({ "message": "pauseVideo" }));
            console.log('> 傳送給投影頁的字串：pauseVideo');
        };
        videoPlayer.pause();
        videoPlayer.src = '';
        console.log('> 播放終止');
    }
});
$("#leftSpeaker").on('click', function () {
    leftSpeaker();
    console.log("> 點擊左方按鈕");
    if (videoPlayer.paused) {
        console.log("目前上傳後的影音個數:" + videoFiles.length);
        if (videoFiles.length != 0) {
            if (isProjecting == true) {
                // 傳字串指令到投影頁面
                presentationConnection.send(JSON.stringify({ "message": "playRandomVideo" }));
                console.log('> 傳送給投影頁的字串：playRandomVideo');
                playOneVideoFiles("F_L");

            } else {
                playOneVideoFiles("F_L");
            }
        } else {
            if (isProjecting == true) {
                // 傳字串指令到投影頁面
                presentationConnection.send(JSON.stringify({ "message": "playRandomVideo" }));
                console.log('> 傳送給投影頁的字串：playRandomVideo');
                playOneVideo("F_L");

            } else {
                playOneVideo("F_L");
            }
        }

    } else {
        console.log("影片原本正在播放");
        if (isProjecting == true) {
            presentationConnection.send(JSON.stringify({ "message": "pauseVideo" }));
            console.log('> 傳送給投影頁的字串：pauseVideo');
        };
        videoPlayer.pause();
        videoPlayer.src = '';
        console.log('> 播放終止');
    }
});
$("#downSpeaker").on('click', function () {
    downSpeaker();
    console.log("> 點擊下方按鈕");
    if (videoPlayer.paused) {
        console.log("目前上傳後的影音個數:" + videoFiles.length);
        if (videoFiles.length != 0) {
            if (isProjecting == true) {
                // 傳字串指令到投影頁面
                presentationConnection.send(JSON.stringify({ "message": "playRandomVideo" }));
                console.log('> 傳送給投影頁的字串：playRandomVideo');
                playOneVideoFiles("F_D");

            } else {
                playOneVideoFiles("F_D");
            }
        } else {
            if (isProjecting == true) {
                // 傳字串指令到投影頁面
                presentationConnection.send(JSON.stringify({ "message": "playRandomVideo" }));
                console.log('> 傳送給投影頁的字串：playRandomVideo');
                playOneVideo("F_D");

            } else {
                playOneVideo("F_D");
            }
        }

    } else {
        console.log("影片原本正在播放");
        if (isProjecting == true) {
            presentationConnection.send(JSON.stringify({ "message": "pauseVideo" }));
            console.log('> 傳送給投影頁的字串：pauseVideo');
        };
        videoPlayer.pause();
        videoPlayer.src = '';
        console.log('> 播放終止');
    }
});
$("#rightSpeaker").on('click', function () {
    rightSpeaker();
    console.log("> 點擊右方按鈕");
    if (videoPlayer.paused) {
        console.log("目前上傳後的影音個數:" + videoFiles.length);
        if (videoFiles.length != 0) {
            if (isProjecting == true) {
                // 傳字串指令到投影頁面
                presentationConnection.send(JSON.stringify({ "message": "playRandomVideo" }));
                console.log('> 傳送給投影頁的字串：playRandomVideo');
                playOneVideoFiles("F_R");

            } else {
                playOneVideoFiles("F_R");
            }
        } else {
            if (isProjecting == true) {
                // 傳字串指令到投影頁面
                presentationConnection.send(JSON.stringify({ "message": "playRandomVideo" }));
                console.log('> 傳送給投影頁的字串：playRandomVideo');
                playOneVideo("F_R");

            } else {
                playOneVideo("F_R");
            }
        }

    } else {
        console.log("影片原本正在播放");
        if (isProjecting == true) {
            presentationConnection.send(JSON.stringify({ "message": "pauseVideo" }));
            console.log('> 傳送給投影頁的字串：pauseVideo');
        };
        videoPlayer.pause();
        videoPlayer.src = '';
        console.log('> 播放終止');
    }
});

function playOneVideo(directionStr) {
    console.log("收到的字串為" + directionStr);
    let filteredVideos = videos.filter(video => video.includes(directionStr));
    console.log(filteredVideos);
    // 選擇一個隨機索引
    let randomIndex = Math.floor(Math.random() * filteredVideos.length);
    // 從 filteredVideos 中取得隨機影片
    let randomVideo = filteredVideos[randomIndex];
    console.log("隨機播放的影片：" + randomVideo);
    videoPlayer.src = randomVideo;
    // 判斷該播放的聲音頻率
    if (randomVideo.includes('high')) {
        currentVideoFrequency = '高頻';
    } else if (randomVideo.includes('low')) {
        currentVideoFrequency = '低頻';
    }
    // 判斷該播放的聲音方向
    if (randomVideo.includes('F_D')) {
        downSpeaker();
        currentVideoName = '下方';
    } else if (randomVideo.includes('F_L')) {
        leftSpeaker();
        currentVideoName = '左方';
    } else if (randomVideo.includes('F_R')) {
        rightSpeaker();
        currentVideoName = '右方';
    } else if (randomVideo.includes('F_U')) {
        upSpeaker();
        currentVideoName = '上方';
    }
    if (isProjecting == true) {
        sendMessage(randomVideo);
    }
    videoPlayer.load();
    videoPlayer.play();

    // 使用 jQuery 選取 tbody 中的所有 tr 元素
    let numberOfTrs = $('#log tbody tr').length;
    console.log(numberOfTrs);
    if (numberOfTrs == 0) {
        numberOfTrs = 1;
    } else {
        // 選擇 tbody 中的最後一個 tr，並獲取其第一個 td 元素的內容（數字）
        var numberStr = $('tbody tr:last td:first').text();
        // 使用 parseInt 將字符串轉換為整數
        numberOfTrs = parseInt(numberStr, 10);
        console.log("最後一個 tr 的數字:", numberOfTrs);
        numberOfTrs++;
    }
    console.log(numberOfTrs + ', ' + currentVideoFrequency + ', ' + currentVideoName + ', vol_' + $('#vol').text());
    // 創建新的表格行元素
    let newRow = $('<tr>');
    newRow.append(`<td>${numberOfTrs}</td>`);
    newRow.append(`<td>${currentVideoFrequency}</td>`);
    newRow.append(`<td>${currentVideoName}</td>`);
    newRow.append(`<td>${$('#vol').text()}</td>`);
    newRow.append(`<td>
                        <input type="radio" id="noReact${numberOfTrs}" name="reaction${numberOfTrs}" value="noReact" checked>
                        <label for="noReact${numberOfTrs}">無反應</label><br>
                        <input type="radio" id="wrongReact${numberOfTrs}" name="reaction${numberOfTrs}" value="wrongReact">
                        <label for="wrongReact${numberOfTrs}">找錯方向</label>
                        <input type="radio" id="rightReact${numberOfTrs}" name="reaction${numberOfTrs}" value="rightReact">
                        <label for="rightReact${numberOfTrs}">找對方向</label>
                    </td>`);
    newRow.append(`<td><a href='javascript:;'>刪除</a></td>`);
    // 為新行中的刪除按鈕設置點擊事件處理程序
    newRow.find('a').click(function () {
        // 在點擊時，刪除最近的祖先表格行
        $(this).closest('tr').remove();
    });
    // 在表格主體的底部添加新行
    $('tbody').append(newRow);

    let loopVideos = document.getElementById("videoPlayer");
    // 影片播放結束事件
    loopVideos.onended = function () {
        videoPlayer.src = '';
        console.log("> 播放結束");
    };
}

function playOneVideoFiles(directionStr) {
    console.log("收到的字串為" + directionStr);
    let filteredVideos = shuffledVideoFiles.filter(video => video.includes(directionStr));
    console.log(filteredVideos);
    // 選擇一個隨機索引
    let randomIndex = Math.floor(Math.random() * filteredVideos.length);
    // 從 filteredVideos 中取得隨機影片
    let randomVideo = filteredVideos[randomIndex];
    console.log("隨機播放的影片：" + randomVideo);
    videoPlayer.src = randomVideo;
    // 判斷該播放的聲音頻率
    if (randomVideo.includes('high')) {
        currentVideoFrequency = '高頻';
    } else if (randomVideo.includes('low')) {
        currentVideoFrequency = '低頻';
    }
    // 判斷該播放的聲音方向
    if (randomVideo.includes('F_D')) {
        downSpeaker();
        currentVideoName = '下方';
    } else if (randomVideo.includes('F_L')) {
        leftSpeaker();
        currentVideoName = '左方';
    } else if (randomVideo.includes('F_R')) {
        rightSpeaker();
        currentVideoName = '右方';
    } else if (randomVideo.includes('F_U')) {
        upSpeaker();
        currentVideoName = '上方';
    }
    if (isProjecting == true) {
        sendMessage(randomVideo);
    }
    videoPlayer.load();
    videoPlayer.play();

    // 使用 jQuery 選取 tbody 中的所有 tr 元素
    let numberOfTrs = $('#log tbody tr').length;
    console.log(numberOfTrs);
    if (numberOfTrs == 0) {
        numberOfTrs = 1;
    } else {
        // 選擇 tbody 中的最後一個 tr，並獲取其第一個 td 元素的內容（數字）
        var numberStr = $('tbody tr:last td:first').text();
        // 使用 parseInt 將字符串轉換為整數
        numberOfTrs = parseInt(numberStr, 10);
        console.log("最後一個 tr 的數字:", numberOfTrs);
        numberOfTrs++;
    }
    console.log(numberOfTrs + ', ' + currentVideoFrequency + ', ' + currentVideoName + ', vol_' + $('#vol').text());
    // 創建新的表格行元素
    let newRow = $('<tr>');
    newRow.append(`<td>${numberOfTrs}</td>`);
    newRow.append(`<td>${currentVideoFrequency}</td>`);
    newRow.append(`<td>${currentVideoName}</td>`);
    newRow.append(`<td>${$('#vol').text()}</td>`);
    newRow.append(`<td>
                        <input type="radio" id="noReact${numberOfTrs}" name="reaction${numberOfTrs}" value="noReact" checked>
                        <label for="noReact${numberOfTrs}">無反應</label><br>
                        <input type="radio" id="wrongReact${numberOfTrs}" name="reaction${numberOfTrs}" value="wrongReact">
                        <label for="wrongReact${numberOfTrs}">找錯方向</label>
                        <input type="radio" id="rightReact${numberOfTrs}" name="reaction${numberOfTrs}" value="rightReact">
                        <label for="rightReact${numberOfTrs}">找對方向</label>
                    </td>`);
    newRow.append(`<td><a href='javascript:;'>刪除</a></td>`);
    // 為新行中的刪除按鈕設置點擊事件處理程序
    newRow.find('a').click(function () {
        // 在點擊時，刪除最近的祖先表格行
        $(this).closest('tr').remove();
    });
    // 在表格主體的底部添加新行
    $('tbody').append(newRow);

    let loopVideos = document.getElementById("videoPlayer");
    // 影片播放結束事件
    loopVideos.onended = function () {
        videoPlayer.src = '';
        console.log("> 播放結束");
    };
}



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
$("#projecOpen").change(function () {
    if (isProjecting == false && $(this).is(':checked')) {
        $("#projector_status").text('開啟投影中...');
        console.log('開啟投影中...');
        presentationRequest.start()
            .then(connection => {
                isProjecting = true;
                console.log('> 已開啟投影, 已連接到:' + connection.url + ', ID: ' + connection.id)
                $("#projector_status").text('已開啟投影');
            })
            .catch(error => {
                isProjecting = false;
                $('#projecOpen').prop('checked', false);
                console.error('開啟失敗！' + error.message);
                if (error.message.includes("No screens")) {
                    $("#projector_status").text('目前設備沒有可支援裝置');
                } else if (error.message.includes("Dialog closed")) {
                    $("#projector_status").text('未選取裝置');
                } else {
                    $("#projector_status").text('投影失敗');
                }
            });
    } else {
        // console.log('投影已開啟。');
        if (presentationConnection && isProjecting) {
            presentationConnection.terminate();
            $("#projector_status").text('關閉投影畫面中...');
            console.log('關閉投影畫面中...');
            // 更新投影狀態為關閉
            isProjecting = false;
        } else {
            console.log('投影並未開啟。');
        }
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
        $("#projector_status").text('已關閉投影');
        console.log('> 已關閉投影畫面。');
    });

    // 監聽投影連接的 "message" 事件，當收到消息時觸發。
    presentationConnection.addEventListener('message', function (event) {
        console.log('> 從投影頁回傳的字串: ' + event.data);
    });

});

function sendMessage(str) {
    let parts = str.split("video/");
    let message = parts.length > 1 ? parts[1] : "";
    presentationConnection.send(JSON.stringify({ message }));
    console.log('> 傳送給投影頁的字串：' + message);

}



//---------------- 聲音播放紀錄功能 ------------------------
$("#cleanLog").on('click', function () {
    console.log('清除播放紀錄的 LOG');
    chromeSamples.clearLog();
    $('#log').prepend(`
        <thead>
            <tr>
                <th>順序</th>
                <th>頻率</th>
                <th>方向</th>
                <th>音量</th>
                <th>評估</th>
            </tr>
        </thead>
        <tbody></tbody>`);

    currentVideoIndex = 0;
});

function exportToExcel() {
    // 創建一個新的 Excel 工作簿
    let wb = XLSX.utils.book_new();

    // 收集表格資料
    let data = [];
    $('table thead').each(function (rowIndex, row) {
        let rowData = [];
        $(row).find('th').each(function (colIndex, col) {
            rowData.push($(col).text());
        });
        data.push(rowData);
    });
    $('table tbody tr').each(function (rowIndex, row) {
        let rowData = [];
        $(row).find('td').each(function (colIndex, col) {
            if (colIndex == 4) {
                console.log($(col).find('input:checked').val());
                rowData.push($(col).find('input:checked').val());
            } else {
                rowData.push($(col).text());
            }
        });
        // 使用 splice 删除第六個元素（索引為 5）
        rowData.splice(5, 1);
        data.push(rowData);
    });
    console.log(data);

    // 將表格資料轉換為 SheetJS 中的工作表格式
    let ws = XLSX.utils.aoa_to_sheet(data);

    // 將工作表添加到工作簿
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // 將工作簿轉換為二進制格式
    let wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    let blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    let fileName = $("#fileName").val();
    console.log(`檔名: Evaluation_${fileName}.xlsx`);
    if (fileName.length == 0) {
        alert("請輸入要儲存的檔名");
    } else {
        // 使用 FileSaver.js 儲存 Blob 為檔案
        saveAs(blob, `Evaluation_${fileName}.xlsx`);
    }

};
// 將字串轉換為 ArrayBuffer
function s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}
$("#saveLog").on('click', function () {
    exportToExcel();
});





//-------------------------- 上傳學習影檔 ------------------------------
let videoFiles = [];
let shuffledVideoFiles;
$(function () {
    $("#videoInput").on("click", function () {
        alert("格式需求: \n1.必須為mp4 \n2.檔名需包含頻率、方向、數量之代號 \n3.高頻(highF)、低頻(lowF)、上下左右(U,D,L,R) \n\n舉例(1) highF_R1.mp4 \n舉例(2) lowF_D2.mp4");
    });
    $("#videoInput").on("change", function (event) {
        chromeSamples.clearLog();
        $('#log').prepend(`
        <thead>
            <tr>
                <th>順序</th>
                <th>頻率</th>
                <th>方向</th>
                <th>音量</th>
                <th>評估</th>
            </tr>
        </thead>
        <tbody></tbody>`);
        currentVideoIndex = 0;

        let files = event.target.files;
        videoFiles = [];
        if (files.length > 0) {
            $("#videoInputedContent").empty();
            for (let i = 0; i < files.length; i++) {
                console.log("檔案名稱: " + files[i].name);
                if (files[i].name.includes('high')) {
                    videoFiles.push("video/highF/" + files[i].name);
                } else if (files[i].name.includes('low')) {
                    videoFiles.push("video/lowF/" + files[i].name);
                }
                $("#videoInputedContent").append(files[i].name + ", ")
            }
            console.log(videoFiles);
            // $("#videoInputedContent").text(videoFiles);
            shuffledVideoFiles = shuffleArray(videoFiles.slice())
        } else {
            $("#videoInputedContent").text("目前為預設的學習影檔！");
            $("#videoInputedContent").append("總共有" + videos.length + "個檔案");
        }
    });
});

function playRandomVideoFiles() {
    // 將播放器的影片路徑設定為隨機排序後的路徑
    videoPlayer.src = shuffledVideoFiles[currentVideoIndex];
    let videoName = videoPlayer.src;
    if (currentVideoIndex < shuffledVideoFiles.length) {
        // 判斷該播放的聲音頻率
        if (videoName.includes('high')) {
            currentVideoFrequency = '高頻';
        } else if (videoName.includes('low')) {
            currentVideoFrequency = '低頻';
        }
        // 判斷該播放的聲音方向
        if (videoName.includes('F_D')) {
            downSpeaker();
            currentVideoName = '下方';
        } else if (videoName.includes('F_L')) {
            leftSpeaker();
            currentVideoName = '左方';
        } else if (videoName.includes('F_R')) {
            rightSpeaker();
            currentVideoName = '右方';
        } else if (videoName.includes('F_U')) {
            upSpeaker();
            currentVideoName = '上方';
        }
        if (isProjecting == true) {
            sendMessage(videoName);
        }
        videoPlayer.load();
        videoPlayer.play();

        // 使用 jQuery 選取 tbody 中的所有 tr 元素
        let numberOfTrs = $('#log tbody tr').length;
        console.log(numberOfTrs);
        if (numberOfTrs == 0) {
            numberOfTrs = 1;
        } else {
            // 選擇 tbody 中的最後一個 tr，並獲取其第一個 td 元素的內容（數字）
            var numberStr = $('tbody tr:last td:first').text();
            // 使用 parseInt 將字符串轉換為整數
            numberOfTrs = parseInt(numberStr, 10);
            console.log('最後一個 tr 的數字:', numberOfTrs);
            numberOfTrs++;
        }

        console.log(numberOfTrs + ', ' + String(videoName));
        console.log(currentVideoName + ', vol_' + $('#vol').text());
        // 創建新的表格行元素
        let newRow = $('<tr>');
        newRow.append(`<td>${numberOfTrs}</td>`);
        newRow.append(`<td>${currentVideoFrequency}</td>`);
        newRow.append(`<td>${currentVideoName}</td>`);
        newRow.append(`<td>${$('#vol').text()}</td>`);
        newRow.append(`<td>
                        <input type="radio" id="noReact${numberOfTrs}" name="reaction${numberOfTrs}" value="noReact" checked>
                        <label for="noReact${numberOfTrs}">無反應</label><br>
                        <input type="radio" id="wrongReact${numberOfTrs}" name="reaction${numberOfTrs}" value="wrongReact">
                        <label for="wrongReact${numberOfTrs}">找錯方向</label>
                        <input type="radio" id="rightReact${numberOfTrs}" name="reaction${numberOfTrs}" value="rightReact">
                        <label for="rightReact${numberOfTrs}">找對方向</label>
                    </td>`);
        newRow.append(`<td><a href='javascript:;'>刪除</a></td>`);
        // 為新行中的刪除按鈕設置點擊事件處理程序
        newRow.find('a').click(function () {
            // 在點擊時，刪除最近的祖先表格行
            $(this).closest('tr').remove();
        });
        // 在表格主體的頂部添加新行
        // $('tbody').prepend(newRow);
        // 在表格主體的底部添加新行
        $('tbody').append(newRow);

        let loopVideos = document.getElementById("videoPlayer");
        // 影片播放結束事件
        loopVideos.onended = function () {
            // alert("The video has ended");
            playRandomVideoFiles();
        };
    } else {
        // 所有影檔播放完畢，將索引歸零並重新整理播放順序
        videoPlayer.src = '';
        currentVideoIndex = 0;
        currentVideoName = '';
        currentVideoFrequency = '';
        console.log('> 結束隨機播放');
        shuffledVideoFiles = shuffleArray(videoFiles.slice())

        // 獲取 iconContainer 元素
        var iconContainer = $('#videoIconContainer');
        // 檢查當前圖標是否是播放圖標
        if (iconContainer.find('i').hasClass('fa-play')) {
            // 如果是播放圖標，則切換為暫停圖標
            iconContainer.html('<i class="fa-solid fa-pause"></i>');
        } else {
            // 如果是暫停圖標，則切換為播放圖標
            iconContainer.html('<i class="fa-solid fa-play"></i>');
        }
    }
};

$("#playRandomVideo_files").on('click', function () {
    // 獲取 iconContainer 元素
    let iconContainer = $('#videoIconContainer');

    if (videoPlayer.paused) {
        if (iconContainer.find('i').hasClass('fa-play')) {
            // 如果是播放圖標，則切換為暫停圖標
            iconContainer.html('<i class="fa-solid fa-pause"></i>');
        }

        // console.log(videoFiles.length);
        if (videoFiles.length != 0) {
            if (isProjecting == true) {
                // 傳字串指令到投影頁面
                presentationConnection.send(JSON.stringify({ "message": "playRandomVideo" }));
                console.log('> 傳送給投影頁的字串：playRandomVideo');
                playRandomVideoFiles();

            } else {
                playRandomVideoFiles();
            }
        } else {
            if (isProjecting == true) {
                // 傳字串指令到投影頁面
                presentationConnection.send(JSON.stringify({ "message": "playRandomVideo" }));
                console.log('> 傳送給投影頁的字串：playRandomVideo');
                playRandomVideo();

            } else {
                playRandomVideo();
            }
        }

    } else {
        // console.log("影片正在播放");
        if (iconContainer.find('i').hasClass('fa-pause')) {
            // 如果是暫停圖標，則切換為播放圖標
            iconContainer.html('<i class="fa-solid fa-play"></i>');
        }

        if (isProjecting == true) {
            presentationConnection.send(JSON.stringify({ "message": "pauseVideo" }));
            console.log('> 傳送給投影頁的字串：pauseVideo');
        };
        console.log('影片原本正在播放');
        videoPlayer.pause();
        videoPlayer.src = '';
        // currentVideoIndex = 0;
        currentVideoName = '';
        currentVideoFrequency = '';
        console.log('> 結束播放');
        shuffledVideos = shuffleArray(videos.slice())
        shuffledVideoFiles = shuffleArray(videoFiles.slice())



        // $('tbody tr').each(function () {
        //     // 獲取當前 tr 中的第一個 td 元素的內容（數字）
        //     let number = $(this).find('td:first').text();
        //     console.log('數字:', number);
        // });

        // 選擇 tbody 中的最後一個 tr，並獲取其第一個 td 元素的內容（數字）
        var number = $('tbody tr:last td:first').text();
        console.log('最後一個 tr 的數字:', number);
    }
});


