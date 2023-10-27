//----------------------------當成功連接到控制方的連結---------------------------------

// 影片檔案的路徑
var videos = [
    'video/D1.mp4',
    'video/D2.mp4',
    'video/D3.mp4',
    'video/L1.mp4',
    'video/L2.mp4',
    'video/L3.mp4',
    'video/R1.mp4',
    'video/R2.mp4',
    'video/R3.mp4',
    'video/U1.mp4',
    'video/U2.mp4',
    'video/U3.mp4'
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




// 此函式為, 添加一個新的展示連接。
function addConnection(connection) {
    // 監聽連接的 "message" 事件，當收到消息時觸發。
    connection.addEventListener('message', function (event) {
        // 解析收到的 JSON 格式的消息。
        const receivedMessage = JSON.parse(event.data);
        connection.send('Received: ' + receivedMessage.message);
        // 當收到播放指令 "playVideo"
        if (receivedMessage.message === 'playVideo') {
            // connection.send('Received: ' + receivedMessage.message);

            // 記錄當前播放的影片索引
            let currentVideoIndex = 0;
            // 記錄當前播放的聲音方向
            let currentVideoName = '';

            let shuffledVideos = shuffleArray(videos.slice());
            // 將播放器的影片路徑設定為隨機排序後的路徑
            videoPlayer.src = shuffledVideos[currentVideoIndex];
            // 判斷該播放的聲音方向
            let videoName = shuffledVideos[currentVideoIndex];
            if (videoName.includes('D')) {
                currentVideoName = 'DOWN';
            } else if (videoName.includes('L')) {
                currentVideoName = 'LEFT';
            } else if (videoName.includes('R')) {
                currentVideoName = 'RIGHT';
            } else if (videoName.includes('U')) {
                currentVideoName = 'UP';
            }
            // connection.send(currentVideoIndex);
            connection.send('Star to play!!');
            videoPlayer.load();
            videoPlayer.play();
            connection.send(currentVideoName);
            currentVideoIndex++;

            // 影片播放結束事件
            videoPlayer.addEventListener('ended', playNextVideo);
            // 播放下一個影檔
            function playNextVideo() {
                // connection.send(currentVideoIndex);
                if (currentVideoIndex < shuffledVideos.length) {
                    // 將播放器的影片路徑設定為隨機排序後的路徑
                    videoPlayer.src = shuffledVideos[currentVideoIndex];
                    // 判斷該播放的聲音方向
                    let videoName = shuffledVideos[currentVideoIndex];
                    if (videoName.includes('D')) {
                        currentVideoName = 'DOWN';
                    } else if (videoName.includes('L')) {
                        currentVideoName = 'LEFT';
                    } else if (videoName.includes('R')) {
                        currentVideoName = 'RIGHT';
                    } else if (videoName.includes('U')) {
                        currentVideoName = 'UP';
                    }
                    videoPlayer.load();
                    videoPlayer.play();
                    connection.send(currentVideoName);
                    currentVideoIndex++;
                } else {
                    // 所有影檔播放完畢，將索引歸零並重新整理播放順序
                    connection.send('Stop playing!!');
                    // currentVideoIndex = 0;
                    // currentVideoName = '';
                    // shuffledVideos = shuffleArray(videos.slice());
                }
            };


        }

    });

};



$(function () {
    // 檢查是否支援展示接收功能。
    if (navigator.presentation.receiver) {
        // 獲取展示連接列表。
        navigator.presentation.receiver.connectionList.then(list => {
            // 將現有的連接添加到列表中。
            list.connections.map(connection => addConnection(connection));
            // 監聽連接可用事件，當有新的連接可用時觸發。
            list.addEventListener('connectionavailable', function (event) {
                // 添加新的連接到列表中。
                addConnection(event.connection);
            });
        });
    }
});
