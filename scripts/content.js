// 获取设置并应用功能
chrome.storage.sync.get(
  ['enableCopy', 'removeVip', 'removeSidebar', 'removeRecommend'],
  (settings) => {
    const options = {
      enableCopy: settings.enableCopy ?? true,
      removeVip: settings.removeVip ?? true,
      removeSidebar: settings.removeSidebar ?? true,
      removeRecommend: settings.removeRecommend ?? true
    };

    // 应用设置的功能
    applySettings(options);
  }
);

function applySettings(options) {
  if (options.enableCopy) {
    enableCopyFunction();
  }
  
  if (options.removeVip) {
    removeVipLimit();
  }
  
  if (options.removeSidebar) {
    removeSidebar();
  }
  
  if (options.removeRecommend) {
    removeRecommend();
  }
}

function enableCopyFunction() {
  // 移除复制限制
  document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
      #content_views pre,
      #content_views code,
      #content_views * {
        user-select: text !important;
        -webkit-user-select: text !important;
      }
    `;
    document.head.appendChild(style);
    
    // 移除复制按钮和复制限制
    document.addEventListener('copy', (e) => {
      e.stopPropagation();
    }, true);
  });
}

function removeVipLimit() {
  const style = document.createElement('style');
  style.textContent = `
    .vip-mask,
    .hide-article-box,
    .readall_box,
    .article_content_vip,
    .download_exclusive {
      display: none !important;
    }
    .article_content,
    .article-content,
    #article_content,
    #content_views {
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
    }
    .article-preview-box {
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
      pointer-events: auto !important;
    }
  `;
  document.head.appendChild(style);

  // 移除模糊效果和其他限制
  document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('[style*="filter"], [style*="blur"], [style*="opacity"]');
    elements.forEach(element => {
      element.style.filter = 'none';
      element.style.opacity = '1';
      element.style.backgroundColor = 'transparent';
    });
  });
}

function removeSidebar() {
  const style = document.createElement('style');
  style.textContent = `
    .blog_container_aside,
    .recommend-right {
      display: none !important;
    }
    main {
      width: 100% !important;
    }
  `;
  document.head.appendChild(style);
}

function removeRecommend() {
  const style = document.createElement('style');
  style.textContent = `
    .recommend-box,
    .recommend-card-box {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
} 