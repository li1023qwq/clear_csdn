// 监听扩展安装或更新
chrome.runtime.onInstalled.addListener(() => {
  updateBlockRules();
});

// 监听存储变化
chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedSites || changes.enableBlockSites) {
    updateBlockRules();
  }
});

// 添加消息监听
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openBlockList') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('popup/blockList.html')
    });
  }
});

// 更新屏蔽规则
async function updateBlockRules() {
  try {
    const { blockedSites = [], enableBlockSites = false } = await chrome.storage.sync.get(['blockedSites', 'enableBlockSites']);
    
    // 如果功能被禁用，清除所有规则
    if (!enableBlockSites) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: (await chrome.declarativeNetRequest.getDynamicRules()).map(rule => rule.id)
      });
      return;
    }

    // 创建新规则
    const rules = blockedSites.map((site, index) => {
      let urlFilter = site;
      if (!urlFilter.includes('*')) {
        urlFilter = `*://${urlFilter}/*`;
      } else if (!urlFilter.startsWith('*')) {
        urlFilter = `*://${urlFilter}`;
      }

      return {
        id: index + 1,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            url: `${chrome.runtime.getURL('pages/blocked.html')}?originalUrl=${encodeURIComponent(urlFilter)}`
          }
        },
        condition: {
          urlFilter: urlFilter,
          resourceTypes: ['main_frame']
        }
      };
    });

    // 更新规则
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: (await chrome.declarativeNetRequest.getDynamicRules()).map(rule => rule.id),
      addRules: rules
    });
  } catch (error) {
    console.error('更新屏蔽规则失败:', error);
  }
}