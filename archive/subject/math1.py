import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from matplotlib.widgets import Slider

# 定义三棱锥的顶点坐标
P = np.array([0, 0, 1])
A = np.array([-1, -1, 0])
B = np.array([1, -1, 0])
C = np.array([0, 1, 0])

# 定义墙面之间的距离 l
l = 2

# 创建3D图形
fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')

# 添加滑块的位置
plt.subplots_adjust(bottom=0.25)
ax_slider = plt.axes([0.25, 0.1, 0.65, 0.03])
slider = Slider(ax_slider, '截面位置', 0.0, 1.0, valinit=0.5)

def update(val):
    ax.clear()
    
    # 获取滑块的值
    x = slider.val
    
    # 计算截面的位置
    xl = x * l
    
    # 定义截面的顶点坐标
    A_prime = A + (P - A) * x
    B_prime = B + (P - B) * x
    C_prime = C + (P - C) * x
    
    # 绘制三棱锥的边
    ax.plot([P[0], A[0]], [P[1], A[1]], [P[2], A[2]], 'b')
    ax.plot([P[0], B[0]], [P[1], B[1]], [P[2], B[2]], 'b')
    ax.plot([P[0], C[0]], [P[1], C[1]], [P[2], C[2]], 'b')
    ax.plot([A[0], B[0]], [A[1], B[1]], [A[2], B[2]], 'b')
    ax.plot([B[0], C[0]], [B[1], C[1]], [B[2], C[2]], 'b')
    ax.plot([C[0], A[0]], [C[1], A[1]], [C[2], A[2]], 'b')
    
    # 绘制截面（绿色）
    ax.plot([A_prime[0], B_prime[0]], [A_prime[1], B_prime[1]], [A_prime[2], B_prime[2]], 'g', linewidth=2)
    ax.plot([B_prime[0], C_prime[0]], [B_prime[1], C_prime[1]], [B_prime[2], C_prime[2]], 'g', linewidth=2)
    ax.plot([C_prime[0], A_prime[0]], [C_prime[1], A_prime[1]], [C_prime[2], A_prime[2]], 'g', linewidth=2)
    
    # 填充截面
    ax.plot_trisurf([A_prime[0], B_prime[0], C_prime[0]], 
                    [A_prime[1], B_prime[1], C_prime[1]], 
                    [A_prime[2], B_prime[2], C_prime[2]], 
                    color='g', alpha=0.3)
    
    # 绘制底面墙（整个底面平面）
    # 创建一个更大的底面平面
    x_min, x_max = -2, 2
    y_min, y_max = -2, 2
    xx, yy = np.meshgrid(np.linspace(x_min, x_max, 10), np.linspace(y_min, y_max, 10))
    zz = np.zeros_like(xx)  # z=0 平面
    ax.plot_surface(xx, yy, zz, color='r', alpha=0.2)
    
    # 绘制顶点P处的墙面（整个顶部平面）
    # 创建顶部平面 (z=1)
    zz_top = np.ones_like(xx)  # z=1 平面
    ax.plot_surface(xx, yy, zz_top, color='r', alpha=0.2)
    
    # 绘制底面边缘
    ax.plot([A[0], B[0]], [A[1], B[1]], [A[2], B[2]], 'r', linewidth=2)
    ax.plot([B[0], C[0]], [B[1], C[1]], [B[2], C[2]], 'r', linewidth=2)
    ax.plot([C[0], A[0]], [C[1], A[1]], [C[2], A[2]], 'r', linewidth=2)
    
    # 设置坐标轴标签和视角
    ax.set_xlabel('X轴')
    ax.set_ylabel('Y轴')
    ax.set_zlabel('Z轴')
    ax.set_title(f'三棱锥截面位置: {x:.2f}')
    ax.view_init(elev=20, azim=-35)
    ax.set_box_aspect([1, 1, 1])
    
    fig.canvas.draw_idle()

# 初始化图形
update(0.5)

# 注册滑块更新函数
slider.on_changed(update)

# 显示图形
plt.show()
