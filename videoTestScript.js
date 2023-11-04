// 影片檔案的路徑
var videos = [
    'video/D1.mp4',
    // 'video/D2.mp4',
    // 'video/D3.mp4',
    'video/D4.mp4',
    'video/D5.mp4',
    'video/L1.mp4',
    // 'video/L2.mp4',
    // 'video/L3.mp4',
    'video/L4.mp4',
    'video/L5.mp4',
    'video/R1.mp4',
    // 'video/R2.mp4',
    // 'video/R3.mp4',
    'video/R4.mp4',
    'video/R5.mp4',
    'video/U1.mp4',
    // 'video/U2.mp4',
    // 'video/U3.mp4',
    'video/U4.mp4',
    'video/U5.mp4'

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

// 記錄當前播放的影片索引
let currentVideoIndex = 0;
// 記錄當前播放的聲音方向
let currentVideoName = '';

let shuffledVideos = shuffleArray(videos.slice());
// 播放下一個影檔
function playNextVideo() {
    // 將播放器的影片路徑設定為隨機排序後的路徑
    videoPlayer.src = shuffledVideos[currentVideoIndex];
    console.log((currentVideoIndex + 1) + '. ' + videoPlayer.src);
    let videoName = videoPlayer.src;
    if (currentVideoIndex < shuffledVideos.length) {
        // 判斷該播放的聲音方向
        if (videoName.includes('D')) {
            currentVideoName = '下方';
        } else if (videoName.includes('L')) {
            currentVideoName = '左方';
        } else if (videoName.includes('R')) {
            currentVideoName = '右方';
        } else if (videoName.includes('U')) {
            currentVideoName = '上方';
        }
        videoPlayer.load();
        videoPlayer.play();
        currentVideoIndex++;
        log(currentVideoIndex + '. ' + currentVideoName);
        

        // 影片播放結束事件
        videoPlayer.addEventListener('ended', playNextVideo);
    } else {
        // 所有影檔播放完畢，將索引歸零並重新整理播放順序
        videoPlayer.src = '';
        currentVideoIndex = 0;
        currentVideoName = '';
        console.log('> 結束播放');
        log('> 結束播放');
    }
};

$("#playVideo").on('click', function () {
    console.log('開始播放');
    log('> 開始播放');
    playNextVideo();
});

$("#pauseVideo").on('click', function () {
    videoPlayer.pause();
    videoPlayer.src = '';
    currentVideoIndex = 0;
    currentVideoName = '';
    shuffledVideos = shuffleArray(videos.slice());
    console.log('> 結束播放');
    log('> 結束播放');
});



var videosL = [
    'video/L1.mp4',
    'video/L2.mp4',
    'video/L3.mp4',
    'video/L4.mp4',
    'video/L5.mp4'
];
var videosR = [
    'video/R1.mp4',
    'video/R2.mp4',
    'video/R3.mp4',
    'video/R4.mp4',
    'video/R5.mp4'
];
var videosU = [
    'video/U1.mp4',
    'video/U2.mp4',
    'video/U3.mp4',
    'video/U4.mp4',
    'video/U5.mp4'
];
var videosD = [
    'video/D1.mp4',
    'video/D2.mp4',
    'video/D3.mp4',
    'video/D4.mp4',
    'video/D5.mp4'
];

$("#leftSpeaker").on('click', function () {
    log('左方聲音');
    let shuffledVideos = shuffleArray(videosL.slice());
    videoPlayer.src = shuffledVideos[Math.floor(Math.random() * 5)];
    console.log(videoPlayer.src);
    videoPlayer.play();
});
$("#rightSpeaker").on('click', function () {
    log('右方聲音');
    let shuffledVideos = shuffleArray(videosR.slice());
    videoPlayer.src = shuffledVideos[Math.floor(Math.random() * 5)];
    console.log(videoPlayer.src);
    videoPlayer.play();
});
$("#upSpeaker").on('click', function () {
    log('上方聲音');
    let shuffledVideos = shuffleArray(videosU.slice());
    videoPlayer.src = shuffledVideos[Math.floor(Math.random() * 5)];
    console.log(videoPlayer.src);
    videoPlayer.play();
});
$("#downSpeaker").on('click', function () {
    log('下方聲音');
    let shuffledVideos = shuffleArray(videosD.slice());
    videoPlayer.src = shuffledVideos[Math.floor(Math.random() * 5)];
    console.log(videoPlayer.src);
    videoPlayer.play();
});
