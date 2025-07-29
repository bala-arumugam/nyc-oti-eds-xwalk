import { loadBlock } from "./aem.js";
/**
 * Loads and initiajilizes sub-block components from a given document fragment.
 * 
 * This function searches for specific `<p>` elements inside `<div>`s that define
 * a component using the format `component:ComponentName`. It then removes the
 * identifying paragraph, assigns the component name as a class and data attribute
 * to the element, and loads the block asynchronously.
 * 
 * @param {DocumentFragment | HTMLElement} doc - The document or fragment containing potential sub-blocks.
 */
export function loadSubBlock(doc) {

  /**
   * Parses an element to determine if it defines a component structure.
   * 
   * @param {HTMLElement} el - The element to inspect and potentially convert into a component.
   * @returns {{ componentName: string, el: HTMLElement } | null} - The component metadata or null if not a component.
   */

  function createStructure(el) {

    let componentList = [];
    const query = doc.querySelectorAll("div > p");
    if (!query) return null;

    const test = query[0]?.innerText.split(":");

    if (test) {
      const [isComponent, componentName] = test;
      if (isComponent == "component") {
        query[0].remove();
        el.className = `${componentName}`
        el.dataset.blockName = `${componentName}`;
        return {
          componentName,
          el
        }

      }
    }

    return null
  }

  let componentList = [];

  // Iterate over all children of the document and attempt to create components
  [...doc.children].forEach(function (s) {
    const cl = createStructure(s)
    if (cl) componentList.push(cl)
  });

  // Load each identified component block asynchronously
  componentList.forEach(async function ({ componentName, el }) {
    const domEl = document.querySelector(`[data-block-name=\"${componentName}\"]`)
    const status = domEl?.dataset?.blockStatus;
    if (status && status === 'loaded'){
      return; 
    }

    await loadBlock(el);
  });
}