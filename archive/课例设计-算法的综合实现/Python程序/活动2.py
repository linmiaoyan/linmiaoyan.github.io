#活动1自定义函数
def update_seats(m,n,s,seats):
    cnt=0
    tmp=""
    for ch in s:
        if "0"<=ch<="9":  #ch是数字字符
            tmp=tmp+ch
        else:  #ch是字母
            row=int(tmp)-1
            col=ord(ch)-ord("A")
            seats[row][col]=1-seats[row][col]  #0、1切换
            tmp=""
    for row in range(m):  #遍历行号
        for col in range(n):  #遍历列号
            if seats[row][col]==0:
                cnt=cnt+1
    return cnt,seats

#活动2自定义函数
def f_lianzuo(m,n,seats):
    cnt=0
    lst=[]
    for row in range(m):  #遍历行号
        for col in range(__________):  #遍历列号（偶数）
            if seats[row][col]==0 and ____________________:
                cnt=cnt+1
                lst.append(str(row+1)+chr(col+ord("A")))
                lst.append(str(row+1)+chr(col+1+ord("A")))
    return cnt,lst

#主程序部分
m=10  #为方便操作，将座位排数设为10
n=6  #列数
s="1A2B1A2F3C4E2F"  #预约与取消预约操作示例字符串，实际根据学生操作生成
seats=[[0 for i in range(n)] for j in range(m)]  #生成m行n列二维列表
cnt1,seats=update_seats(m,n,s,seats)
cnt2,lianzuo=f_lianzuo(m,n,seats)  #未预约连座对数和推荐列表
print("未预约座位总数：",cnt1,"个")
print("未预约连座对数：",cnt2,"对")
print("未预约连座推荐：",lianzuo)