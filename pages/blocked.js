// 获取被屏蔽的URL
function initBlockedPage() {
    const originalUrl = new URL(window.location.href).searchParams.get('originalUrl') || window.location.href;
    document.getElementById('blockedUrl').textContent = originalUrl;

    // 管理屏蔽列表按钮
    document.getElementById('openManager').addEventListener('click', function() {
        // 在新标签页中打开管理页面
        chrome.tabs.create({
            url: chrome.runtime.getURL('popup/blockList.html')
        }).catch(() => {
            // 如果chrome.tabs不可用，使用普通方式打开
            window.open(chrome.runtime.getURL('popup/blockList.html'), '_blank');
        });
    });

    // 返回上一页按钮
    document.getElementById('goBack').addEventListener('click', function() {
        // 尝试返回上一页
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // 如果没有历史记录，则关闭当前页面
            window.close();
        }
    });
}

// 添加错误处理
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Error:', message, error);
};

// 当 DOM 加载完成后初始化页面
document.addEventListener('DOMContentLoaded', initBlockedPage); 