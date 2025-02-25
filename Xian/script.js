// 游戏数据
const gameData = {
    sectName: '',
    masterName: '',
    masterLevel: '炼气期',
    masterStage: '初期', // 修炼阶段：初期、中期、后期
    masterProgress: 20,
    pills: 0,
    spiritStones: 100,
    disciples: [],
    selectedDisciple: null,
    cultivationLevels: ['炼气期', '筑基期', '金丹期', '元婴期', '化神期'],
    cultivationStages: ['初期', '中期', '后期'],
    discipleQualities: ['普通', '良好', '优秀', '卓越', '天才'],
    elements: ['金🌟', '木🌳', '水💧', '火🔥', '土🌍'],
    variantElements: ['雷⚡', '冰❄️', '毒☠️'],
    battleInProgress: false,
    battleLog: [],
    currentYear: 1,
    currentMonth: 1,
    currentElement: '金🌟', // 当前五行属性
    elementBonus: 1.5, // 当前五行加成
    sectLevel: 1, // 宗门等级
    sectLevelNames: ['初创', '小型', '中型', '大型', '一流', '顶级'],
    autoIncomeInterval: null, // 自动收入计时器
    autoPillGenerationInterval: null, // 自动炼丹计时器
    autoPillDistributionInterval: null, // 自动分配丹药计时器
    gameGoalReached: false,
    isAutoPillGenerating: false, // 是否自动炼丹
    isAutoPillDistributing: false, // 是否自动分配丹药
    treasures: {
        '灵草': { count: 0, effect: '提升修炼速度10%', value: 50 },
        '聚灵珠': { count: 0, effect: '提升灵石产出20%', value: 100 },
        '筑基丹': { count: 0, effect: '突破到金丹期必备', value: 200 },
        '结婴丹': { count: 0, effect: '突破到元婴期必备', value: 300 },
        '五行精华': { count: 0, effect: '增强五行相性', value: 150 },
        '龙血草': { count: 0, effect: '弟子资质提升', value: 300 }
    },
    otherSects: [
        {
            name: '天剑宗',
            level: 3,
            master: { name: '剑无痕', level: '金丹期', stage: '中期' },
            disciples: 8,
            element: '金🌟',
            relation: 0, // -100到100，表示关系
            lastInteraction: 0
        },
        {
            name: '青云门',
            level: 4,
            master: { name: '云逸风', level: '金丹期', stage: '后期' },
            disciples: 12,
            element: '木🌳',
            relation: 0,
            lastInteraction: 0
        },
        {
            name: '玄水宫',
            level: 2,
            master: { name: '水清寒', level: '筑基期', stage: '后期' },
            disciples: 5,
            element: '水💧',
            relation: 0,
            lastInteraction: 0
        }
    ]
};

// 随机名字生成
const randomNames = {
    sects: ['云霄', '天山', '蜀山', '昆仑', '青城', '武当', '峨眉', '龙虎', '玄天', '太极'],
    suffixes: ['宗', '派', '门', '阁', '观', '山', '殿', '谷', '峰', '洞'],
    surnames: ['张', '王', '李', '赵', '陈', '刘', '杨', '黄', '周', '吴', '郑', '孙', '林', '徐', '高', '梁', '朱', '秦', '许', '何'],
    names: ['天', '地', '玄', '黄', '宇', '宙', '洪', '荒', '日', '月', '盈', '昃', '辰', '宿', '列', '张', '寒', '来', '暑', '往', '秋', '收', '冬', '藏', '闰', '余', '成', '岁', '律', '吕', '调', '阳', '云', '腾', '致', '雨', '露', '结', '为', '霜']
};

// DOM 元素
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const startGameBtn = document.getElementById('start-game');
const sectNameInput = document.getElementById('sect-name');
const masterNameInput = document.getElementById('master-name');
const displaySectName = document.getElementById('display-sect-name');
const masterNameDisplay = document.getElementById('master-name-display');
const masterAvatar = document.getElementById('master-avatar');
const masterLevelDisplay = document.getElementById('master-level-display');
const pillCount = document.getElementById('pill-count');
const spiritStonesDisplay = document.getElementById('spirit-stones');
const generatePillsBtn = document.getElementById('generate-pills');
const masterCultivateBtn = document.getElementById('master-cultivate');
const pillContainer = document.getElementById('pill-container');
const disciplesContainer = document.getElementById('disciples-container');
const recruitDiscipleBtn = document.getElementById('recruit-disciple');
const recruitModal = document.getElementById('recruit-modal');
const recruitResult = document.getElementById('recruit-result');
const acceptDiscipleBtn = document.getElementById('accept-disciple');
const rejectDiscipleBtn = document.getElementById('reject-disciple');
const currentDateDisplay = document.getElementById('current-date');
const currentElementDisplay = document.getElementById('current-element');
const sectLevelDisplay = document.getElementById('sect-level');
const discipleCountDisplay = document.getElementById('disciple-count');
const discipleLimitDisplay = document.getElementById('disciple-limit');
const autoPillGenerateBtn = document.getElementById('auto-pill-generate');
const autoPillDistributeBtn = document.getElementById('auto-pill-distribute');

// 初始化游戏
startGameBtn.addEventListener('click', () => {
    // 如果用户没有输入宗门名称，随机生成一个
    if (!sectNameInput.value.trim()) {
        const randomSect = randomNames.sects[Math.floor(Math.random() * randomNames.sects.length)];
        const randomSuffix = randomNames.suffixes[Math.floor(Math.random() * randomNames.suffixes.length)];
        sectNameInput.value = randomSect + randomSuffix;
    }
    
    // 如果用户没有输入宗主名称，随机生成一个
    if (!masterNameInput.value.trim()) {
        const randomSurname = randomNames.surnames[Math.floor(Math.random() * randomNames.surnames.length)];
        const randomName1 = randomNames.names[Math.floor(Math.random() * randomNames.names.length)];
        const randomName2 = randomNames.names[Math.floor(Math.random() * randomNames.names.length)];
        masterNameInput.value = randomSurname + randomName1 + randomName2;
    }
    
    gameData.sectName = sectNameInput.value;
    gameData.masterName = masterNameInput.value;
    
    displaySectName.textContent = gameData.sectName;
    masterNameDisplay.textContent = gameData.masterName;
    masterAvatar.textContent = gameData.masterName.charAt(0);
    masterLevelDisplay.textContent = `${gameData.masterLevel}${gameData.masterStage}`;
    sectLevelDisplay.textContent = `宗门等级：${gameData.sectLevelNames[gameData.sectLevel - 1]}`;
    updateDiscipleLimit();
    
    // 初始化日期和五行
    updateDateAndElement();
    
    // 启动自动收入
    startAutoIncome();
    
    startScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
});

// 更新弟子上限显示
function updateDiscipleLimit() {
    const limit = getDiscipleLimit();
    discipleLimitDisplay.textContent = limit;
    discipleCountDisplay.textContent = gameData.disciples.length;
}

// 获取当前弟子上限
function getDiscipleLimit() {
    return 3 + (gameData.sectLevel - 1); // 每提升一级宗门等级只增加1个弟子上限
}

// 启动自动收入
function startAutoIncome() {
    // 每60秒根据宗门等级自动增加灵石
    gameData.autoIncomeInterval = setInterval(() => {
        const baseIncome = 10 * gameData.sectLevel;
        // 弟子贡献额外收入
        const discipleIncome = gameData.disciples.reduce((total, disciple) => {
            const levelIndex = gameData.cultivationLevels.indexOf(disciple.level);
            return total + (levelIndex + 1) * 5;
        }, 0);
        
        const totalIncome = baseIncome + discipleIncome;
        gameData.spiritStones += totalIncome;
        spiritStonesDisplay.textContent = gameData.spiritStones;
        
        // 显示收入提示
        showFloatingText(spiritStonesDisplay, `+${totalIncome}`, '#32CD32');
        
        // 同时推进时间
        advanceTime();
    }, 60000); // 60秒
}

// 自动炼丹
function toggleAutoPillGeneration() {
    if (gameData.isAutoPillGenerating) {
        // 停止自动炼丹
        clearInterval(gameData.autoPillGenerationInterval);
        gameData.isAutoPillGenerating = false;
        autoPillGenerateBtn.textContent = "自动炼丹";
        autoPillGenerateBtn.classList.remove('active');
    } else {
        // 开始自动炼丹
        gameData.isAutoPillGenerating = true;
        autoPillGenerateBtn.textContent = "停止炼丹";
        autoPillGenerateBtn.classList.add('active');
        
        gameData.autoPillGenerationInterval = setInterval(() => {
            if (gameData.spiritStones >= 10) {
                generatePills();
            }
        }, 15000); // 每15秒尝试炼丹一次
    }
}

// 自动分配丹药
function toggleAutoPillDistribution() {
    if (gameData.isAutoPillDistributing) {
        // 停止自动分配
        clearInterval(gameData.autoPillDistributionInterval);
        gameData.isAutoPillDistributing = false;
        autoPillDistributeBtn.textContent = "自动分配";
        autoPillDistributeBtn.classList.remove('active');
    } else {
        // 开始自动分配
        gameData.isAutoPillDistributing = true;
        autoPillDistributeBtn.textContent = "停止分配";
        autoPillDistributeBtn.classList.add('active');
        
        gameData.autoPillDistributionInterval = setInterval(() => {
            if (gameData.pills > 0 && gameData.disciples.length > 0) {
                // 随机选择一个弟子分配丹药
                const randomIndex = Math.floor(Math.random() * gameData.disciples.length);
                const disciple = gameData.disciples[randomIndex];
                givePillToDisciple(disciple.id);
            }
        }, 10000); // 每10秒分配一次
    }
}

// 显示浮动文字效果
function showFloatingText(element, text, color) {
    const floatingText = document.createElement('div');
    floatingText.textContent = text;
    floatingText.style.position = 'absolute';
    floatingText.style.color = color;
    floatingText.style.fontSize = '16px';
    floatingText.style.fontWeight = 'bold';
    floatingText.style.pointerEvents = 'none';
    floatingText.style.zIndex = '1000';
    
    // 获取元素位置
    const rect = element.getBoundingClientRect();
    floatingText.style.left = `${rect.left + rect.width / 2}px`;
    floatingText.style.top = `${rect.top}px`;
    
    document.body.appendChild(floatingText);
    
    // 动画效果
    let opacity = 1;
    let top = rect.top;
    
    const animation = setInterval(() => {
        opacity -= 0.05;
        top -= 1;
        floatingText.style.opacity = opacity;
        floatingText.style.top = `${top}px`;
        
        if (opacity <= 0) {
            clearInterval(animation);
            floatingText.remove();
        }
    }, 50);
}

// 更新日期和五行
function updateDateAndElement() {
    currentDateDisplay.textContent = `元始${gameData.currentYear}年 ${gameData.currentMonth}月`;
    
    // 每月轮换五行属性
    const elementIndex = (gameData.currentYear * 12 + gameData.currentMonth - 1) % gameData.elements.length;
    gameData.currentElement = gameData.elements[elementIndex];
    currentElementDisplay.textContent = `本月时运五行：${gameData.currentElement}`;
}

// 时间推进
function advanceTime() {
    gameData.currentMonth++;
    if (gameData.currentMonth > 12) {
        gameData.currentMonth = 1;
        gameData.currentYear++;
    }
    updateDateAndElement();
    
    // 每次时间推进都获得一些灵石
    const baseIncome = 5 * gameData.sectLevel;
    // 弟子贡献额外收入
    const discipleIncome = gameData.disciples.reduce((total, disciple) => {
        const levelIndex = gameData.cultivationLevels.indexOf(disciple.level);
        return total + (levelIndex + 1) * 2;
    }, 0);
    
    const totalIncome = baseIncome + discipleIncome;
    gameData.spiritStones += totalIncome;
    spiritStonesDisplay.textContent = gameData.spiritStones;
    
    // 显示收入提示
    showFloatingText(spiritStonesDisplay, `+${totalIncome}`, '#32CD32');
    
    // 检查弟子叛变
    checkDiscipleRebellion();
    
    // 更新其他宗门状态
    updateOtherSects();
}

// 检查弟子叛变
function checkDiscipleRebellion() {
    if (gameData.disciples.length === 0) return;
    
    gameData.disciples.forEach(disciple => {
        // 如果弟子停滞时间过长，或者长期没有资源供应，可能会叛变
        if (!disciple.stagnationMonths) disciple.stagnationMonths = 0;
        
        // 如果修为停滞超过6个月，增加叛变风险
        if (disciple.progress >= 95 && !disciple.lastPillTime) {
            disciple.stagnationMonths++;
        } else if (disciple.lastPillTime && (gameData.currentYear * 12 + gameData.currentMonth) - disciple.lastPillTime > 3) {
            // 超过3个月没有丹药供应
            disciple.stagnationMonths++;
        } else {
            disciple.stagnationMonths = Math.max(0, disciple.stagnationMonths - 1);
        }
        
        // 叛变概率基于停滞时间和弟子资质
        const qualityIndex = gameData.discipleQualities.indexOf(disciple.quality);
        const rebellionChance = (disciple.stagnationMonths - 6) * 0.05 * (1 - qualityIndex * 0.1);
        
        if (rebellionChance > 0 && Math.random() < rebellionChance) {
            // 弟子叛变
            alert(`弟子${disciple.name}因长期修为停滞，心生不满，已离开宗门！`);
            dismissDisciple(disciple.id, true);
        } else if (disciple.stagnationMonths >= 6) {
            // 警告玩家弟子可能叛变
            alert(`弟子${disciple.name}因修为停滞，开始心生不满，请及时提供资源！`);
        }
    });
}

// 生成丹药
function generatePills() {
    // 基础花费
    let baseCost = 10;
    
    // 根据弟子资质增加花费
    const qualityMultipliers = {
        '普通': 1,
        '良好': 1.2,
        '优秀': 1.5,
        '卓越': 2,
        '天才': 3
    };
    
    // 计算弟子资质加成
    let qualityMultiplier = 1;
    if (gameData.disciples.length > 0) {
        // 找出最高资质的弟子
        const highestQualityDisciple = gameData.disciples.reduce((best, current) => {
            const bestIndex = gameData.discipleQualities.indexOf(best.quality);
            const currentIndex = gameData.discipleQualities.indexOf(current.quality);
            return currentIndex > bestIndex ? current : best;
        }, gameData.disciples[0]);
        
        qualityMultiplier = qualityMultipliers[highestQualityDisciple.quality];
    }
    
    // 最终花费
    const finalCost = Math.floor(baseCost * qualityMultiplier);
    
    if (gameData.spiritStones < finalCost) {
        if (!gameData.isAutoPillGenerating) {
            alert(`灵石不足，需要${finalCost}灵石炼制丹药`);
        }
        return;
    }
    
    gameData.spiritStones -= finalCost;
    spiritStonesDisplay.textContent = gameData.spiritStones;
    
    // 根据当前五行属性调整丹药产量
    let pillMultiplier = 1;
    if (gameData.currentElement === '金🌟') {
        pillMultiplier = 1.5; // 金属性加成丹药产量
    }
    
    // 高资质弟子也会增加丹药产量
    const pillsGenerated = Math.floor((Math.floor(Math.random() * 3) + 1) * pillMultiplier * Math.sqrt(qualityMultiplier));
    gameData.pills += pillsGenerated;
    pillCount.textContent = gameData.pills;
    
    // 丹药生成动画
    for (let i = 0; i < pillsGenerated; i++) {
        setTimeout(() => {
            createPillAnimation();
        }, i * 300);
    }
    
    // 时间推进
    advanceTime();
}

// 生成丹药按钮事件
generatePillsBtn.addEventListener('click', generatePills);

// 自动炼丹按钮事件
autoPillGenerateBtn.addEventListener('click', toggleAutoPillGeneration);

// 自动分配丹药按钮事件
autoPillDistributeBtn.addEventListener('click', toggleAutoPillDistribution);

// 宗主修炼
masterCultivateBtn.addEventListener('click', () => {
    // 宗主修炼不需要灵石
    
    // 增加修为进度
    gameData.masterProgress += Math.floor(10 + Math.random() * 15);
    
    // 检查是否升级
    if (gameData.masterProgress >= 100) {
        checkMasterBreakthrough();
    }
    
    // 更新宗主修为显示
    document.getElementById('master-progress').style.width = `${gameData.masterProgress}%`;
    masterLevelDisplay.textContent = `${gameData.masterLevel}${gameData.masterStage}`;
    
    // 时间推进
    advanceTime();
});

// 创建丹药动画
function createPillAnimation() {
    const pill = document.createElement('div');
    pill.className = 'pill';
    
    // 随机位置
    const x = Math.random() * 100 - 50;
    const y = Math.random() * 100 - 50;
    
    pill.style.left = `calc(50% + ${x}px)`;
    pill.style.top = `calc(50% + ${y}px)`;
    
    pillContainer.appendChild(pill);
    
    // 淡入动画
    setTimeout(() => {
        pill.style.opacity = '1';
        pill.style.animation = `pillFloat ${2 + Math.random()}s infinite alternate`;
    }, 10);
    
    // 一段时间后移除丹药
    setTimeout(() => {
        pill.style.opacity = '0';
        setTimeout(() => {
            pill.remove();
        }, 500);
    }, 5000);
}

// 修复招收弟子按钮
document.addEventListener('DOMContentLoaded', () => {
    // 重新获取DOM元素
    const recruitDiscipleBtn = document.getElementById('recruit-disciple');
    const recruitModal = document.getElementById('recruit-modal');
    const recruitResult = document.getElementById('recruit-result');
    const acceptDiscipleBtn = document.getElementById('accept-disciple');
    const rejectDiscipleBtn = document.getElementById('reject-disciple');
    
    // 确保按钮存在后再添加事件监听器
    if (recruitDiscipleBtn) {
        recruitDiscipleBtn.addEventListener('click', () => {
            if (gameData.spiritStones < 20) {
                alert('灵石不足，无法招收弟子');
                return;
            }
            
            const discipleLimit = getDiscipleLimit();
            if (gameData.disciples.length >= discipleLimit) {
                alert(`弟子数量已达上限(${discipleLimit})，提升宗门等级可增加弟子上限`);
                return;
            }
            
            gameData.spiritStones -= 20;
            spiritStonesDisplay.textContent = gameData.spiritStones;
            
            // 生成随机弟子
            const newDisciple = generateRandomDisciple();
            
            // 显示招收弹窗
            recruitResult.innerHTML = `
                <div style="text-align: center; margin-bottom: 15px;">
                    <div style="font-size: 1.2em; margin-bottom: 5px;" class="quality-${newDisciple.quality.toLowerCase()}">${newDisciple.name}</div>
                    <div class="quality-${newDisciple.quality.toLowerCase()}" style="margin-bottom: 10px;">资质: ${newDisciple.quality}</div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <div>悟性: ${newDisciple.stats.intelligence}</div>
                    <div>根骨: ${newDisciple.stats.physique}</div>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <div>心性: ${newDisciple.stats.spirit}</div>
                    <div>运势: ${newDisciple.stats.luck}</div>
                </div>
                <div style="margin-top: 10px; text-align: center;">
                    <div>五行属性: <span class="element-${newDisciple.element.replace(/[^\u4e00-\u9fa5]/g, '').toLowerCase()}">${newDisciple.element}</span></div>
                </div>
            `;
            
            recruitModal.style.display = 'flex';
            
            // 临时存储新弟子
            gameData.newDisciple = newDisciple;
            
            // 时间推进
            advanceTime();
        });
    }
    
    // 修复宗主闭关修炼按钮
    const masterCultivateBtn = document.getElementById('master-cultivate');
    if (masterCultivateBtn) {
        masterCultivateBtn.addEventListener('click', () => {
            // 宗主修炼不需要灵石
            
            // 增加修为进度
            gameData.masterProgress += Math.floor(10 + Math.random() * 15);
            
            // 检查是否升级
            if (gameData.masterProgress >= 100) {
                checkMasterBreakthrough();
            }
            
            // 更新宗主修为显示
            document.getElementById('master-progress').style.width = `${gameData.masterProgress}%`;
            masterLevelDisplay.textContent = `${gameData.masterLevel}${gameData.masterStage}`;
            
            // 时间推进
            advanceTime();
        });
    }
    
    // 设置初始五行
    updateDateAndElement();
});

// 接受弟子
acceptDiscipleBtn.addEventListener('click', () => {
    if (gameData.newDisciple) {
        gameData.disciples.push(gameData.newDisciple);
        renderDisciples();
        gameData.newDisciple = null;
        recruitModal.style.display = 'none';
        
        // 更新弟子数量显示
        discipleCountDisplay.textContent = gameData.disciples.length;
    }
});

// 拒绝弟子
rejectDiscipleBtn.addEventListener('click', () => {
    gameData.newDisciple = null;
    recruitModal.style.display = 'none';
});

// 生成随机弟子
function generateRandomDisciple() {
    // 随机生成名字
    const surname = randomNames.surnames[Math.floor(Math.random() * randomNames.surnames.length)];
    const name1 = randomNames.names[Math.floor(Math.random() * randomNames.names.length)];
    const name2 = randomNames.names[Math.floor(Math.random() * randomNames.names.length)];
    const fullName = surname + name1 + name2;
    
    // 随机选择资质，使用加权随机
    const qualityIndex = weightedRandom([0.4, 0.3, 0.2, 0.08, 0.02]);
    const quality = gameData.discipleQualities[qualityIndex];
    
    // 根据资质调整属性基础值和波动范围
    const baseStats = 50 + qualityIndex * 10;
    const variance = 20 - qualityIndex * 2;
    
    // 随机选择五行属性
    const element = gameData.elements[Math.floor(Math.random() * gameData.elements.length)];
    
    // 根据当前五行气运，调整弟子属性
    let statBonus = 0;
    if (element === gameData.currentElement) {
        statBonus = 10; // 如果弟子五行与当前五行相符，属性加成
    }
    
    return {
        id: Date.now() + Math.floor(Math.random() * 1000), // 确保ID唯一
        name: fullName,
        level: '炼气期',
        stage: '初期',
        progress: 0,
        pills: 0,
        quality: quality,
        element: element,
        stats: {
            intelligence: Math.floor(baseStats + statBonus + (Math.random() * variance * 2 - variance)),
            physique: Math.floor(baseStats + statBonus + (Math.random() * variance * 2 - variance)),
            spirit: Math.floor(baseStats + statBonus + (Math.random() * variance * 2 - variance)),
            luck: Math.floor(baseStats + statBonus + (Math.random() * variance * 2 - variance))
        }
    };
}

// 加权随机函数
function weightedRandom(weights) {
    const sum = weights.reduce((a, b) => a + b, 0);
    const r = Math.random() * sum;
    let acc = 0;
    
    for (let i = 0; i < weights.length; i++) {
        acc += weights[i];
        if (r < acc) return i;
    }
    
    return 0;
}

// 渲染弟子列表
function renderDisciples() {
    disciplesContainer.innerHTML = '';
    
    gameData.disciples.forEach(disciple => {
        const card = document.createElement('div');
        card.className = 'disciple-card';
        card.dataset.id = disciple.id;
        
        // 添加五行属性标识
        const elementClass = `element-${disciple.element.toLowerCase()}`;
        
        card.innerHTML = `
            <div class="disciple-avatar" style="border-color: var(--${elementClass}-color, #D2691E);">${disciple.name.charAt(0)}</div>
            <div class="disciple-name quality-${disciple.quality.toLowerCase()}">${disciple.name}</div>
            <div class="disciple-level">${disciple.level}${disciple.stage}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${disciple.progress}%;"></div>
            </div>
            <div class="disciple-stats">
                <div>丹药: ${disciple.pills}</div>
                <div class="quality-${disciple.quality.toLowerCase()}">资质: ${disciple.quality}</div>
            </div>
            <div class="disciple-element">
                <span class="${elementClass}">${disciple.element}</span>
            </div>
            <div class="disciple-actions">
                <button class="disciple-btn" data-action="breakthrough">突破</button>
                <button class="disciple-btn dismiss" data-action="dismiss">逐出</button>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            // 如果点击的是按钮，处理按钮事件
            if (e.target.classList.contains('disciple-btn')) {
                const action = e.target.dataset.action;
                if (action === 'breakthrough') {
                    attemptBreakthrough(disciple.id);
                } else if (action === 'dismiss') {
                    dismissDisciple(disciple.id);
                }
                return;
            }
            
            // 否则，处理丹药分配
            if (gameData.pills > 0) {
                givePillToDisciple(disciple.id);
            } else {
                alert('没有丹药可分配');
            }
        });
        
        disciplesContainer.appendChild(card);
    });
}

// 给弟子丹药
function givePillToDisciple(discipleId) {
    if (gameData.pills <= 0) {
        if (!gameData.isAutoPillDistributing) {
            alert('没有丹药可分配');
        }
        return;
    }
    
    // 找到选中的弟子
    const disciple = gameData.disciples.find(d => d.id === discipleId);
    if (!disciple) return;
    
    // 创建丹药传输动画
    const discipleCard = document.querySelector(`.disciple-card[data-id="${discipleId}"]`);
    if (discipleCard) {
        const pillTransfer = document.createElement('div');
        pillTransfer.className = 'pill-transfer';
        
        // 获取丹药图标和弟子卡片的位置
        const pillIcon = document.querySelector('.resource-icon');
        const pillRect = pillIcon.getBoundingClientRect();
        const cardRect = discipleCard.getBoundingClientRect();
        
        // 设置初始位置（丹药图标位置）
        pillTransfer.style.left = `${pillRect.left + pillRect.width / 2}px`;
        pillTransfer.style.top = `${pillRect.top + pillRect.height / 2}px`;
        
        document.body.appendChild(pillTransfer);
        
        // 动画：从丹药图标移动到弟子卡片
        const startTime = Date.now();
        const duration = 800; // 800ms
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 计算当前位置
            const currentX = pillRect.left + (cardRect.left - pillRect.left) * progress + pillRect.width / 2;
            const currentY = pillRect.top + (cardRect.top - pillRect.top) * progress + pillRect.height / 2;
            
            pillTransfer.style.left = `${currentX}px`;
            pillTransfer.style.top = `${currentY}px`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // 动画结束，更新数据
                gameData.pills--;
                disciple.pills++;
                pillCount.textContent = gameData.pills;
                
                // 增加修为进度
                let progressIncrease = Math.floor(5 + Math.random() * 10);
                
                // 如果弟子五行与当前五行相符，修炼速度加成
                if (disciple.element === gameData.currentElement) {
                    progressIncrease = Math.floor(progressIncrease * gameData.elementBonus);
                    showFloatingText(discipleCard, `修炼加成!`, '#FFA500');
                }
                
                disciple.progress += progressIncrease;
                
                // 检查是否升级
                if (disciple.progress >= 100) {
                    // 先检查阶段提升
                    const currentStageIndex = gameData.cultivationStages.indexOf(disciple.stage);
                    if (currentStageIndex < gameData.cultivationStages.length - 1) {
                        // 提升阶段
                        disciple.stage = gameData.cultivationStages[currentStageIndex + 1];
                        disciple.progress = 0;
                        alert(`${disciple.name}突破到${disciple.level}${disciple.stage}！`);
                    } else {
                        // 阶段已满，准备提升境界
                        const currentLevelIndex = gameData.cultivationLevels.indexOf(disciple.level);
                        if (currentLevelIndex < gameData.cultivationLevels.length - 1) {
                            // 需要渡劫才能提升境界
                            showBreakthroughAnimation(disciple);
                        } else {
                            disciple.progress = 100;
                        }
                    }
                }
                
                renderDisciples();
                
                // 移除动画元素
                pillTransfer.remove();
            }
        }
        
        animate();
    }
}

// 显示渡劫动画
function showBreakthroughAnimation(disciple) {
    // 创建渡劫动画容器
    const tribulationContainer = document.createElement('div');
    tribulationContainer.className = 'tribulation-container';
    tribulationContainer.innerHTML = `
        <div class="tribulation-content">
            <h3>${disciple.name}正在渡劫</h3>
            <div class="tribulation-animation">
                <div class="lightning-container"></div>
                <div class="disciple-figure">${disciple.name.charAt(0)}</div>
            </div>
            <div class="tribulation-progress">
                <div class="tribulation-bar"></div>
            </div>
            <div class="tribulation-status">准备渡劫...</div>
        </div>
    `;
    
    document.body.appendChild(tribulationContainer);
    
    // 渡劫过程
    const lightningContainer = tribulationContainer.querySelector('.lightning-container');
    
    // 这里应该有更多代码来完成渡劫动画
    // 暂时简单实现
    setTimeout(() => {
        tribulationContainer.remove();
        
        // 提升境界
        const currentLevelIndex = gameData.cultivationLevels.indexOf(disciple.level);
        disciple.level = gameData.cultivationLevels[currentLevelIndex + 1];
        disciple.stage = gameData.cultivationStages[0]; // 重置为初期
        disciple.progress = 0;
        
        alert(`渡劫成功！${disciple.name}晋升到${disciple.level}${disciple.stage}！`);
        
        // 检查游戏目标
        checkGameGoal();
        renderDisciples();
    }, 3000);
}

// 尝试突破
function attemptBreakthrough(discipleId) {
    const disciple = gameData.disciples.find(d => d.id === discipleId);
    if (!disciple) return;
    
    if (gameData.spiritStones < 50) {
        alert('灵石不足，需要50灵石辅助突破');
        return;
    }
    
    if (disciple.progress < 80) {
        alert('修为不足，需要至少80%的修为才能尝试突破');
        return;
    }
    
    gameData.spiritStones -= 50;
    spiritStonesDisplay.textContent = gameData.spiritStones;
    
    // 突破成功率基于资质和当前修为
    let successRate = 0.3 + (disciple.progress - 80) / 100; // 基础30%，修为每高1%增加1%成功率
    
    // 资质加成
    const qualityIndex = gameData.discipleQualities.indexOf(disciple.quality);
    successRate += qualityIndex * 0.1; // 每级资质增加10%成功率
    
    // 五行相符加成
    if (disciple.element === gameData.currentElement) {
        successRate += 0.2; // 五行相符增加20%成功率
    }
    
    // 最终成功率限制在10%-95%之间
    successRate = Math.max(0.1, Math.min(0.95, successRate));
    
    if (Math.random() < successRate) {
        // 突破成功
        const currentLevelIndex = gameData.cultivationLevels.indexOf(disciple.level);
        if (currentLevelIndex < gameData.cultivationLevels.length - 1) {
            disciple.level = gameData.cultivationLevels[currentLevelIndex + 1];
            disciple.progress = 0;
            alert(`突破成功！${disciple.name}晋升到${disciple.level}！`);
            
            // 检查游戏目标
            checkGameGoal();
        }
    } else {
        // 突破失败
        disciple.progress = Math.max(0, disciple.progress - 20); // 损失20%修为
        alert(`突破失败！${disciple.name}修为受损，跌落到${disciple.progress}%`);
    }
    
    renderDisciples();
    advanceTime();
}

// 逐出弟子
function dismissDisciple(discipleId) {
    if (!confirm('确定要将此弟子逐出师门吗？')) return;
    
    const index = gameData.disciples.findIndex(d => d.id === discipleId);
    if (index !== -1) {
        gameData.disciples.splice(index, 1);
        renderDisciples();
        
        // 更新弟子数量显示
        discipleCountDisplay.textContent = gameData.disciples.length;
    }
}

// 检查游戏目标
function checkGameGoal() {
    if (gameData.gameGoalReached) return;
    
    // 检查是否有至少三名化神期弟子
    const chemicalSpiritDisciples = gameData.disciples.filter(d => d.level === '化神期').length;
    
    if (chemicalSpiritDisciples >= 3 && gameData.sectLevel === 6) {
        gameData.gameGoalReached = true;
        alert('恭喜！你已经成功将宗门发展到顶级，并培养出三名化神期弟子，成为修仙界第一宗门！');
        
        // 可以在这里添加游戏胜利的其他效果
    }
}

// 添加天材地宝数据到游戏数据
gameData.treasures = {
    '灵草': { count: 0, effect: '提升修炼速度10%', value: 50 },
    '聚灵珠': { count: 0, effect: '提升灵石产出20%', value: 100 },
    '筑基丹': { count: 0, effect: '直接提升一个小境界', value: 200 },
    '五行精华': { count: 0, effect: '增强五行相性', value: 150 },
    '龙血草': { count: 0, effect: '弟子资质提升', value: 300 }
};

// 更新天材地宝显示
function updateTreasuresDisplay() {
    const treasuresContainer = document.getElementById('treasures-container');
    if (!treasuresContainer) return;
    
    treasuresContainer.innerHTML = '';
    
    for (const [name, data] of Object.entries(gameData.treasures)) {
        if (data.count > 0) {
            const treasureItem = document.createElement('div');
            treasureItem.className = 'treasure-item';
            treasureItem.innerHTML = `
                <div class="treasure-name">${name}</div>
                <div class="treasure-count">x${data.count}</div>
                <div class="treasure-effect">${data.effect}</div>
                <button class="use-treasure-btn" data-treasure="${name}">使用</button>
            `;
            treasuresContainer.appendChild(treasureItem);
        }
    }
    
    // 如果没有天材地宝，显示提示
    if (treasuresContainer.children.length === 0) {
        treasuresContainer.innerHTML = '<div class="no-treasures">暂无天材地宝，可通过历练获得</div>';
    }
}

// 修改历练功能，增加获得天材地宝的机会
function adventure() {
    // 历练需要消耗时间
    advanceTime();
    
    // 基础灵石收益
    const baseStones = Math.floor(5 + Math.random() * 15);
    gameData.spiritStones += baseStones;
    spiritStonesDisplay.textContent = gameData.spiritStones;
    
    // 显示灵石获取提示
    showFloatingText(spiritStonesDisplay, `+${baseStones}`, '#32CD32');
    
    // 低概率获得丹药
    if (Math.random() < 0.2) { // 20%概率获得丹药
        const pillsFound = Math.floor(Math.random() * 2) + 1;
        gameData.pills += pillsFound;
        pillCount.textContent = gameData.pills;
        showFloatingText(pillCount, `+${pillsFound}`, '#FFA500');
        
        // 丹药生成动画
        for (let i = 0; i < pillsFound; i++) {
            setTimeout(() => {
                createPillAnimation();
            }, i * 300);
        }
    }
    
    // 低概率获得天材地宝
    if (Math.random() < 0.1) { // 10%概率获得天材地宝
        const treasureNames = Object.keys(gameData.treasures);
        const randomTreasure = treasureNames[Math.floor(Math.random() * treasureNames.length)];
        
        gameData.treasures[randomTreasure].count++;
        alert(`历练中发现天材地宝：${randomTreasure}！`);
        
        // 更新天材地宝显示
        updateTreasuresDisplay();
    }
}

// 使用天材地宝
function useTreasure(treasureName) {
    if (!gameData.treasures[treasureName] || gameData.treasures[treasureName].count <= 0) {
        alert('没有该天材地宝！');
        return;
    }
    
    // 减少数量
    gameData.treasures[treasureName].count--;
    
    // 根据不同天材地宝产生不同效果
    switch(treasureName) {
        case '灵草':
            // 提升修炼速度10%，持续一段时间
            alert('使用灵草，修炼速度提升10%，持续10次修炼');
            gameData.cultivationBoost = (gameData.cultivationBoost || 0) + 0.1;
            gameData.cultivationBoostCount = (gameData.cultivationBoostCount || 0) + 10;
            break;
            
        case '聚灵珠':
            // 提升灵石产出20%，持续一段时间
            alert('使用聚灵珠，灵石产出提升20%，持续10次时间推进');
            gameData.incomeBoost = (gameData.incomeBoost || 0) + 0.2;
            gameData.incomeBoostCount = (gameData.incomeBoostCount || 0) + 10;
            break;
            
        case '筑基丹':
            // 直接提升一个小境界
            if (gameData.masterProgress >= 80) {
                // 如果修为接近突破，直接突破
                gameData.masterProgress = 100;
                checkMasterBreakthrough();
            } else {
                // 否则增加大量修为
                gameData.masterProgress += 50;
                if (gameData.masterProgress > 100) {
                    gameData.masterProgress = 100;
                }
            }
            document.getElementById('master-progress').style.width = `${gameData.masterProgress}%`;
            masterLevelDisplay.textContent = `${gameData.masterLevel}${gameData.masterStage}`;
            alert('使用筑基丹，修为大幅提升！');
            break;
            
        case '五行精华':
            // 增强五行相性
            gameData.elementBonus += 0.3;
            alert('使用五行精华，五行相性增强，相同五行修炼效果提升30%！');
            break;
            
        case '龙血草':
            // 随机提升一名弟子资质
            if (gameData.disciples.length > 0) {
                const randomIndex = Math.floor(Math.random() * gameData.disciples.length);
                const disciple = gameData.disciples[randomIndex];
                
                const qualityIndex = gameData.discipleQualities.indexOf(disciple.quality);
                if (qualityIndex < gameData.discipleQualities.length - 1) {
                    disciple.quality = gameData.discipleQualities[qualityIndex + 1];
                    alert(`使用龙血草，${disciple.name}的资质提升到${disciple.quality}！`);
                    renderDisciples();
                } else {
                    alert(`${disciple.name}已达最高资质，龙血草效果有限！`);
                }
            } else {
                alert('没有弟子可以使用龙血草！');
                // 返还天材地宝
                gameData.treasures[treasureName].count++;
            }
            break;
    }
    
    // 更新天材地宝显示
    updateTreasuresDisplay();
}

// 添加历练按钮事件监听
document.addEventListener('DOMContentLoaded', () => {
    const adventureBtn = document.getElementById('adventure-btn');
    if (adventureBtn) {
        adventureBtn.addEventListener('click', adventure);
    }
    
    // 添加天材地宝使用按钮事件委托
    const treasuresContainer = document.getElementById('treasures-container');
    if (treasuresContainer) {
        treasuresContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('use-treasure-btn')) {
                const treasureName = e.target.dataset.treasure;
                useTreasure(treasureName);
            }
        });
    }
    
    // 初始化天材地宝显示
    updateTreasuresDisplay();
});

// 宗主突破检查函数
function checkMasterBreakthrough() {
    // 先检查阶段提升
    const currentStageIndex = gameData.cultivationStages.indexOf(gameData.masterStage);
    if (currentStageIndex < gameData.cultivationStages.length - 1) {
        // 提升阶段
        gameData.masterStage = gameData.cultivationStages[currentStageIndex + 1];
        gameData.masterProgress = 0;
        alert(`恭喜！宗主突破到${gameData.masterLevel}${gameData.masterStage}！`);
    } else {
        // 阶段已满，提升境界
        const currentLevelIndex = gameData.cultivationLevels.indexOf(gameData.masterLevel);
        if (currentLevelIndex < gameData.cultivationLevels.length - 1) {
            gameData.masterLevel = gameData.cultivationLevels[currentLevelIndex + 1];
            gameData.masterStage = gameData.cultivationStages[0]; // 重置为初期
            gameData.masterProgress = 0;
            alert(`恭喜！宗主突破到${gameData.masterLevel}${gameData.masterStage}！`);
            
            // 宗主突破可能提升宗门等级
            if (gameData.sectLevel < 6) {
                gameData.sectLevel++;
                sectLevelDisplay.textContent = `宗门等级：${gameData.sectLevelNames[gameData.sectLevel - 1]}`;
                updateDiscipleLimit();
                alert(`宗门提升到${gameData.sectLevelNames[gameData.sectLevel - 1]}级别！`);
            }
        } else {
            gameData.masterProgress = 100;
        }
    }
}