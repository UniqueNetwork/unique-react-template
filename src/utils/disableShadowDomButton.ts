function queryShadowRoot(
  element: Element | null,
  selector: string
): Element | null {
  if (!element) return null;
  const root = element.shadowRoot || element;
  const found = root.querySelector(selector);
  if (found) return found;

  const shadowHosts = root.querySelectorAll("*");
  for (const host of shadowHosts) {
    const result = queryShadowRoot(host, selector);
    if (result) return result;
  }

  return null;
}

export function disableElementInShadowDom(
  rootElement: Element | null,
  selector: string,
  elementIdToEnable: string
): void {
  const elementToDisable = queryShadowRoot(rootElement, selector);
  const elementToNotDisable = queryShadowRoot(rootElement, `#${elementIdToEnable}`);

  if (elementToDisable) {
    elementToDisable.setAttribute("style", "pointer-events: none;");
  }
  if (elementToNotDisable) {
    elementToNotDisable.setAttribute(
      "style",
      `
        pointer-events: auto;
        opacity: 1;
        position: relative;
        z-index: 1;
      `
    );
  }
}
