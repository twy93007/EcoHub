# EcoHub 贡献指南

感谢您对EcoHub项目的关注！我们欢迎各种形式的贡献，包括但不限于代码提交、文档改进、问题报告和功能建议。以下是参与贡献的指南。

## 行为准则

参与本项目的所有贡献者都应遵循以下行为准则：
- 尊重所有参与者，不论技术水平、经验、教育背景或个人特征
- 使用友好和包容的语言
- 耐心接受建设性批评
- 关注项目和社区的最佳利益

## 如何贡献

### 报告问题

如果您发现了bug或有功能建议，请通过GitHub Issues提交，并遵循以下原则：
1. 使用清晰描述性的标题
2. 详细描述问题或建议
3. 提供复现步骤（对于bug）
4. 说明预期行为和实际行为
5. 提供相关的截图或错误日志
6. 标记适当的标签

### 提交代码

1. Fork本仓库
2. 创建您的特性分支（`git checkout -b feature/amazing-feature`）
3. 遵循代码风格和开发规范进行开发
4. 编写必要的测试代码
5. 确保所有测试通过
6. 提交您的改动（`git commit -m 'Add some amazing feature'`）
7. 推送到分支（`git push origin feature/amazing-feature`）
8. 创建一个Pull Request

### 分支命名约定

- `feature/*`: 新功能开发
- `bugfix/*`: 修复bug
- `docs/*`: 文档改进
- `refactor/*`: 代码重构，不涉及功能改动
- `test/*`: 添加或修改测试
- `chore/*`: 维护工作（如依赖更新等）

### 提交信息规范

我们使用[约定式提交](https://www.conventionalcommits.org/)规范，提交信息应遵循以下格式：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

常用的提交类型包括：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档改动
- `style`: 不影响代码逻辑的格式修改
- `refactor`: 代码重构
- `test`: 添加或修改测试
- `chore`: 其他修改

示例：
```
feat(api): 添加用户认证API

实现基于JWT的认证机制，包括登录和刷新令牌功能。

Closes #123
```

## 代码规范

### Python代码规范

- 遵循[PEP 8](https://www.python.org/dev/peps/pep-0008/)编码风格
- 使用[Black](https://github.com/psf/black)进行代码格式化
- 使用[isort](https://pycqa.github.io/isort/)整理导入顺序
- 使用[pylint](https://www.pylint.org/)或[flake8](https://flake8.pycqa.org/)进行代码检查
- 使用Python类型注解

### JavaScript/TypeScript代码规范

- 遵循[Airbnb JavaScript风格指南](https://github.com/airbnb/javascript)
- 使用ESLint和Prettier进行代码检查和格式化
- 优先使用TypeScript，确保类型安全

## 开发流程

1. 从最新的`master`分支创建您的特性分支
2. 进行开发和测试
3. 在提交PR前，确保与最新的`master`分支同步
4. 更新相关文档
5. 提交PR并等待代码评审
6. 根据评审反馈进行必要的修改
7. 一旦获得批准，将被合并到`master`分支

## 测试指南

- 所有新代码都应该有相应的测试
- 单元测试使用pytest（后端）和Jest（前端）
- 集成测试应覆盖关键功能路径
- 保持测试覆盖率在80%以上

## 文档指南

- 所有新功能应该有相应的文档
- 更新API文档和用户指南
- 使用Markdown格式编写文档
- 保持文档的清晰和简洁

## 版本发布流程

我们使用[语义化版本](https://semver.org/)管理版本号：
- 主版本号：不兼容的API变更
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正

## 许可证

通过贡献您的代码，您同意将其按照项目的[MIT许可证](LICENSE)进行授权。

## 联系方式

如有任何问题，请通过GitHub Issues或项目维护者的电子邮件联系我们。

感谢您的贡献！ 