import React, { isValidElement } from 'react'
import ErrorBoundary from './ErrorBoundary'

export const errorBoundaryDecorator =
  (fallback: any = false) =>
  (Comp: any) =>
    <ErrorBoundary fallback={fallback}>{isValidElement(Comp) ? Comp : <Comp />}</ErrorBoundary>

export default errorBoundaryDecorator
