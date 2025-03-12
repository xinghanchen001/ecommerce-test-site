# Redtrack 与 Stripe 结账流程集成文档

## 问题概述

**需求**: 在 bper.me 网站上集成 Redtrack 跟踪系统，同时保持 Stripe 结账功能正常工作。

**挑战**: Redtrack 要求按钮链接指向`https://blog.bper.online/click`，但这会干扰原有的基于 JavaScript 的 Stripe 结账流程。

**网站结构**:

- 主页`index.html`上有结账按钮，使用`<a>`标签，原 href 为`javascript:void(0)`
- 在`blutdruck-analyse.html`和`blutdruck-test-merged.html`中有结账按钮，使用`<button>`元素
- 所有按钮通过 JavaScript 的`handleCheckout()`函数处理结账流程

## 实现的解决方案

### 1. 修改链接格式

对于`index.html`中的`<a>`标签，采用特殊格式：

```html
href="javascript:void(0)--@https://blog.bper.online/click"
```

这种格式:

- 保留了`javascript:void(0)`部分以防止默认导航行为
- 通过`--@`分隔符添加了 Redtrack 跟踪 URL
- 允许 JavaScript 解析并提取跟踪 URL

### 2. 使用数据属性

对于`blutdruck-analyse.html`和`blutdruck-test-merged.html`中的`<button>`元素，添加数据属性：

```html
data-tracking-url="https://blog.bper.online/click"
```

### 3. 增强`handleCheckout`函数

修改了所有三个 HTML 文件中的`handleCheckout`函数，使其：

- 接受事件对象作为参数
- 检测并提取跟踪 URL（从链接的 href 属性或按钮的 data-tracking-url 属性）
- 在继续结账流程之前发送跟踪请求
- 即使跟踪失败，也能继续结账流程

```javascript
async function handleCheckout(event) {
  try {
    // 阻止默认行为
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    // 获取跟踪URL
    let trackingUrl = null;
    if (event && event.currentTarget) {
      if (
        event.currentTarget.dataset &&
        event.currentTarget.dataset.trackingUrl
      ) {
        trackingUrl = event.currentTarget.dataset.trackingUrl;
      } else if (
        event.currentTarget.href &&
        event.currentTarget.href.includes('--@')
      ) {
        trackingUrl = event.currentTarget.href.split('--@')[1];
      }
    }

    // 发送跟踪请求
    if (trackingUrl) {
      try {
        console.log('Sending tracking request to:', trackingUrl);
        const trackingImg = new Image();
        trackingImg.src = trackingUrl + '?t=' + new Date().getTime();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (trackingError) {
        console.error('Tracking error:', trackingError);
      }
    }

    // 继续原有结账流程...
  } catch (error) {
    // 错误处理...
  }
}
```

## 工作原理

1. **用户点击**: 当用户点击"Jetzt Angebot sichern"按钮时，触发点击事件
2. **事件处理**: `handleCheckout`函数接收事件，阻止默认导航行为
3. **跟踪处理**: 函数检测是否有跟踪 URL，如果有，使用图像对象发送跟踪请求
4. **等待处理**: 短暂等待以确保跟踪请求有时间发送
5. **继续结账**: 然后继续原有的 Stripe 结账流程:
   - 检查环境（本地/生产）
   - 调用 API 端点创建结账会话
   - 将用户重定向到 Stripe 托管的结账页面

## 实现细节

### 修改的文件

- `index.html`
- `blutdruck-analyse.html`
- `blutdruck-test-merged.html`

### 新增功能

- 跟踪点击事件
- 兼容不同类型的按钮元素
- 错误处理和恢复机制
- 调试和日志记录

## 测试方法

1. 在本地环境(`http://localhost:3002`)检查浏览器控制台，确认：

   - 跟踪请求正确发送
   - 本地环境通知正常显示

2. 在生产环境中，确认：
   - 跟踪请求发送到 Redtrack
   - Stripe 结账流程正常工作
   - 用户能够完成支付

## 维护注意事项

1. **跟踪 URL 变更**: 如果 Redtrack 更改跟踪 URL，需要更新所有三个文件中的 URL
2. **按钮变更**: 添加新的结账按钮时，确保添加适当的跟踪属性
3. **超时设置**: 目前设置了 100ms 超时等待跟踪请求，可根据需要调整

---

_文档创建日期: 2025 年 3 月 12 日_
