/**
 * DoAide Umami Event Tracking Utility
 * Event naming: <category>:<action>
 */

function track(eventName, data = {}) {
  try {
    if (typeof window !== 'undefined' && window.umami) {
      window.umami.track(eventName, { ...data, path: window.location.pathname })
    }
  } catch { /* analytics should never break the app */ }
}

export function trackCalculation(name, meta = {}) { track('calculator:calculate', { calculator: name, ...meta }) }
export function trackShare(medium, toolName) { track('calculator:share', { medium, calculator: toolName }) }
export function trackPrint(name) { track('calculator:print', { calculator: name }) }
export function trackFeedback(action, meta = {}) { track(`feedback:${action}`, meta) }
export function trackNav(type, target) { track(`nav:${type}`, { target }) }
export function trackError(source, message) { track('error:shown', { source, message: String(message).slice(0, 200) }) }
export function trackCTA(action, meta = {}) { track(`cta:${action}`, meta) }
export function trackEvent(name, data = {}) { track(name, data) }
