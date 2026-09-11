// 定义符号 - 只保留水果符号、7、钻石和钱袋子
const symbols = [
  '🍒', '🍋', '🍊', '🍇', '🍉', '🍓', '🍍', 
  '💎', '7️⃣', '💰'
];

// 定义符号价值（三个相同时的倍数）
const symbolValues = {
  '🍒': 15,   // 普通水果
  '🍋': 15,
  '🍊': 15,
  '🍇': 15,   // 高级水果
  '🍉': 15,
  '🍓': 15,
  '🍍': 15,
  '💎': 25,  // 高价值符号
  '7️⃣': 35,
  '💰': 50
};

// 游戏状态
let gameState = {
  credits: 1000,  // 初始积分
  betAmount: 50,  // 默认下注金额
  rounds: 0       // 游戏轮次
};

const reels = document.querySelectorAll('.reel .images');
const resultDisplay = document.getElementById('result');
const lever = document.getElementById('lever');
const creditsDisplay = document.getElementById('credits');
const creditsChangeDisplay = document.getElementById('creditsChange');
const roundsDisplay = document.getElementById('rounds');
const betAmountDisplay = document.getElementById('betAmount');
const decreaseBetButton = document.getElementById('decreaseBet');
const increaseBetButton = document.getElementById('increaseBet');
const resetButton = document.getElementById('resetButton');
const lightsContainer = document.getElementById('lightsContainer'); // 新增：灯泡容器

let isSpinning = false;

// 初始化老虎机
function initSlot() {
  reels.forEach(reel => {
    // 清空现有内容
    reel.innerHTML = '';
    
    // 为每个轮盘创建符号
    for (let i = 0; i < symbols.length; i++) {
      const li = document.createElement('li');
      li.textContent = symbols[i];
      reel.appendChild(li);
    }
    
    // 复制前三个符号到末尾，使滚动看起来更连贯
    for (let i = 0; i < 3; i++) {
      const li = document.createElement('li');
      li.textContent = symbols[i];
      reel.appendChild(li);
    }
    
    // 设置初始位置
    reel.style.top = '0px';
  });
  
  // 添加拉杆事件监听
  lever.addEventListener('click', pullLever);
  
  // 添加下注控制事件
  decreaseBetButton.addEventListener('click', decreaseBet);
  increaseBetButton.addEventListener('click', increaseBet);
  
  // 添加重置按钮事件
  resetButton.addEventListener('click', resetGame);
  
  // 创建灯泡
  createLights();
  
  // 更新显示
  updateDisplay();
}

// 创建灯泡
function createLights() {
  // 清空现有灯泡
  if (lightsContainer) {
    lightsContainer.innerHTML = '';
    
    // 创建10个灯泡
    for (let i = 0; i < 10; i++) {
      const light = document.createElement('div');
      light.className = 'light';
      lightsContainer.appendChild(light);
    }
  }
}

// 控制灯泡效果
function controlLights(mode) {
  if (!lightsContainer) return;
  
  const lights = lightsContainer.querySelectorAll('.light');
  
  // 先清除所有灯泡的类
  lights.forEach(light => {
    light.className = 'light';
  });
  
  switch(mode) {
    case 'spin':
      // 旋转模式 - 灯泡依次闪烁
      let spinIndex = 0;
      const spinInterval = setInterval(() => {
        // 清除所有灯泡的激活状态
        lights.forEach(light => light.classList.remove('active'));
        // 激活当前灯泡
        lights[spinIndex].classList.add('active');
        spinIndex = (spinIndex + 1) % lights.length;
        
        // 如果不再旋转，停止灯光效果
        if (!isSpinning) {
          clearInterval(spinInterval);
        }
      }, 200);
      break;
      
    case 'win':
      // 大奖模式 - 所有灯泡闪烁
      let winState = true;
      const winInterval = setInterval(() => {
        lights.forEach(light => {
          light.classList.toggle('win');
        });
        winState = !winState;
      }, 300);
      
      // 5秒后停止闪烁
      setTimeout(() => {
        clearInterval(winInterval);
        lights.forEach(light => {
          light.className = 'light';
        });
      }, 5000);
      break;
      
    case 'smallWin':
      // 小奖模式 - 交替闪烁
      let smallWinState = true;
      const smallWinInterval = setInterval(() => {
        lights.forEach((light, index) => {
          if (smallWinState) {
            light.classList.toggle('active', index % 2 === 0);
          } else {
            light.classList.toggle('active', index % 2 === 1);
          }
        });
        smallWinState = !smallWinState;
      }, 400);
      
      // 3秒后停止闪烁
      setTimeout(() => {
        clearInterval(smallWinInterval);
        lights.forEach(light => {
          light.className = 'light';
        });
      }, 3000);
      break;
      
    case 'lose':
      // 失败模式 - 红色闪烁
      lights.forEach(light => {
        light.classList.add('lose');
      });
      
      // 2秒后停止
      setTimeout(() => {
        lights.forEach(light => {
          light.className = 'light';
        });
      }, 2000);
      break;
      
    case 'reset':
      // 重置模式 - 灯光从两边向中间移动
      const totalLights = lights.length;
      const halfLength = Math.floor(totalLights / 2);
      
      for (let i = 0; i < halfLength; i++) {
        setTimeout(() => {
          if (i > 0) {
            lights[halfLength - i].classList.remove('reset');
            lights[halfLength + i - 1].classList.remove('reset');
          }
          lights[halfLength - i - 1].classList.add('reset');
          lights[halfLength + i].classList.add('reset');
          
          // 最后一组灯亮起后，全部熄灭
          if (i === halfLength - 1) {
            setTimeout(() => {
              lights.forEach(light => {
                light.className = 'light';
              });
            }, 500);
          }
        }, i * 200);
      }
      break;
      
    default:
      // 默认状态 - 全部熄灭
      lights.forEach(light => {
        light.className = 'light';
      });
  }
}

// 更新显示
function updateDisplay() {
  creditsDisplay.textContent = gameState.credits;
  roundsDisplay.textContent = gameState.rounds;
  betAmountDisplay.textContent = gameState.betAmount;
  
  // 禁用/启用按钮
  if (gameState.credits < gameState.betAmount) {
    lever.classList.add('disabled');
  } else {
    lever.classList.remove('disabled');
  }
  
  if (gameState.betAmount <= 10) {
    decreaseBetButton.disabled = true;
  } else {
    decreaseBetButton.disabled = false;
  }
  
  if (gameState.betAmount >= 500 || gameState.betAmount > gameState.credits) {
    increaseBetButton.disabled = true;
  } else {
    increaseBetButton.disabled = false;
  }
}

// 增加/减少积分并显示动画
function updateCredits(amount) {
  gameState.credits += amount;
  
  // 显示积分变化动画
  creditsChangeDisplay.textContent = amount > 0 ? `+${amount}` : amount;
  creditsChangeDisplay.className = 'points-animation';
  creditsChangeDisplay.classList.add(amount >= 0 ? 'positive' : 'negative');
  creditsChangeDisplay.classList.add('show');
  
  // 重置动画
  setTimeout(() => {
    creditsChangeDisplay.classList.remove('show');
  }, 1500);
  
  // 更新显示
  updateDisplay();
}

// 减少下注
function decreaseBet() {
  if (gameState.betAmount > 10) {
    gameState.betAmount -= 10;
    updateDisplay();
  }
}

// 增加下注
function increaseBet() {
  if (gameState.betAmount < 500 && gameState.betAmount < gameState.credits) {
    gameState.betAmount += 10;
    updateDisplay();
  }
}

// 重置游戏
function resetGame() {
  gameState = {
    credits: 1000,
    betAmount: 50,
    rounds: 0
  };
  
  updateDisplay();
  resultDisplay.textContent = '';
  resultDisplay.classList.remove('win-animation');
  
  playSound('reset');
  controlLights('reset'); // 触发重置灯光效果
}

// 拉杆动作
function pullLever() {
  if (isSpinning || gameState.credits < gameState.betAmount || lever.classList.contains('disabled')) return;
  
  // 扣除下注金额
  updateCredits(-gameState.betAmount);
  
  // 增加轮次
  gameState.rounds++;
  roundsDisplay.textContent = gameState.rounds;
  
  // 拉杆动画
  lever.classList.add('pulled');
  
  // 播放拉杆音效
  playSound('lever');
  
  // 开始旋转
  setTimeout(() => {
    startSlot();
    
    // 恢复拉杆位置
    setTimeout(() => {
      lever.classList.remove('pulled');
    }, 1000);
  }, 300);
}

// 开始旋转
function startSlot() {
  if (isSpinning) return;
  
  isSpinning = true;
  resultDisplay.textContent = '';
  resultDisplay.classList.remove('win-animation');
  
  // 启动灯光效果
  controlLights('spin');
  
  // 播放旋转音效
  playSound('spin');
  
  // 为每个轮盘设置不同的旋转时间 - 增加转速
  const spinTimes = [
    Math.floor(Math.random() * 1000) + 2000,
    Math.floor(Math.random() * 1000) + 2500,
    Math.floor(Math.random() * 1000) + 3000
  ];
  
  const results = [];
  
  // 旋转每个轮盘
  reels.forEach((reel, index) => {
    // 随机选择一个结果
    const symbolIndex = Math.floor(Math.random() * symbols.length);
    results.push(symbolIndex);
    
    // 计算最终位置
    const finalPosition = -(symbolIndex * 150);
    
    // 设置动画
    setTimeout(() => {
      reel.style.transition = `top ${spinTimes[index] / 1000}s cubic-bezier(0.1, 0.7, 0.2, 1)`;
      reel.style.top = `${finalPosition}px`;
      
      // 播放停止音效
      playSound('stop');
      
      // 最后一个轮盘停止后检查结果
      if (index === reels.length - 1) {
        setTimeout(() => {
          checkResult(results);
          isSpinning = false;
          updateDisplay();
        }, spinTimes[index]);
      }
    }, 400 * index);
  });
}

// 检查结果
function checkResult(results) {
  // 显示结果符号
  const resultSymbols = results.map(index => symbols[index]).join(' ');
  
  // 检查是否获胜
  if (results[0] === results[1] && results[1] === results[2]) {
    // 三个相同 - 大奖
    const symbol = symbols[results[0]];
    const baseMultiplier = symbolValues[symbol];
    
    // 根据下注金额增加倍数，下注越高倍数越高
    let bonusMultiplier = 1.0;
    if (gameState.betAmount >= 100) bonusMultiplier = 1.2;
    if (gameState.betAmount >= 200) bonusMultiplier = 1.5;
    if (gameState.betAmount >= 300) bonusMultiplier = 1.8;
    if (gameState.betAmount >= 400) bonusMultiplier = 2.0;
    
    const finalMultiplier = Math.floor(baseMultiplier * bonusMultiplier);
    const winAmount = gameState.betAmount * 2 * finalMultiplier;
    
    resultDisplay.textContent = `恭喜！三个${symbol}！赢得 ${winAmount} 积分！`;
    if (bonusMultiplier > 1) {
      resultDisplay.textContent += ` (高额下注奖励：${Math.round((bonusMultiplier-1)*100)}% 额外倍数)`;
    }
    resultDisplay.classList.add('win-animation');
    updateCredits(winAmount);
    playSound('win');
    controlLights('win'); // 触发大奖灯光效果
  } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
    // 两个相同 - 小奖
    // 确定哪个符号是成对的
    let matchedSymbol;
    if (results[0] === results[1]) {
      matchedSymbol = symbols[results[0]];
    } else if (results[1] === results[2]) {
      matchedSymbol = symbols[results[1]];
    } else {
      matchedSymbol = symbols[results[0]];
    }
    
    // 根据符号价值和下注金额计算奖励
    const baseMultiplier = symbolValues[matchedSymbol] / 5; // 两个相同时的基础倍数是三个相同时的1/5
    
    // 根据下注金额增加倍数
    let bonusMultiplier = 1.0;
    if (gameState.betAmount >= 100) bonusMultiplier = 1.2;
    if (gameState.betAmount >= 200) bonusMultiplier = 1.5;
    if (gameState.betAmount >= 300) bonusMultiplier = 1.8;
    if (gameState.betAmount >= 400) bonusMultiplier = 2.0;
    
    const finalMultiplier = baseMultiplier * bonusMultiplier;
    const winAmount = Math.floor(gameState.betAmount * finalMultiplier);
    
    let bonusText = "";
    if (bonusMultiplier > 1) {
      bonusText = ` (高额下注奖励：${Math.round((bonusMultiplier-1)*100)}% 额外倍数)`;
    }
    
    resultDisplay.textContent = `不错！有两个相同的符号：${resultSymbols}，赢得 ${winAmount} 积分${bonusText}`;
    updateCredits(winAmount);
    playSound('smallWin');
    controlLights('smallWin'); // 触发小奖灯光效果
  } else {
    // 没有匹配
    resultDisplay.textContent = `再试一次！${resultSymbols}`;
    playSound('lose');
    controlLights('lose'); // 触发失败灯光效果
    
    // 检查是否没有积分了
    if (gameState.credits < gameState.betAmount) {
      setTimeout(() => {
        if (gameState.credits === 0) {
          resultDisplay.textContent = "游戏结束！积分用完了。点击'重置游戏'重新开始。";
        } else {
          resultDisplay.textContent = `积分不足！请减少下注金额或重置游戏。`;
        }
      }, 2000);
    }
  }
}

// 音效函数 - 使用Web Audio API生成声音
function playSound(type) {
  // 创建音频上下文
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // 根据不同类型生成不同的声音
  switch(type) {
    case 'lever':
      // 拉杆声音 - 短促的咔哒声
      playClickSound(audioContext, 0.3);
      break;
      
    case 'spin':
      // 旋转声音 - 持续的嗡嗡声
      playSpinSound(audioContext, 1.5);
      break;
      
    case 'stop':
      // 停止声音 - 短促的咔声
      playClickSound(audioContext, 0.1, 800);
      break;
      
    case 'win':
      // 大奖声音 - 欢快的音阶上升
      playWinSound(audioContext, 1.0);
      break;
      
    case 'smallWin':
      // 小奖声音 - 简短的胜利音效
      playSmallWinSound(audioContext, 0.5);
      break;
      
    case 'lose':
      // 失败声音 - 低沉的音调
      playLoseSound(audioContext, 0.5);
      break;
      
    case 'reset':
      // 重置声音 - 清脆的铃声
      playResetSound(audioContext, 0.5);
      break;
      
    default:
      console.log(`未知音效类型: ${type}`);
  }
}

// 咔哒声（用于拉杆和停止）
function playClickSound(audioContext, duration, frequency = 500) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'square';
  oscillator.frequency.value = frequency;
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

// 旋转声音
function playSpinSound(audioContext, duration) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'sawtooth';
  oscillator.frequency.value = 150;
  
  // 频率变化，模拟旋转声
  oscillator.frequency.linearRampToValueAtTime(50, audioContext.currentTime + duration);
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

// 大奖声音
function playWinSound(audioContext, duration) {
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  
  notes.forEach((note, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = note;
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1 + index * 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3 + index * 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime + index * 0.1);
    oscillator.stop(audioContext.currentTime + 0.4 + index * 0.1);
  });
  
  // 添加一些闪烁音效
  setTimeout(() => {
    playSparkleSound(audioContext, 1.0);
  }, 500);
}

// 闪烁音效（用于大奖）
function playSparkleSound(audioContext, duration) {
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 1000 + Math.random() * 500;
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    }, i * 100);
  }
}

// 小奖声音
function playSmallWinSound(audioContext, duration) {
  const notes = [523.25, 659.25]; // C5, E5
  
  notes.forEach((note, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = note;
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1 + index * 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3 + index * 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime + index * 0.1);
    oscillator.stop(audioContext.currentTime + 0.4 + index * 0.1);
  });
}

// 失败声音
function playLoseSound(audioContext, duration) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'triangle';
  oscillator.frequency.value = 300;
  oscillator.frequency.linearRampToValueAtTime(200, audioContext.currentTime + duration);
  
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

// 重置声音
function playResetSound(audioContext, duration) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.value = 880; // A5
  
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

// 初始化
window.onload = initSlot; 