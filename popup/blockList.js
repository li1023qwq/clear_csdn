document.addEventListener('DOMContentLoaded', function() {
    const blockedSitesList = document.getElementById('blockedSitesList');
    const siteInput = document.getElementById('siteInput');
    const addSiteBtn = document.getElementById('addSite');

    function getRootDomain(domain) {
        const parts = domain.split('.');
        if (parts.length > 2) {
            return parts.slice(-2).join('.');
        }
        return domain;
    }

    function detectPattern(domains) {
        if (domains.length < 3) return null;
        
        // 提取域名主体部分
        const parts = domains.map(domain => {
            const match = domain.match(/^(\*\.)?([^\.]+)\.([^\.]+)$/);
            return match ? match.slice(2) : null;
        }).filter(Boolean);

        // 检查是否有共同模式
        if (parts.length >= 3) {
            const first = parts[0];
            const last = parts[parts.length - 1];
            
            // 检查前缀是否都是数字
            const isNumericPrefix = parts.every(part => /^\d+$/.test(part[0]));
            
            // 检查后缀是否相同
            if (isNumericPrefix && first[1] === last[1]) {
                return `*.${first[1]}`;
            }
        }
        return null;
    }

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
                
                // 检查是否已经存在
                if (blockedSites.includes(site)) {
                    alert('该网站已在屏蔽列表中');
                    return;
                }

                // 获取根域名
                const rootDomain = getRootDomain(site.replace('*.', ''));
                
                // 统计相同根域名的数量
                const sameRootCount = blockedSites.filter(s => {
                    const currentRoot = getRootDomain(s.replace('*.', ''));
                    return currentRoot === rootDomain;
                }).length;

                // 如果相同根域名已经存在一个，则自动添加通配符
                if (sameRootCount >= 1) {
                    const wildcardDomain = `*.${rootDomain}`;
                    if (!blockedSites.includes(wildcardDomain)) {
                        blockedSites.push(wildcardDomain);
                    }
                }

                // 检测是否有模式匹配
                const pattern = detectPattern([...blockedSites, site]);
                if (pattern && !blockedSites.includes(pattern)) {
                    blockedSites.push(pattern);
                }

                blockedSites.push(site);
                chrome.storage.sync.set({ blockedSites: blockedSites }, function() {
                    siteInput.value = '';
                    loadBlockedSites();
                    if (sameRootCount >= 1) {
                        alert(`检测到多个${rootDomain}下的域名，已自动添加通配符*.${rootDomain}到屏蔽列表`);
                    }
                    if (pattern) {
                        alert(`检测到相似域名模式，已自动添加通用屏蔽规则：${pattern}`);
                    }
                });
            });
        });

        // 保留原有的回车键支持
        siteInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addSiteBtn.click();
            }
        });
    }

    loadBlockedSites();
}); 