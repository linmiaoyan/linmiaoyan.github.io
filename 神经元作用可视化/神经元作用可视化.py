import numpy as np
import matplotlib.pyplot as plt
plt.rcParams['font.sans-serif'] = ['SimHei']  # 用来正常显示中文标签
plt.rcParams['axes.unicode_minus'] = False    # 用来正常显示负号

# Sigmoid激活函数（核心非线性变换）
def sigmoid(x, w, b):
    return 1/(1 + np.exp(-(w*x + b)))

# 构建单个阶跃函数
x = np.linspace(-5,5,100)
w, b = 1, 0  # 使用标准的权重和偏置值，通常在0到1之间
step = sigmoid(x, w, b) 

# 组合两个阶跃函数形成隆起函数
# 使用不同参数的sigmoid函数相减来创建隆起函数
# 第一个sigmoid函数上升沿，第二个sigmoid函数下降沿
w_bump = 2  # 控制隆起的陡峭程度
b1 = 2 # 控制隆起的左侧位置
b2 = -2 # 控制隆起的右侧位置
bump = sigmoid(x, w_bump, b1) - sigmoid(x, w_bump, b2)

# 目标函数
target = np.sin(x*2) + 0.3*x**2  # 示例目标函数
print("目标函数: f(x) = sin(2x) + 0.3x*x")

# 定义绘制子图的函数
def plot_activation_function(ax, x_data, y_data, title, xlabel="x值", ylabel="激活值"):
    ax.plot(x_data, y_data)
    ax.set_title(title)
    ax.set_xlabel(xlabel)
    ax.set_ylabel(ylabel)
    ax.grid(True, linestyle='--', alpha=0.7)

def plot_approximation(ax, x_data, outputs, target, n, xlabel="x值", ylabel="函数值"):
    ax.plot(x_data, outputs, 'b-', label="神经网络输出")
    ax.plot(x_data, target, 'r--', label="目标函数")
    ax.set_title(f"生成{n}个随机隆起函数逼近目标函数")
    ax.set_xlabel(xlabel)
    ax.set_ylabel(ylabel)
    ax.legend(loc="best")
    ax.grid(True, linestyle='--', alpha=0.7)

# 可视化展示
plt.figure(figsize=(12,4))
ax1 = plt.subplot(131)
plot_activation_function(ax1, x, step, "Sigmoid函数")

ax2 = plt.subplot(132)
plot_activation_function(ax2, x, bump, "隆起函数")

ax3 = plt.subplot(133)
plot_activation_function(ax3, x, target, "目标函数: sin(2x) + 0.3x*x", ylabel="函数值")

# 组合多个隆起函数逼近目标函数
hidden_units = [1, 2, 4, 20]  

plt.figure(figsize=(15,10))
for i, n in enumerate(hidden_units):
    # 随机初始化多个隆起函数
    W = np.random.randn(n)*80 + 40   # 权重初始化
    B = np.random.randn(n)*20 -50    # 偏置初始化
    outputs = sum(sigmoid(x, W[j], B[j]) for j in range(n))
    
    ax = plt.subplot(3, 2, i+1)
    plot_approximation(ax, x, outputs, target, n)

# 添加训练过程的演示
def train_network(n_neurons, learning_rate=0.01, epochs=1000):
    # 初始化权重和偏置
    W = np.random.randn(n_neurons)*10
    B = np.random.randn(n_neurons)*5
    
    losses = []
    
    # 训练过程
    for epoch in range(epochs):
        # 前向传播
        activations = np.array([sigmoid(x, W[j], B[j]) for j in range(n_neurons)])
        output = np.sum(activations, axis=0)
        
        # 计算损失
        loss = np.mean((output - target)**2)
        losses.append(loss)
        
        # 反向传播（简化版）
        for j in range(n_neurons):
            # 计算梯度
            dW = np.mean((output - target) * activations[j] * (1 - activations[j]) * x)
            dB = np.mean((output - target) * activations[j] * (1 - activations[j]))
            
            # 更新权重和偏置
            W[j] -= learning_rate * dW
            B[j] -= learning_rate * dB
        
        # 每100轮打印一次损失
        if epoch % 100 == 0:
            print(f"轮次 {epoch}, 损失: {loss:.4f}")
    
    # 返回训练后的权重、偏置和损失历史
    return W, B, losses

# 训练并可视化结果
n_neurons = 10  # 使用10个神经元
plt.figure(figsize=(15,10))

# 训练前的随机初始化结果
W_init = np.random.randn(n_neurons)*10
B_init = np.random.randn(n_neurons)*5
outputs_init = sum(sigmoid(x, W_init[j], B_init[j]) for j in range(n_neurons))

ax1 = plt.subplot(2, 2, 1)
plot_approximation(ax1, x, outputs_init, target, n_neurons, ylabel="函数值")
ax1.set_title(f"训练前: {n_neurons}个随机初始化的神经元")

# 训练网络
print("开始训练网络...")
W_trained, B_trained, losses = train_network(n_neurons, learning_rate=0.01, epochs=1000)

# 训练后的结果
outputs_trained = sum(sigmoid(x, W_trained[j], B_trained[j]) for j in range(n_neurons))

ax2 = plt.subplot(2, 2, 2)
plot_approximation(ax2, x, outputs_trained, target, n_neurons, ylabel="函数值")
ax2.set_title(f"训练后: {n_neurons}个优化后的神经元")

# 绘制损失曲线
ax3 = plt.subplot(2, 2, 3)
ax3.plot(losses)
ax3.set_title("训练过程中的损失变化")
ax3.set_xlabel("训练轮次")
ax3.set_ylabel("均方误差损失")
ax3.grid(True, linestyle='--', alpha=0.7)

# 比较不同数量神经元训练后的效果
ax4 = plt.subplot(2, 2, 4)
neuron_counts = [2, 5, 10]
for count in neuron_counts:
    W, B, _ = train_network(count, learning_rate=0.1, epochs=5000)
    outputs = sum(sigmoid(x, W[j], B[j]) for j in range(count))
    ax4.plot(x, outputs, label=f"{count}个神经元")
ax4.plot(x, target, 'r--', label="目标函数")
ax4.set_title("不同数量神经元训练后的拟合效果")
ax4.set_xlabel("x值")
ax4.set_ylabel("函数值")
ax4.legend(loc="best")
ax4.grid(True, linestyle='--', alpha=0.7)

plt.tight_layout()

