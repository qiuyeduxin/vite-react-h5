# React + TypeScript + Vite

这是一个 vite + react + typescript 的项目模板脚手架

## 快速开始

```shell
cd your_project
pnpm install
npm run start
```

## 本地开发

- ts 的 entry 业务可以参考 [demo](src/pages/banner/202503/demo/)开发, 运行起来后访问 http://localhost:3001/banner/202503/demo/index.html
- js 的 entry 业务可以参考 [demo2](src/pages/banner/202503/demo2/)开发, 运行起来后访问 http://localhost:3001/banner/202503/demo2/index.html

## 项目配置

### 基本配置

打开 .env 文件，把`VITE_APP_NAME`改为自己的应用名称

### react cdn 引入

打开 vite.config.ts 文件，找到 `externalGlobalsPlugin`使用位置，把 react 链接改为自己的 cdn 链接

## 构建

打包命令

```shell
npm run build
```

预览构建成果

```shell
npm run preview
```

单元测试

```shell
npm run test
```
