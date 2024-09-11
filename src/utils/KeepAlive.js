import { useEffect } from 'react';

const KeepAlive = () => {
  useEffect(() => {
    // 一定時間ごとにリクエストを送る
    const intervalId = setInterval(() => {
      fetch('https://marketing-app-rxkb.onrender.com/keepalive', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          console.log('Keep-alive request sent successfully');
        })
        .catch(error => {
          console.error('There was a problem with the keep-alive request:', error);
        });
    }, 5 * 60 * 1000); // 5分ごとにリクエスト

    // クリーンアップ: コンポーネントがアンマウントされたらインターバルをクリア
    return () => clearInterval(intervalId);
  }, []);

  return null; // このコンポーネントはUIには影響しません
};

export default KeepAlive;
