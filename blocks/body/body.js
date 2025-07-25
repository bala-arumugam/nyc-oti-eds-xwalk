// import { buildBlock } from "../../scripts/aem";




export default async function decorateBlock(doc){


function createStructure(doc){

  let componentList = [];
    const query = doc.querySelectorAll("div > p");
    if(!query) return;
    
    const [isComponent, componentName]  = query[0]?.innerText.split(":");
    if(isComponent == "component"){
        query[0].remove();
        doc.className = `${componentName}`   
        return {
          componentName, 
          doc
        }
      
    }
    return null
}




    let componentList = [];

    [...doc.children].forEach(function(s){
      const cl = createStructure(s)
        if(cl) componentList.push(cl) 
    });

    componentList.forEach(function({componentName, doc}){
      console.log({componentName})
      // const f = buildBlock(componentName,doc);
    })
    

    // const fun = {
    //   // "hero": decorateHero,
    //   // "regulation-tabs":decorateRT,
    //   // "step-cta":decorateST
    // }

    // componentList.forEach(({doc,componentName})=>{
    //     if(fun[componentName]){
    //       // fun[componentName](doc)
    //     }
    // })
   
    

    
}