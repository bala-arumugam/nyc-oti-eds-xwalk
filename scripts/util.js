import { loadBlock } from "./aem.js";


export function loadSubBlock(doc) {

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

  [...doc.children].forEach(function (s) {
    const cl = createStructure(s)
    if (cl) componentList.push(cl)
  });

  componentList.forEach(async function ({ componentName, el }) {
    await loadBlock(el);
  });
}