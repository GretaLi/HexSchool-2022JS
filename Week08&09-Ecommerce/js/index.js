const baseUrl = "https://livejs-api.hexschool.io/api/livejs/v1/customer";
const api_path = "gredev";

init();
function init() {
  getProductList();
  getCartList();
}

// --- 產品相關(客戶) --- //

// 取得產品列表
const productWrap = document.querySelector(".productWrap");
const productsArr = [];

function getProductList() {
  axios
    .get(`${baseUrl}/${api_path}/products/`)
    .then(function (response) {
      // console.log("產品列表");
      // console.log(response.data)
      const data = response.data.products;
      // console.dir(data);
      data.forEach((item) => {
        productsArr.push(item);
      });
      renderProductList(productsArr);
    })
    .catch(function (error) {
      console.log(error.response.data);
    });
}

function renderProductList(data) {
  let productListHtml = ``;

  data.forEach((item) => {
    let templateOfProductList = `
    <li class="productCard">
      <h4 class="productType">新品</h4>
      <img
        src="${item.images}"
        alt="${item.description}"
      />
      <a href="#" data-product-id="${item.id}" class="addCardBtn">加入購物車</a>
      <h3>${item.title}</h3>
      <del class="originPrice">NT$ ${item.origin_price}</del>
      <p class="nowPrice">NT$ ${item.price}</p>
    </li>`;
    productListHtml += templateOfProductList;
  });
  productWrap.innerHTML = productListHtml;
}

// 篩選產品列表
document.querySelector("#productSelect").addEventListener("change", (e) => {
  const category = e.target.value;
  selectedProductList(productsArr, category);
});

function selectedProductList(data, category) {
  if (category === "全部") {
    renderProductList(data);
    return;
  }

  const selectedData = data.filter((item) => {
    return item.category == category;
  });
  renderProductList(selectedData);
}

// --- 購物車相關(客戶) --- //

// GET 取得購物車列表

const shoppingCartEl = document.querySelector(".shoppingCart .overflowWrap");

function getCartList() {
  axios
    .get(`${baseUrl}/${api_path}/carts`)
    .then(function (response) {
      // console.log("購物車列表");
      // console.log(response.data);
      const cartListData = response.data;
      renderCartList(cartListData);
    })
    .catch(function (error) {
      console.log(error);
    });
}

const cartListWrap = document.querySelector("#cartListWrap");
function renderCartList(data) {
  if (data.carts.length === 0) {
    console.log("購物車是空的");
    shoppingCartEl.innerHTML = `<p class="shoppingCart-empty">請新增產品至購物車</p>`;
    return;
  }

  const finalTotalEl = document.querySelector("#finalTotal");
  finalTotalEl.textContent = `NT$ ${data.finalTotal}`;

  let cartListHtml = ``;
  data.carts.forEach((item) => {
    let templateOfCartList = `
    <tr>
      <td>
        <div class="cardItem-title" data-cart-id="${item.id}" data-cart-qty="${
      item.quantity
    }">
          <img src="${item.product.images}" alt="" />
          <p>${item.product.title}</p>
        </div>
      </td>
      <td>NT$ ${item.product.price}</td>
      <td>
        <button id="cardBtn-decrement" class="cardBtn-decrement">-</button>
        ${item.quantity}
        <button id="cardBtn-increment" class="cardBtn-increment">+</button>
      </td>
      <td>NT$ ${item.product.price * item.quantity}</td>
      <td class="discardBtn">
        <a href="#" id="cardBtn-discard" class="material-icons"> clear </a>
      </td>
    </tr>
    `;
    cartListHtml += templateOfCartList;
  });

  cartListWrap.innerHTML = cartListHtml;
}

// 監聽產品列表之加入購物車
productWrap.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.classList.contains("addCardBtn")) {
    const productId = e.target.getAttribute("data-product-id");
    // console.log(productId);
    addCartItem(productId, 1);
  }
});

// POST 加入購物車
function addCartItem(productId, quantity) {
  axios
    .post(`${baseUrl}/${api_path}/carts`, {
      data: {
        productId,
        quantity,
      },
    })
    .then(function (response) {
      console.log("加入購物車");
      console.log(response.data);
      let data = response.data;
      renderCartList(data);
    })
    .catch(function (error) {
      console.log(error.response.data);
    });
}

// 監聽購物車按鈕
shoppingCartEl.addEventListener("click", (e) => {
  e.preventDefault();
  // console.log("監聽購物車按紐");
  // console.log(e.target);

  const getCartItem = (target) =>
    target.parentElement.parentElement.children[0].children[0];
  const getCartItemId = (cartItem) => cartItem.getAttribute("data-cart-id");
  const getCartItemQty = (cartItem) => cartItem.getAttribute("data-cart-qty");

  // 增加產品數量
  if (e.target.id === "cardBtn-increment") {
    const cartItem = getCartItem(e.target);
    const cartItemId = getCartItemId(cartItem);

    let cartItemQty = getCartItemQty(cartItem);
    cartItemQty = parseInt(cartItemQty) + 1;
    cartItem.setAttribute("data-cart-qty", cartItemQty.toString());

    editCartItem(cartItemId, cartItemQty);
    return;
  }

  // 減少產品數量
  if (e.target.id === "cardBtn-decrement") {
    const cartItem = getCartItem(e.target);
    const cartItemId = getCartItemId(cartItem);

    let cartItemQty = getCartItemQty(cartItem);

    // 產品數量不可以小於 1，判斷如小於 1 直接用 delete 刪除
    if (cartItemQty == 1) {
      deleteCartItem(cartItemId);
      return;
    }
    cartItemQty = parseInt(cartItemQty) - 1;
    cartItem.setAttribute("data-cart-qty", cartItemQty.toString());
    editCartItem(cartItemId, cartItemQty);
    return;
  }

  // 刪除購物車內特定產品
  if (e.target.id === "cardBtn-discard") {
    const cartItem = getCartItem(e.target);
    const cartItemId = getCartItemId(cartItem);

    deleteCartItem(cartItemId);
    return;
  }

  // 刪除購物車所有產品
  if (e.target.id === "cardBtn-discardAll") {
    console.log("刪除購物車所有產品");
    deleteAllCartList();
    return;
  }
});

// PATCH 編輯購物車產品數量
function editCartItem(cartId, quantity) {
  axios
    .patch(`${baseUrl}/${api_path}/carts`, {
      data: {
        id: cartId,
        quantity,
      },
    })
    .then(function (response) {
      console.log(response.data);
      renderCartList(response.data);
    })
    .catch(function (error) {
      console.log(error.response.data);
    });
}

// DELETE 刪除購物車內特定產品
function deleteCartItem(cartId) {
  axios
    .delete(`${baseUrl}/${api_path}/carts/${cartId}`)
    .then(function (response) {
      console.log(response.data);
      renderCartList(response.data);
    })
    .catch(function (error) {
      console.log(error.response.data);
    });
}

// DELETE 清除購物車內全部產品
function deleteAllCartList() {
  axios
    .delete(`${baseUrl}/${api_path}/carts`)
    .then(function (response) {
      console.log(response.data);
      renderCartList(response.data);
    })
    .catch(function (error) {
      console.log(error.response.data);
    });
}

// --- 訂單相關(客戶) --- //

const orderForm = document.querySelector("#orderInfo-form");
orderForm.addEventListener("submit", submitOderForm);

// 提交訂單
function submitOderForm(e) {
  e.preventDefault();

  const formData = new FormData(orderForm);
  let isValid = validateForm(formData);

  if (!isValid) {
    console.log("表單有誤停止送出");
    return;
  }

  const orderUser = {
    name: formData.get(`姓名`),
    tel: formData.get(`電話`),
    email: formData.get(`Email`),
    address: formData.get(`寄送地址`),
    payment: formData.get(`交易方式`),
  };

  createOrder(orderUser);
}

// 表單驗證
function validateForm(form) {
  let isValid = true;
  const inputs = []; // 清空

  for (const pair of form.entries()) {
    inputs.push(pair[0]);

    if (pair[1] === "") {
      document.querySelector(`[data-message="${pair[0]}"]`).textContent =
        "必填";
      isValid = false;
    }
  }

  inputs.forEach((input) => {
    document
      .querySelector(`[name="${input}"]`)
      .addEventListener("change", () => {
        document.querySelector(`[data-message="${input}"]`).textContent = "";
      });
  });
  return isValid;
}

// POST 送出購買訂單
function createOrder(orderUser) {
  axios
    .post(`${baseUrl}/${api_path}/orders`, {
      data: {
        user: orderUser,
      },
    })
    .then(function (response) {
      console.log("送出購買訂單");
      // console.log(response.data);
      document.querySelector("#success-modal").classList.add("active");
      document
        .querySelector("#success-modal")
        .addEventListener("click", (e) => {
          e.target.classList.remove("active");
        });
      orderForm.reset();

      shoppingCartEl.innerHTML = `<p class="shoppingCart-empty">請新增產品至購物車</p>`;
    })
    .catch(function (error) {
      console.log(error.response.data);
    });
}
