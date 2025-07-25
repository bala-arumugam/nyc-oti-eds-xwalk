import { buildBlock, loadBlock, decorateBlock } from "../../scripts/aem.js";

export default async function decorate(doc) {

  function createStructure(el) {

    let componentList = [];
    const query = doc.querySelectorAll("div > p");
    if (!query) return;

    const test = query[0]?.innerText.split(":");

    if(test){
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
  })
}