# SHIFT / 改口 — HTML 网页版 0.6

由 C++ 0.5 版迁移的完整本地 HTML/CSS/JavaScript 游戏。保留三个原创案件、同机交接、逐幕人物演出、两处混合改稿、分类取证、自拟问题、三轮同步回答、一次指认与配对身份轮换。

## 下载与 itch.io 上传

可直接上传的游戏包：[SHIFT-Alibi-itchio-HTML-v0.6.zip](releases/SHIFT-Alibi-itchio-HTML-v0.6.zip)。ZIP 根目录包含 index.html，上传 itch.io 后勾选在浏览器中运行。

源码位置：[web/](web/)，游玩指导：[docs/游玩指导.txt](docs/游玩指导.txt)。

## 运行

下载并解压本仓库后，双击根目录的 `Play.cmd`。已安装 Python 3 时，启动只监听 127.0.0.1 的本地服务，并打开默认浏览器；没有 Python 则直接打开 web/index.html，离线游戏完整可玩。

也可直接双击 web/index.html，无需编译、安装 Node 或下载页面依赖。保留整个 web 文件夹和 assets。推荐 Chrome 或 Edge。已验证 Chrome 桌面及模拟手机视口，真实手机设备未实测。

手动启动：`python scripts/server.py --open`。自动选择空闲端口，无需管理员权限，不监听局域网。关闭页面后约 30 分钟无活动自动结束；可见页面会保持连接。

## DeepSeek

设置中填写 Key、启用在线表达并测试连接。模型 deepseek-flash，每轮最多两次请求。罪犯锁定回答后，两名 NPC 参考其实际语气、句长和紧张感生成表达，固定事实独立提供。取消、失败或迟到使用本地回答。

Key 只存在本页和请求的临时内存，不写入 localStorage、sessionStorage、文件、URL 或日志，刷新后清空。网页版不提供原生版的 DPAPI 记住 Key。只持久化非敏感的减少动态偏好。

直接打开 HTML 时，浏览器可能限制 DeepSeek 跨域访问；用一键启动的 Python 服务转发可避开该限制。服务固定访问官方 HTTPS 主机，检查 Host、Origin、请求头、Key 格式和长度，禁用重定向，不接受自定义上游。不要在提问中填入敏感信息。

无真实账户 Key，未实测真实鉴权、计费或远端生成。验证使用模拟传输和回复，请在设置里真实测试连接。情绪文本过滤不能证明任意自然语言语义正确，不能代替调查证据。

## 源码

- web/index.html、styles.css、app.js：界面、响应布局、人物 CSS 动画及交互。
- web/core.js、cases.js：从原 C++ 迁移的规则、确定性案件生成与故事文本。
- web/ai.js：异步请求、超时、取消和风格参考。
- scripts/server.py：Python 标准库本地服务和固定主机 AI 转发。
- scripts/launch.ps1：Windows 启动辅助。
- tests/：规则、接口、代理及真实浏览器流程。

生产页面无 npm、CDN 或 C++ 运行依赖。网页规则使用 JavaScript，不是嵌入原生 exe。

## 开发验证

```powershell
node --test tests/core.test.cjs tests/ai.test.cjs
python tests/server_test.py
python scripts/server.py --smoke
```

浏览器测试仅开发时需要 Playwright：`npm install --prefix tools playwright`。在另一个终端运行 `python scripts/server.py --port 8765`，再执行 `node tests/browser-flow.cjs`。脚本目前使用 Windows Chrome 路径，可按环境调整。tools/node_modules 不属于运行依赖。

## 边界与授权

当前为同机双人，未实现互联网/局域网联机。隐私依靠另一名玩家回避，开发者工具可访问本地代码与数据，请约定不查看。切到后台自动暂停，返回后手动继续。刷新不保存对局。罪犯使用内容和语气选项，侦探支持自由输入。没有发布公网或替用户提交 itch.io。

代码 MIT；摄影与字体独立授权，详见 THIRD_PARTY_NOTICES.md、web/assets/PHOTO_CREDITS.md。项目含 AI 编程辅助，参考资料见 docs/CREATIVE_REFERENCES.md。
