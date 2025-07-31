
export default async function decorate(doc) {

  const order = new Set();

  document.querySelectorAll('[data-tab-name]').forEach(tab => {
    const { tabName } = tab.dataset;
    order.add(tabName);
  });

  const orderArray = Array.from(order);

  const listItems = orderArray.map(item => `<li class="menu-item ${item}">${item}</li>`).join('');

  const menu = document.createElement('div')
  menu.classList.add("menu-regulation-index")

  menu.innerHTML = `<ul>${listItems}</ul>`;
  main.prepend(menu)
}