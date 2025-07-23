import decorate from "../hero/hero.js";

export default function decorateBlock(doc){
  const firstChild = doc.firstElementChild;
  // firstChild.className = "oit-body-container"
  console.log({doc})
  decorate(firstChild)

}