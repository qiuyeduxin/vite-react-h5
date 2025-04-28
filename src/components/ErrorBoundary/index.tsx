/**
 * React 错误边界
 * @example
 * // example 1 in App.js
 * export deafult
 * @errorBoundaryDecorator(fallback)
 * class App extends React.Component {
 *   render () {
 *     return <></>
 *   }
 * }
 *
 * // example 2 in index.js
 * entry(createErrorBoundary(App, fallback), {})
 *
 * // example 3 in functional component
 * export default createErrorBoundary(props => <>Some Component</>)
 *
 * // example 4 in hoc
 * export deault
 * class App extends React.Component{
 *   render () {
 *     return <ErrorBoundary>
 *       <div></div>
 *     </ErrorBoundary>
 *   }
 * }
 *
 * // example 5 in decorator with empty div
 * export default
 * @createErrorBoundaryNoFallback
 * class App extends React.Component{
 *   render () {
 *     return <></>
 *   }
 */
import React from 'react'
import createErrorBoundary from './createErrorBoundary'

export const createErrorBoundaryNoFallback = (Comp: any) => createErrorBoundary(Comp, '')
