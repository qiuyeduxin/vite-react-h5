import React from 'react'

class ErrorBoundary extends React.Component<
  {
    fallback?: React.ElementType | string | boolean
    children: any
  },
  {
    hasError: boolean
  }
> {
  static defaultProps = {
    fallback: null
  }

  state = {
    hasError: false
  }

  // eslint-disable-next-line handle-callback-err
  static getDerivedStateFromError(error: Error) {
    console.log("ErrorBoundary getDerivedStateFromError's error: ", error)
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true }
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // 将错误日志上报给服务器
  }

  render() {
    const { children, fallback, ...otherProps } = this.props
    if (this.state.hasError && Boolean(fallback)) {
      // 渲染降级 UI
      return fallback
    }
    return React.Children.map(children, (child) => React.cloneElement(child, { ...otherProps }))
  }
}

export default ErrorBoundary
