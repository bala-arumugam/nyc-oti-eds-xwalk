import { createElement } from "../../scripts/util.js";


// function createMenu(){
//   const order = new Set();
//   const main = document.querySelector('main');
//   const tabs = main.querySelectorAll('[data-tab-name]')

//   if (tabs.length) {
//     tabs.forEach((tab, idx) => {
//       const { tabName } = tab.dataset;
//       order.add(tabName);
//     });

//     const orderArray = Array.from(order);

//     const listItems = orderArray.map(item => `<li class="menu-item ${item}">${item}</li>`).join('');

//     const menu = document.createElement('div')
//     menu.classList.add("menu-regulation-index")

//     menu.innerHTML = `<ul>${listItems}</ul>`;
//     main.prepend(menu)
//   }
// }


export default async function decorate(doc) {
  const tabs = createElement("div",{props:{className:"regulation-tabs"}});

  const tab = createElement("div",{props:{className:"regulation-tab"}});
  const tab_description  = createElement("div", {props:{className:"tab-content-description"}})
  const tab_additional = createElement("div", {props:{className:"tab-content-additional"}})

  const list = {}

  document.querySelectorAll('[data-tab-name]').forEach(t=>{
    const {tabSectionName, tabName} = t.dataset   
    if(tabName in list){
      if(tabSectionName in list[tabName]){
        list[tabName][tabSectionName].push(t)
      }else{
        list[tabName][tabSectionName] = [t]
      }
    }else{
      list[tabName]={
        [tabSectionName]: [t]
      }
    }
  });

  // Create the tabs container structure as shown in the comment
  const tabsContainer = createElement("div", { props: { className: "tabs" } });
  
  // Iterate through the tabs list
  Object.entries(list).forEach(([tabName, sections]) => {
    // Create a new tab for each entry in the list
    const newTab = createElement("div", { props: { className: "tab" } });
    newTab.setAttribute('data-tab-name', tabName);
    
    // Create a header element for the tab name
    const tabHeader = createElement("h3", { props: { className: "tab-header" } });
    tabHeader.textContent = tabName;
    newTab.appendChild(tabHeader);

    // Create containers for this tab's content
    const descriptionContent = createElement("div", { props: { className: "tab-description" } });
    const additionalContent = createElement("div", { props: { className: "tab-additional" } });
    
    // Add content to the appropriate sections
    Object.entries(sections).forEach(([sectionName, elements]) => {
      elements.forEach(element => {
        if (sectionName === 'Description') {
          descriptionContent.appendChild(element);
        } else if (sectionName === 'Additional') {
          additionalContent.appendChild(element);
        }
      });
    });
    
    // Add both sections to the tab
    newTab.appendChild(descriptionContent);
    newTab.appendChild(additionalContent);

    // Add the tab to the tabs container
    tabsContainer.appendChild(newTab);
  });

  // Get the main element and append the tabs container to it
  const main = document.querySelector('main');
  
  //Clear any existing content from main if needed
  main.innerHTML = ''; // Uncomment if you want to clear main first
  
  // Add the tabs container to the main element
  main.appendChild(tabsContainer);
}