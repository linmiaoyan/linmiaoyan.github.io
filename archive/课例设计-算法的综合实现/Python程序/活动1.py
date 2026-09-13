#自定义函数部分
def update_seats(m,n,s,seats):
    cnt=0
    tmp=""
    for ch in s:
        if "0"<=ch<="9":  #ch是数字字符
            tmp=tmp+ch
        else:  #ch是字母
            row=int(tmp)-1
            col=ord(ch)-ord("A")
            seats[row][col]=_________________  #0、1切换
            tmp=""
    for row in range(m):  #遍历行号
        for col in range(n):  #遍历列号
            if seats[row][col]==0:
                ____________
    return cnt,seats

#主程序部分
m=10  #为方便操作，将座位排数设为10
n=6  #列数
s="1A2B1A2F3C4E2F"  #预约与取消预约操作示例字符串，实际根据学生操作生成
seats=[[0 for i in range(n)] for j in range(m)]  #生成m行n列二维列表
cnt1,seats=update_seats(m,n,s,seats)
print("未预约座位总数：",cnt1,"个")