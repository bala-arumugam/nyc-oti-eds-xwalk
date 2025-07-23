export default function decorateBlock(doc){
  const firstChild = doc.firstElementChild;
  const secondChild = firstChild.firstElementChild;
  
  firstChild.className = "oit-fluid-container"
  secondChild.className = "oit-row"
  debugger
}