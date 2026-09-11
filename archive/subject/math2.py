#pip install plotly dash
import numpy as np
import plotly.graph_objects as go
from ipywidgets import interact, FloatSlider
import plotly.io as pio
import dash
from dash import dcc, html
from dash.dependencies import Input, Output
import webbrowser
from threading import Timer

# 设置默认渲染模式为浏览器
pio.renderers.default = "browser"

# 定义顶点坐标，形成一个正三棱锥
# 底面为正三角形ABC，顶点P在底面中心上方
# 设置底面边长为a，高度为h




# 定义顶点坐标，坐标更加分散
# P在左墙上，C在右墙上，A在左墙底部，B在右墙底部
# 修改顶点坐标，使两条靠墙的边PA和BC相互垂直
P = np.array([-3, 1, 3])  # 左墙上的顶点，更高
C = np.array([3, 3, 4])   # 右墙上的顶点，更高且更靠右
A = np.array([-3, -2, 3])  # 修改A点坐标，使PA沿着z轴方向（垂直向下）
B = np.array([3, 3, 2])    # 修改B点坐标，使BC沿着y轴方向（水平方向）



# 定义墙面之间的距离 l
l = 2

def create_figure(position=0.5):
    # 计算截面的位置（0到1之间）
    # 0表示左墙面，1表示右墙面
    
    # 定义一个函数来计算直线与平面的交点
    # 平面由点和法向量定义
    def line_plane_intersection(p1, p2, point_on_plane, normal):
        # 计算直线向量
        line_vec = p2 - p1
        
        # 计算平面到直线起点的向量
        plane_vec = point_on_plane - p1
        
        # 计算交点参数t
        t = np.dot(plane_vec, normal) / np.dot(line_vec, normal)
        
        # 如果t不在[0,1]范围内，则交点不在线段上
        if t < 0 or t > 1 or np.isclose(np.dot(line_vec, normal), 0):
            return None
        
        # 计算交点坐标
        intersection = p1 + t * line_vec
        return intersection
    
    # 定义截面平面
    # 截面平面与墙面平行，法向量为x轴方向
    normal = np.array([1, 0, 0])
    
    # 计算截面平面上的点
    # 在左墙和右墙之间插值
    plane_x = -3 + position * 6  # 从x=-3到x=3
    plane_point = np.array([plane_x, 0, 0])
    
    # 计算所有边与平面的交点
    intersections = []
    edges = [(P, C), (P, B), (A, C), (A, B)]  # 不包括PA和BC，因为它们在墙上
    
    for p1, p2 in edges:
        intersection = line_plane_intersection(p1, p2, plane_point, normal)
        if intersection is not None:
            intersections.append(intersection)
    
    # 如果截面位于左墙上，添加P和A点
    if np.isclose(position, 0):
        intersections.append(P)
        intersections.append(A)
    
    # 如果截面位于右墙上，添加C和B点
    if np.isclose(position, 1):
        intersections.append(C)
        intersections.append(B)
    
    # 创建3D图形
    fig = go.Figure()
    
    # 绘制四面体的边
    # PA和BC在墙上
    fig.add_trace(go.Scatter3d(
        x=[P[0], A[0]], y=[P[1], A[1]], z=[P[2], A[2]],
        mode='lines', line=dict(color='blue', width=3), name='边PA'
    ))
    fig.add_trace(go.Scatter3d(
        x=[B[0], C[0]], y=[B[1], C[1]], z=[B[2], C[2]],
        mode='lines', line=dict(color='blue', width=3), name='边BC'
    ))
    # PC, PB, AC, AB不在墙上
    fig.add_trace(go.Scatter3d(
        x=[P[0], C[0]], y=[P[1], C[1]], z=[P[2], C[2]],
        mode='lines', line=dict(color='blue', width=3), name='边PC'
    ))
    fig.add_trace(go.Scatter3d(
        x=[P[0], B[0]], y=[P[1], B[1]], z=[P[2], B[2]],
        mode='lines', line=dict(color='blue', width=3), name='边PB'
    ))
    fig.add_trace(go.Scatter3d(
        x=[A[0], C[0]], y=[A[1], C[1]], z=[A[2], C[2]],
        mode='lines', line=dict(color='blue', width=3), name='边AC'
    ))
    fig.add_trace(go.Scatter3d(
        x=[A[0], B[0]], y=[A[1], B[1]], z=[A[2], B[2]],
        mode='lines', line=dict(color='blue', width=3), name='边AB'
    ))
    
    # 绘制截面（绿色）
    if len(intersections) >= 3:
        # 绘制截面的边
        for i in range(len(intersections)):
            for j in range(i+1, len(intersections)):
                fig.add_trace(go.Scatter3d(
                    x=[intersections[i][0], intersections[j][0]],
                    y=[intersections[i][1], intersections[j][1]],
                    z=[intersections[i][2], intersections[j][2]],
                    mode='lines', line=dict(color='green', width=5), name='截面边'
                ))
        
        # 如果有足够的交点，绘制截面面
        if len(intersections) >= 3:
            x_vals = [p[0] for p in intersections]
            y_vals = [p[1] for p in intersections]
            z_vals = [p[2] for p in intersections]
            
            # 创建一个凸包来表示截面
            fig.add_trace(go.Mesh3d(
                x=x_vals, y=y_vals, z=z_vals,
                color='green', opacity=0.5,
                name='截面面'
            ))
    
    # 绘制左墙面（墙面β）
    y_vals = np.linspace(-3, 3, 10)
    z_vals = np.linspace(0, 5.5, 10)
    Y, Z = np.meshgrid(y_vals, z_vals)
    X = np.ones_like(Y) * (-3)  # x=-3 平面
    
    fig.add_trace(go.Surface(
        x=X, y=Y, z=Z,
        colorscale=[[0, 'pink'], [1, 'pink']],
        opacity=0.3,
        showscale=False,
        name='左墙面'
    ))
    
    # 绘制右墙面（墙面γ）
    X_right = np.ones_like(Y) * 3  # x=3 平面
    fig.add_trace(go.Surface(
        x=X_right, y=Y, z=Z,
        colorscale=[[0, 'pink'], [1, 'pink']],
        opacity=0.3,
        showscale=False,
        name='右墙面'
    ))
    
    # 绘制底面
    x_vals = np.linspace(-3.5, 3.5, 10)
    y_vals = np.linspace(-3.5, 3.5, 10)
    X, Y = np.meshgrid(x_vals, y_vals)
    Z = np.zeros_like(X)  # z=0 平面
    
    fig.add_trace(go.Surface(
        x=X, y=Y, z=Z,
        colorscale=[[0, 'lightblue'], [1, 'lightblue']],
        opacity=0.2,
        showscale=False,
        name='底面'
    ))
    
    # 高亮墙上的边
    fig.add_trace(go.Scatter3d(
        x=[P[0], A[0]], y=[P[1], A[1]], z=[P[2], A[2]],
        mode='lines', line=dict(color='red', width=5), name='墙上边PA'
    ))
    fig.add_trace(go.Scatter3d(
        x=[B[0], C[0]], y=[B[1], C[1]], z=[B[2], C[2]],
        mode='lines', line=dict(color='red', width=5), name='墙上边BC'
    ))
    
    # 绘制截面平面（半透明）
    # 创建一个足够大的平面来显示截面
    y_vals = np.linspace(-3.5, 3.5, 10)
    z_vals = np.linspace(0, 5.5, 10)
    Y, Z = np.meshgrid(y_vals, z_vals)
    X = np.ones_like(Y) * plane_x  # 平行于墙面的平面
    
    fig.add_trace(go.Surface(
        x=X, y=Y, z=Z,
        colorscale=[[0, 'yellow'], [1, 'yellow']],
        opacity=0.2,
        showscale=False,
        name='截面平面'
    ))
    
    # 设置布局
    fig.update_layout(
        title=f'截面位置: {position:.2f}（0=左墙，1=右墙）',
        scene=dict(
            xaxis_title='X轴',
            yaxis_title='Y轴',
            zaxis_title='Z轴',
            aspectmode='cube',
            xaxis=dict(range=[-3.5, 3.5]),
            yaxis=dict(range=[-3.5, 3.5]),
            zaxis=dict(range=[0, 5.5]),
            camera=dict(
                eye=dict(x=1.5, y=1.5, z=1.5),
                up=dict(x=0, y=0, z=1)
            )
        ),
        width=900,
        height=700,
        margin=dict(l=0, r=0, b=0, t=30)
    )
    
    return fig

# 创建Dash应用
app = dash.Dash(__name__)

app.layout = html.Div([
    html.H1("三维四面体截面可视化"),
    html.Div([
        html.Label("拖动滑块调整截面位置（0=左墙，1=右墙）："),
        dcc.Slider(
            id='position-slider',
            min=0,
            max=1,
            step=0.01,
            value=0.5,
            marks={i/10: str(i/10) for i in range(11)},
            updatemode='drag'
        ),
    ], style={'width': '80%', 'margin': '0 auto', 'padding': '20px'}),
    dcc.Graph(id='3d-graph', style={'height': '80vh'})
])

@app.callback(
    Output('3d-graph', 'figure'),
    [Input('position-slider', 'value')]
)
def update_graph(position):
    return create_figure(position)

# 自动打开浏览器
def open_browser():
    webbrowser.open_new("http://127.0.0.1:8050/")

# 运行应用
if __name__ == '__main__':
    Timer(1, open_browser).start()
    app.run_server(debug=False)

# 以下代码保留用于Jupyter Notebook环境
# 使用ipywidgets创建交互式滑块
if 'ipykernel' in sys.modules:
    slider = FloatSlider(
        value=0.5,
        min=0.0,
        max=1.0,
        step=0.01,
        description='截面位置:',
        continuous_update=False
    )
    
    # 显示初始图形
    initial_fig = create_figure(0.5)
    initial_fig.show()
    
    # 创建交互式控件
    interact(update_plot, position=slider)
