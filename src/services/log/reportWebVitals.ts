import { onFCP, onTTFB } from 'web-vitals/attribution'
export type PerfEntry = {
  name: string
  value: number
}

const reportWebVitals = (onPerfEntry: (entry: PerfEntry) => void) => {
  onFCP((i: any) => {
    onPerfEntry({ name: 'fcpTime', value: parseInt(i.value) })
  })
  onTTFB((i: any) => {
    onPerfEntry({ name: 'ttfbTime', value: parseInt(i.value) })
  })
}

export default reportWebVitals
