from flask import Flask, render_template, request, jsonify
import time
import random
import os

app = Flask(__name__)

# 存储游戏数据
game_state = {
    'is_started': False,
    'start_time': None,
    'last_action': None,  # 添加这个字段
    'player1': {
        'heart_rate': 0, 
        'health': 100,
        'character': 1,  # 角色编号
        'pat_count': 0,  # 摸头次数
        'last_pat_time': 0  # 上次摸头时间
    },
    'player2': {
        'heart_rate': 0, 
        'health': 100,
        'character': 1,
        'pat_count': 0,
        'last_pat_time': 0
    }
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/player_action', methods=['GET'])
def player_action():
    player = request.args.get('player')
    
    if player not in game_state:
        return jsonify({'status': 'failed', 'message': 'Invalid player'})
        
    if not game_state['is_started']:
        # 游戏未开始：切换角色
        new_character = random.randint(1, 34)
        game_state[player]['character'] = new_character
        # 设置last_action以便前端轮询能捕获到
        game_state['last_action'] = {
            'status': 'success',
            'action': 'switch',
            'player': player,
            'character': new_character
        }
        return jsonify(game_state['last_action'])
    else:
        # 游戏已开始：摸头动作
        current_time = time.time()
        last_pat = game_state[player]['last_pat_time']
        pat_count = game_state[player]['pat_count']
        
        if current_time - last_pat < 1:
            game_state[player]['pat_count'] += 1
            animation = 'pat2' if pat_count >= 2 else 'pat1'
        else:
            game_state[player]['pat_count'] = 1
            animation = 'pat1'
            
        game_state[player]['last_pat_time'] = current_time
        
        game_state['last_action'] = {
            'status': 'success',
            'action': 'pat',
            'player': player,
            'animation': animation
        }
        return jsonify(game_state['last_action'])

@app.route('/start_game', methods=['GET'])
def start_game():
    game_state['is_started'] = True
    game_state['start_time'] = time.time()
    return jsonify({'status': 'success'})

@app.route('/update_heart_rate', methods=['GET'])
def update_heart_rate():
    player = request.args.get('player')
    heart_rate = int(request.args.get('heart_rate', 0))
    
    if player in game_state:
        # 更新心率
        game_state[player]['heart_rate'] = heart_rate
        
        # 游戏开始后的血量计算
        if game_state['is_started']:
            current_time = time.time()
            if game_state['start_time'] and current_time - game_state['start_time'] > 30:
                return jsonify({'status': 'game_over'})
            
            if heart_rate > 65:
                damage = (heart_rate - 60) // 10
                game_state[player]['health'] = max(0, game_state[player]['health'] - damage)
        
        return jsonify({'status': 'success'})
    
    return jsonify({'status': 'failed', 'message': 'Invalid player'})

@app.route('/reset_game', methods=['GET'])
def reset_game():
    # 修改重置逻辑，确保只重置玩家数据
    for player in ['player1', 'player2']:  # 明确指定玩家
        game_state[player]['health'] = 100
        game_state[player]['heart_rate'] = 0
        game_state[player]['pat_count'] = 0
        game_state[player]['last_pat_time'] = 0
        game_state[player]['character'] = 1  # 重置角色

    # 重置游戏状态
    game_state['is_started'] = False
    game_state['start_time'] = None
    game_state['last_action'] = None  # 确保也重置最后的动作

    return jsonify({'status': 'success'})

@app.route('/check_static')
def check_static():
    static_path = os.path.join(app.root_path, 'static')
    files = os.listdir(static_path) if os.path.exists(static_path) else []
    return jsonify({
        'static_path': static_path,
        'files': files,
        'exists': os.path.exists(static_path)
    })

@app.route('/get_game_state')
def get_game_state():
    """获取游戏状态，包括心率数据"""
    response_data = {
        'player1': {
            'character': game_state['player1']['character'],
            'heart_rate': game_state['player1']['heart_rate'],
            'health': game_state['player1']['health']
        },
        'player2': {
            'character': game_state['player2']['character'],
            'heart_rate': game_state['player2']['heart_rate'],
            'health': game_state['player2']['health']
        }
    }
    
    # 如果有最近的动作，添加到响应中
    if game_state['last_action']:
        response_data.update(game_state['last_action'])
        game_state['last_action'] = None
        
    return jsonify(response_data)

# 添加调试路由
@app.route('/debug_game_state')
def debug_game_state():
    """用于调试的路由，返回当前游戏状态"""
    return jsonify({
        'game_state': game_state,
        'server_time': time.time()
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
