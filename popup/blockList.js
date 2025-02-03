document.addEventListener('DOMContentLoaded', function() {
    const blockedSitesList = document.getElementById('blockedSitesList');
    const siteInput = document.getElementById('siteInput');
    const addSiteBtn = document.getElementById('addSite');

    function loadBlockedSites() {
        chrome.storage.sync.get(['blockedSites'], function(result) {
            const blockedSites = result.blockedSites || [];
            blockedSitesList.innerHTML = '';
            
            if (blockedSites.length === 0) {
                blockedSitesList.innerHTML = '<div class="empty-message">暂无屏蔽网站</div>';
                return;
            }

            blockedSites.forEach(site => {
                const div = document.createElement('div');
                div.className = 'blocked-site';
                div.innerHTML = `
                    <span class="site-url">${site}</span>
                    <button class="remove-btn" data-site="${site}">删除</button>
                `;
                blockedSitesList.appendChild(div);
            });

            // 添加删除按钮的事件监听
            document.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const siteToRemove = this.getAttribute('data-site');
                    removeBlockedSite(siteToRemove);
                });
            });
        });
    }

    function removeBlockedSite(site) {
        chrome.storage.sync.get(['blockedSites'], function(result) {
            const blockedSites = result.blockedSites || [];
            const newBlockedSites = blockedSites.filter(s => s !== site);
            chrome.storage.sync.set({ blockedSites: newBlockedSites }, function() {
                loadBlockedSites();
            });
        });
    }

    if (addSiteBtn && siteInput) {
        addSiteBtn.addEventListener('click', function() {
            const site = siteInput.value.trim();
            
            // 验证输入
            if (!site) {
                alert('请输入网站地址');
                return;
            }

            // 验证格式
            if (site.includes('http://') || site.includes('https://')) {
                alert('请不要输入 http:// 或 https://');
                return;
            }

            // 检查是否是有效的域名格式
            const domainRegex = /^(\*\.)?\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
            if (!domainRegex.test(site)) {
                alert('请输入有效的网站地址格式');
                return;
            }

            chrome.storage.sync.get(['blockedSites'], function(result) {
                const blockedSites = result.blockedSites || [];
                if (blockedSites.includes(site)) {
                    alert('该网站已在屏蔽列表中');
                    return;
                }

                blockedSites.push(site);
                chrome.storage.sync.set({ blockedSites: blockedSites }, function() {
                    siteInput.value = '';
                    loadBlockedSites();
                });
            });
        });

        // 添加回车键支持
        siteInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addSiteBtn.click();
            }
        });
    }

    loadBlockedSites();
}); 