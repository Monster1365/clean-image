/** Window event fired when the user asks to reset the page (e.g. clicking the logo). */
export const RESET_EVENT = "clean-image:reset";

export function requestReset() {
  window.dispatchEvent(new Event(RESET_EVENT));
}
