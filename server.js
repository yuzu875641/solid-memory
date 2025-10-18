// server.js

// 必要なモジュールのインポート
const express = require('express');
const rawyt = require('rawytjs');
const path = require('path');

const app = express();
const port = 3000;

// --- サーバー設定 ---

// フォームのデータを解析するためのミドルウェア
app.use(express.urlencoded({ extended: true })); 

// テンプレートエンジンをEJSに設定
app.set('view engine', 'ejs');
// 'views'ディレクトリからテンプレートファイルを読み込むように設定
app.set('views', path.join(__dirname, 'views'));

// --- ルーティング ---

// 1. ルート ('/') - ID入力フォームの表示
app.get('/', (req, res) => {
    // index.ejs (入力フォーム) をレンダリング
    res.render('index', { error: null });
});

// 2. '/get-streams' - フォームからのデータを受け取り、処理を実行
app.post('/get-streams', async (req, res) => {
    // フォームから送信された 'videoId' を取得し、前後の空白を削除
    const videoId = req.body.videoId ? req.body.videoId.trim() : '';

    if (!videoId) {
        // IDが空の場合はエラーとしてフォームに戻る
        return res.render('index', { error: 'YouTubeのVideo IDを入力してください。' });
    }

    let streams = null;
    let error = null;

    try {
        // rawytjsを使って動画ストリーム情報を取得
        // 戻り値はiTagをキーとするURLのオブジェクト
        streams = await rawyt.getSource(videoId);
        console.log(`** Video sources for ID: ${videoId} fetched successfully.`);
        
    } catch (err) {
        console.error(`rawytjs データの取得エラー for ID: ${videoId}`, err.message);
        // エラーメッセージをユーザー向けに整形
        error = `Video ID "${videoId}" のYouTubeストリーム情報の取得に失敗しました。IDが正しいか確認してください。`;
        // エラーの場合は入力フォームに戻る
        return res.render('index', { error: error });
    }

    // 取得成功時: EJSテンプレートにデータを渡してレンダリング
    res.render('streams', { 
        videoId: videoId,
        streams: streams, 
        error: null // 成功したのでエラーはnull
    });
});

// --- サーバーの起動 ---

app.listen(port, () => {
    console.log(`サーバーが http://localhost:${port} で起動しました。`);
});
