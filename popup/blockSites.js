document.addEventListener('DOMContentLoaded', function() {
    const openBlockListBtn = document.getElementById('openBlockList');
    const enableBlockSites = document.getElementById('enableBlockSites');

    if (openBlockListBtn && enableBlockSites) {
        // 打开屏蔽列表管理页面
        openBlockListBtn.addEventListener('click', function() {
            chrome.tabs.create({
                url: chrome.runtime.getURL('popup/blockList.html')
            });
        });

        // 加载保存的状态
        chrome.storage.sync.get(['enableBlockSites'], function(result) {
            enableBlockSites.checked = result.enableBlockSites || false;
        });

        // 保存开关状态
        enableBlockSites.addEventListener('change', function() {
            chrome.storage.sync.set({
                enableBlockSites: this.checked
            });
        });
    }
}); 