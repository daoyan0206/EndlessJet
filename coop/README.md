# Magnolia 双人合作版

这是 Magnolia 明确选定的单游戏体验分支。`index.html` 和离线导出保持原单人版本；合作包通过 `THUNDER_NETWORK` / `THUNDER_SERVER` 启用，不能直接双击进入联机。

服务端运行同一份战斗逻辑，两位玩家独立操控飞机，共享敌人、Boss、波次、等级和积分。玩家只发送移动与技能意图。队友存活时阵亡后 8 秒复活；全队阵亡后可在原房间重开。创建者退出不销毁仍有人的房间，允许补位；空房由平台专用运行服务回收。本模式无永久核心、平台结算或奖励写入。

构建：`node coop/build.mjs <新的输出目录> <锁定版本的 hago-sdk.js>`。发布包分 public 与 private，游戏服务端文件不得公开托管。Manifest 记录源码提交、脏状态、文件清单和 SHA256；生产安装拒绝脏源码。配套平台脚本与部署说明在 Magnolia 仓库的 `docs/thunder-coop-experience.md`。

验证：`node tests/runtime.test.cjs` 验证单人原逻辑；`node --test tests/coop.test.mjs` 验证合作战斗、意图边界、断线和死亡重开。真实 Colyseus 双客户端与平台浏览器邀请流程由 Magnolia 的两个 `probe-thunder-*` 脚本验收。VM 测试不代表真机和公网通过。

合作版使用平台自己的 Colyseus 0.16 Room，只复用现有 SDK/Bridge/固定入房协议；不声称该游戏已遵循正式 HagoRoom 游戏规范。UIUX 待处理。
