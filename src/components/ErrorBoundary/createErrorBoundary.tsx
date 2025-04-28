import React, { isValidElement } from 'react'
import ErrorBoundary from './ErrorBoundary'

const createErrorBoundary =
  (Comp: any, fallback: any = false) =>
  (props: any) =>
    (
      <ErrorBoundary fallback={fallback}>
        {isValidElement(Comp) ? Comp : <Comp {...props} />}
      </ErrorBoundary>
    )

export default createErrorBoundary
