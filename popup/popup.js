document.addEventListener('DOMContentLoaded', () => {
  const options = ['enableCopy', 'removeVip', 'removeSidebar', 'removeRecommend'];
  
  // 加载保存的设置
  chrome.storage.sync.get(options, (result) => {
    options.forEach(option => {
      const checkbox = document.getElementById(option);
      checkbox.checked = result[option] ?? true;
    });
  });

  // 保存设置变更并刷新页面
  options.forEach(option => {
    document.getElementById(option).addEventListener('change', (e) => {
      chrome.storage.sync.set({ [option]: e.target.checked }, () => {
        // 获取当前标签页
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const currentTab = tabs[0];
          // 检查是否是 CSDN 页面
          if (currentTab.url.includes('csdn.net')) {
            // 刷新当前标签页
            chrome.tabs.reload(currentTab.id);
          }
        });
      });
    });
  });
}); 