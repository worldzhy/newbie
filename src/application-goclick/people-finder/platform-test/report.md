# mixrank:
#疑问
directdials 这个字段拿到的是什么电话
"+12064193926"
"+14157287631"
# ixrank:
总数据量1500
-- 没有领英大于5ca：46
-- 没有领英小于2ca： 2
-- 有领英小于2ca：12 
-- 有领英大于5ca：242 
-- 有领英大于5的US: 448
-- 没有领英大于5US：250 
-- 没有领英小于2US：250 
-- 有领英小于2US：250
## 结果
### 无领英，通过domain+name查询 552
查到email：22[4%]
查到电话：9[2%]
### 有领英，通过领英地址查询 948
查到email：611[64%]
查到电话：334[35%]


# voila-norbert:
总数据量1416[domain+name]
## 结果
查到email：620[43%]

# proxycurl:
总数据量1500
## 结果
查到email：410[27%]
查到phone：156[10%]


# snov
## 方案
https://app.snov.io 通过domain+name或者领英地址搜索，返回结果只有email，没有个人phone。
流程上，需要先获取accesstoken（有过期时间），用token去请求查询接口，2种查询方式都需要调用2个不同的接口，先执行搜索，再去查结果（流程上比较麻烦）
## 问题
/v2/emails-by-domain-by-name/start这个接口，咱们的body参数，如下
        {
            rows: [
              {
                 "first_name": "Taylor",
                  "last_name": "Marsman",
                  "domain": "redarrowfarm.com"
              }
            ],
            webhook_url: 'http://52.82.70.169:3000/people-finder/snov-hook?id=231502&taskId=335600',
          }
webhook_url: 'http://52.82.70.169:3000/people-finder/snov-hook?id=231502&taskId=335600',这个是我们的post接口（验证可用），实际我理解的应该是它会在获取到结果后回调我们的接口，把结果给我们，类似voilanorbert。但实际上，它并没有回调我们，这点我已经日志确认过。
然后我在这里https://snovio.cn/api#webhooks-description，找到一个接口，查出来了webhooks列表
而后我看到这个限制，有可能是因为之前我webhook地址传的localhost，我本地测试的数据，导致触发了这个重试机制，但我不确定目前我们是不是被锁定了，或者在倒计时重试，我也不确定它这个限制是不是基于队列。我用接口把localhost:3000相关的webhook删掉了。也重新执行了查询请求，但我发现还是没有收到任何请求。也许这个我删除的webhook并没有重置它的重试定时。我现在也不知道如果有这个重试定时，它状态如何 还剩多少时间。。服务器日志我打开的，也许晚点我再看看有没有触发回调。
另外想说它这个文档细节还有使用流程都挺麻烦的，比如用id和secret都获取到了token了结果服务代码里用不了，后面才发现还返回了setcookie，所以它这个接口设计甚至觉得很像是给前端用的

### 无领英，通过domain+name查询 552
查到email：84[15%]
### 有领英，通过领英地址查询 948
查到email：273[28%]

# hunter
## 方案
hunter.io 通过domain+name搜索，返回结果的属性存在email、phone，流程上apiKey+接口直接调用就返回结果，直接方便
## 问题
https://api.hunter.io/v2/email-finder 
这是一个get接口，当我用服务端去请求的时候，返回的body是一个html页面。而我用postman请求也是，最后我用浏览器请求，就出现了人机验证，通过之后才显示了内容，这里有点坑 对服务端不友好。他还提供了一个sdk，https://www.npmjs.com/package/hunterio，看是9年前的了，而且我用这个sdk请求，依然会报错，返回html内容

### 通过domain+name查询 1500条
查到email：659=[43%]
查到电话：2[0.1%]