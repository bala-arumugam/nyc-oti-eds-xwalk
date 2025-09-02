import { getKeyValueData } from "../../scripts/util.js";

export default function decorate(block){
  const data = getKeyValueData(block, {richtext:'html'});

  // Clear the content of the block
  block.innerHTML = '';


  const template = `
  <h3>${data.title}</h3>
  <div>${data.richtext ? data.richtext.innerHTML || Array.from(data.richtext).map(el => el.outerHTML).join('') : ''}</div>
  `

  block.innerHTML = template

}