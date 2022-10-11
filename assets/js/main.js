import '../css/main.css';

//contentful
const client = contentful.createClient({
  space: 'jwwnuvyk0gqo',
  accessToken: 'i-_6NheUDolHljkdCDKY3qEgdyIFw9oPMiZlXCSJgU4',
});


//variables
const cartBtn = document.querySelector('#cartBtn');
const closeCartBtn = document.querySelector('#closeCartBtn');
const clearCartBtn = document.querySelector('#clearCartBtn');
const cartOverlay = document.querySelector('#cartOverlay');
const cartContainer = document.querySelector('#cartContainer');
const cartContent = document.querySelector('#cartContent');
const cartItems = document.querySelector('#cartItems');
const cartTotal = document.querySelector('#cartTotal');
const recommendationsContainer = document.querySelector('#recommendations');
const categoriesContainer = document.querySelector('#categories');
const shopNowBtn = document.querySelector('#shop');
const categorylinks = document.querySelector('#categorylinks');
const sidebarToggle = document.querySelector('#sidebarToggle');
const sidebar = document.querySelector('#sidebar');
const closeSidebar = document.querySelector('#closeSidebar');
const navBar = document.querySelector('#navBar');
const spinner = document.querySelector('#spinner');
const date = document.querySelector('#year');



//products added to cart
let cart = [];
let buttonsDOM = [];

//get products
class Products {
  async getProducts () {

   let contentful = await client.getEntries(
    {
    content_type: 'product'
  });
   let products = contentful.items;

   //destructuring each product
   products = products.map(product => {
    const {title, price, category} = product.fields;
    const {id} = product.sys;
    const image = product.fields.image.fields.file.url;
    return {title, price, id, image, category}
   });

   return products;

  }
}

//display products
class DisplayProducts {
  displayProducts(products) {
    let recommendations = '';
    let recommendationsArray = [...products];
    let ourRecommendations = [];
    let categoriesRecommendations = [];

    //I wanna recommend products between 95 and 200 € (maximum 1 product per category)
    for( let i=0; i < recommendationsArray.length; i++) {
      if(recommendationsArray[i].price < 200 && !categoriesRecommendations.includes(recommendationsArray[i].category)) {
          categoriesRecommendations.push(recommendationsArray[i].category);
          ourRecommendations.push(recommendationsArray[i]);
      }
    };
    ourRecommendations.forEach(item => recommendations+= this.displayProduct(item));
    recommendationsContainer.innerHTML = recommendations;
   }

  displayProduct(product) {
    let result = `<article class="flex flex-col px-4 py-4 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
      <div class="group w-full relative overflow-hidden h-[250px]">
        <img src="${product.image}" alt="${product.title}" class="w-full h-full group-hover:opacity-60 object-cover">
        <button class="bg-primary py-3 px-6 text-base font-bold uppercase border-none cursor-pointer translate-x-[101%] transition-all duration-300 ease-linear group-hover:translate-x-0 absolute right-0 top-[70%] hover:text-white" data-id="${product.id}" id="addToCartButton">
          <i class="fas fa-shopping-cart text-base mr-4"></i>add to cart
        </button>
      </div>
      <div class="text-center">
        <h3 class="font-montserrat font-semibold text-base md:text-lg text-title uppercase mt-6">${product.title}</h3>
        <span class="text-base font-semibold text-primary">${product.price}€</span>
      </div>
    </article>`;
    return result;
  }

  displayCategories () {
    let categories = Storage.getCategories();
    let result = '';
    categories.forEach(category => result+= this.displayCategory(category));
    categoriesContainer.innerHTML = result;
    shopNowBtn.addEventListener("click", () => {
      let title = recommendationsContainer.previousElementSibling;
      let navBarHeight = navBar.getBoundingClientRect().height;
      window.scrollTo(0, title.offsetTop - navBarHeight);
    });

  }

  displayCategory(category) {
    let productsByCategory = Storage.getProductsByCategory(category);

    let displayProductsByCategory = '';
    productsByCategory.forEach(product => displayProductsByCategory+= this.displayProduct(product));

    let result = `<section class="px-10 py-10">
                      <div class="w-full">
                        <h2 class="font-montserrat font-bold text-title text-2xl md:text-3xl text-left uppercase mb-12">${category}</h2>
                        <div class="flex flex-col md:flex-row flex-wrap justify-evenly" id=${category.toLowerCase()}>` + displayProductsByCategory + `</div>
                        </div>
                      </section>`;

    return result;
  }

  displaySideBar() {
    let categories = Storage.getCategories();
    let result = '';
    categories.forEach(category => {
      result += `<li class="mb-10 font-montserrat text-4xl text-title font-bold hover:text-primary">
      <a id="${category}" class="uppercase cursor-pointer">${category}</a>
    </li>`
    });
    categorylinks.innerHTML = result;

    //show or hide sidebar
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle('-translate-x-full');
    });
    closeSidebar.addEventListener("click", () => {
      if( !sidebar.classList.contains('-translate-x-full')) {
          sidebar.classList.add('-translate-x-full');
      } else {
          sidebar.classList.remove('-translate-x-full');
      }
    });

    //add eventlisteners to each category link in the sidebar
    categorylinks.addEventListener("click", e => {
      let categories = Storage.getCategories();
      categories.forEach(category => {
        const container = document.getElementById(category.toLowerCase());
        const title = container.previousElementSibling;
        if(e.target.id === category) {
          window.scrollTo(0, title.offsetTop - 125);
        }
        sidebar.classList.add('-translate-x-full');
      });

    });
  }

  //get "add to cart" buttons
  getAddToCartButtons() {
    const addToCartButtons = [...document.querySelectorAll('#addToCartButton')];
    buttonsDOM = addToCartButtons;
    addToCartButtons.forEach(addToCartButton => {
      let id = addToCartButton.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if(inCart) {
        addToCartButton.textContent = 'In cart';
        addToCartButton.disabled = true;
      }
        addToCartButton.addEventListener("click", (e) => {
          e.target.innerText = "In cart";
          e.target.disabled = true;

          //get product from products
          let cartItem = { ...Storage.getProduct(id), amount: 1 };

          //add product to cart
          cart = [...cart, cartItem];

          //save cart in local storage
          Storage.saveCart(cart);

          //set cart values
          this.setCartValues(cart);

          // display cart item method
          this.addCartItem(cartItem);

          //show the cart
          this.showCart();


        });

    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;

  }

  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('flex', 'justify-between', 'items-stretch', 'bg-white', 'mb-4');
    div.innerHTML = `<img src="${item.image}" alt="" class="w-[80px] h-auto object-cover">
    <div class="flex flex-col justify-between flex-1 mx-6 py-3">
      <h4>${item.title}</h4>
      <h5>${item.price}€</h5>
      <span><i class="fas fa-trash cursor-pointer removeItem" data-id=${item.id}></i></span>
    </div>
    <div class="flex flex-col justify-between mr-6 py-3 text-right">
      <span class="cursor-pointer addQuantity" data-id=${item.id}>+</span>
      <span>${item.amount}</span>
      <span class="cursor-pointer removeQuantity" data-id=${item.id}>-</span>
    </div>`;
    cartContent.appendChild(div);

  }

  showCart() {
    cartOverlay.classList.remove('hidden');
    cartContainer.classList.remove('translate-x-0');

  }

  showAmountCart() {
    cart.length > 0 ? cartItems.classList.remove('hidden') : cartItems.classList.add('hidden');
  }

  hideCart() {
    cartOverlay.classList.add('hidden');
  }

  clearCart() {
    let cartItemsIds = cart.map(cartItem => cartItem.id); //get all the ids in the cart I want to remove
    cartItemsIds.forEach(id => this.removeItem(id)); //remove items from the cart
    //console.log(cartContent.children);
    while(cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]); //remove items from the DOM
    }
    this.hideCart();
    this.showAmountCart();
  }

  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart text-base mr-4"></i>add to cart`;
  }

  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }

  cartLogic() {
    //clear cart
    clearCartBtn.addEventListener("click", () => this.clearCart());

    //Listen to event in cart items (remove, add amount, remove amount)
    cartContent.addEventListener("click", e => {
      if(e.target.classList.contains('removeItem')) {
        let removeItem = e.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement.parentElement); // remove item from the DOM
        this.removeItem(id); //remove the item from the cart
        this.showAmountCart();
      }
      else if(e.target.classList.contains('addQuantity')) {
        let addAmount = e.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount += 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      }
      else if (e.target.classList.contains('removeQuantity')){
        let substractAmount = e.target;
        let id = substractAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount -= 1;
        if(tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          substractAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(substractAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    })
  }

  setupApp() {
    cart = Storage.getCart();
    this.showAmountCart();
    this.setCartValues(cart);
    this.populate(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
    window.addEventListener("click", (e) => {
      if(e.target.id === 'cartOverlay') {
        this.hideCart(); //hide cart when cart is open and user clicks outside the cart at any point of the screen
        this.showAmountCart();
      }
    });
    window.addEventListener("scroll", () => {
      if(window.scrollY > 100) {
        navBar.classList.add('bg-white');
      } else {
        navBar.classList.remove('bg-white');
      }
    });
    let year = new Date().getUTCFullYear();
    date.innerHTML = year;

  }

  populate(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

}

//Local Storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products")); //we retrieve the products array that it is in Local Storage

    return products.find(product => product.id === id);
  }

  static getCategories() {
    let categories = JSON.parse(localStorage.getItem("products"));
    let result = [];
    for(let i=0; i < categories.length; i++) {
      if(!result.includes(categories[i].category)) {
        result.push(categories[i].category);
      }
    }
    return result;
  }

  static getProductsByCategory(category) {
    let products = JSON.parse(localStorage.getItem("products")); //we retrieve the products array that it is in Local Storage

    return products.filter(product => product.category === category);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  }
}

//Spinner
window.addEventListener("load", () => {
    spinner.classList.add("hidden"); //hide the spinner when window is loaded
    spinner.addEventListener("transitionend", () => {
      document.body.removeChild("spinner"); //remove the spinner from the DOM when transition is ended
    });
});

//Initialitazion
document.addEventListener('DOMContentLoaded',  () => {
  const display = new DisplayProducts();
  const products = new Products();

  //setup app
    display.setupApp();

    products.getProducts()
    .then(products => {
    display.displayProducts(products);
    Storage.saveProducts(products);
    display.displayCategories();
    display.displaySideBar();
    })
    .then(() => {
      display.getAddToCartButtons();
      display.cartLogic();
    });

});
