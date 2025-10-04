import { interval, from, switchMap, takeWhile, catchError, EMPTY } from 'rxjs'
import { getJobStatus } from './runpodAPI'
import type { RunPodResponse } from '../types/runpod'

export const pollJobStatus = (jobId: string) => {
  return interval(3000).pipe(
    switchMap(() => from(getJobStatus(jobId))),
    takeWhile((response: RunPodResponse) => 
      response.status === 'IN_QUEUE' || response.status === 'IN_PROGRESS', 
      true
    ),
    catchError((error) => {
      console.error('Polling error:', error)
      return EMPTY
    })
  )
}