import { PhaseKey } from './types'

export type Route = 
  | { view: 'welcome' }
  | { view: 'dashboard' }
  | { view: 'phase'; phase: PhaseKey }

export function parseRoute(hash: string): Route {
  if (!hash || hash === '#/') {
    return { view: 'dashboard' }
  }

  if (hash === '#/welcome') {
    return { view: 'welcome' }
  }

  if (hash.startsWith('#/phase/')) {
    const phase = hash.replace('#/phase/', '') as PhaseKey
    const validPhases: PhaseKey[] = ['brainstorm', 'story', 'brand', 'prd', 'code', 'github']
    if (validPhases.includes(phase)) {
      return { view: 'phase', phase }
    }
  }

  return { view: 'dashboard' }
}

export function routeToHash(route: Route): string {
  if (route.view === 'welcome') {
    return '#/welcome'
  }
  if (route.view === 'phase') {
    return `#/phase/${route.phase}`
  }
  return '#/'
}

export function navigate(route: Route) {
  window.location.hash = routeToHash(route)
}
