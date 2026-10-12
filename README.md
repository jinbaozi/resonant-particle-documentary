# 同频粒子纪录片 SKILL

标准入口：`SKILL.md`。唯一必填输入是主题。

调用示例：
> 使用 resonant-particle-documentary，主题：人海里遇见一个同频的人，到底有多难？

> 按《合拍》的固定粒子风格制作，主题：为什么我们总是舍不得放弃？

## 安装

把整个 `resonant-particle-documentary` 文件夹放到支持标准SKILL.md的工具的skills目录。Codex工作区可放 `.agents/skills/`。本仓库更新后，已安装副本需另行同步。其他对话/账号需要按所在工具的技能导入方式安装，本包不会自动改动账号级技能库。

## 环境

Python 3.10+、Node.js22+、FFmpeg、Chromium，字体已随包附带：Noto Serif CJK SC、Liberation Serif、Liberation Sans，保留原始许可文本。

```bash
python -m pip install -r requirements.txt
python -m playwright install chromium
npm install
```

npm依赖锁定HyperFrames 0.8.147；也可用环境变量`HYPERFRAMES_CLI`指向已有同版本CLI。`CHROMIUM_PATH`可指向系统Chromium；不设置时优先查找系统浏览器，再使用Playwright安装的浏览器。工具需要本地回环连接。

## 主题动画

画风固定，镜头随主题创作。先读 `references/theme-scenes.md`。配置必须指定独立主题模块和完整分镜，缺失时不套用《合拍》。`examples/hepai.json` 和 `examples/survivorship.json` 分别展示不同主题的动作设计；复制示例时应连同其相邻的 `*-scenes.js` 一起复制。

## 包内容

- `SKILL.md`：触发、固定规则、操作与验收。
- `references/`：画风与时间契约、来源与事实规则。
- `scripts/`：构建、混音、预览、渲染、成片验收。
- `templates/`：公共粒子绘制与连续形变机制。
- `examples/`：两套显式主题配置、各自的镜头模块，以及《合拍》画风参考。
- `assets/we-never.m4a`：本任务用户指定音乐的固定素材。
- `assets/fonts/`：固定字体与开放字体许可；无需另装系统字体。

音频作为本用户制作流程的私有素材收录；该包不授予音乐版权或公开再分发许可。GSAP资源保留原始文件头许可链接。
