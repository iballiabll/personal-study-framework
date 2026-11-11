# 个人学习站框架

我做这个站是为了自己复习英语，把背词、读题、听写跟读和作文练习放在一个地方。这个仓库记录网站框架、可运行的功能和部署方法。打开页面后，可以从本机选取自己有权使用的资料。

[打开在线学习站](https://iballiabll.github.io/personal-study-framework/)

## 运行

需要 Node.js 20 或更新版本。运行 `npm run build`，然后用静态文件服务打开 `dist/`。例如运行 `python -m http.server 4190 --bind 127.0.0.1 --directory dist`，再打开 `http://127.0.0.1:4190/`。

## 功能与实现

| 模块 | 实现方式 |
| --- | --- |
| 资料读取 | File API 读取所选 JSON，检查字段、长度和答案索引，用 DOM 文本节点渲染。页面加载时资料列表为空。 |
| 词汇复习 | 按词库与词条记录掌握程度、复习时间和历史。 |
| 阅读与练习 | 读取本地题干、选项和答案索引，即时判题，作答状态记在浏览器。 |
| 听力与跟读 | 通过 Blob URL 播放本地音频，使用词级编辑距离对齐参考文本与练习文本。 |
| 写作 | 规则引擎在浏览器中给出练习估分，草稿保存在浏览器。 |

资料格式见 [JSON Schema](schema/study-pack.schema.json)。最小空白资料为 `{"version":1,"vocabulary":[],"questions":[]}`。题目 ID 需唯一，答案索引从 0 开始。页面在内存读取所选资料，重新打开页面需重新选择。复习状态、作答记录和草稿保存在当前浏览器和域名的本地存储中。构建脚本只复制列出的框架文件。

## 部署

在线版由 GitHub Pages 托管，发布源是 `gh-pages` 分支。更新时运行 `npm run build`，将 `dist/` 中的框架文件发布到该分支根目录，并保留 `.nojekyll`。仓库也提供 Vercel 配置。

1. 在 Vercel 导入仓库。仓库已配置 `npm run build` 和输出目录 `dist`，无需数据库或 API 密钥。
2. 如仅供本人访问，在 Vercel 启用 Vercel Authentication，保护范围设为 All Deployments。
3. 在 Vercel 添加自己的子域名，按 Vercel 显示的记录在 Cloudflare 配置 DNS，再验证 HTTPS 和匿名访问的登录限制。
4. 推送框架代码触发构建。用于个人学习的资料保存在自己的电脑上，打开站点后通过浏览器选取。

## 设计参考与致谢

以下项目是原站开发时记录的设计参考。第三方项目各自适用原仓库的条款。

- 口语练习的任务组织和复盘参考 yin-yizhen 的 [SpeakHub](https://github.com/yin-yizhen/SpeakHub)（MIT）。
- 情景对话参考 Xiaoyang Lyu（EthanLyu30）的 [spoken](https://github.com/EthanLyu30/spoken)（MIT）。
- 分级反馈、轻纠错和单任务练习参考 luyou666 的 [english-speaking-coach](https://github.com/luyou666/english-speaking-coach)（MIT）。
- 雅思口语练习结构参考 Luxshan2000 的 [IELTS Prep](https://github.com/Luxshan2000/ielts-prep)（MIT）。
- 对话中展示翻译和纠错的方式参考 anticipate218 的 [EchoMentor](https://github.com/anticipate218/EchoMentor)（MIT）。
- 考研英语的反馈组织参考 Echo1LZJY 的 [echo-kaoyan-english-skill](https://github.com/Echo1LZJY/echo-kaoyan-english-skill)。
- 场景状态和语音管线的设计参考 xiaochong 的 [hi-kid-fun](https://github.com/xiaochong/hi-kid-fun)。
- 原站界面的卡片、细分隔线和排版参考 huangshiyu13 的 [webtemplate](https://github.com/huangshiyu13/webtemplate)（Apache-2.0）。

## 免责声明

这是个人学习和技术交流项目，与考试主办机构及上述参考项目无隶属关系。资料由使用者自行准备和保管，使用时请遵守资料权利人的许可。判题以所提供的答案为准，写作反馈和估分仅供练习。清除浏览器站点数据可能丢失本地进度和草稿。
