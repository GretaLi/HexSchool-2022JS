const baseUrl = "https://livejs-api.hexschool.io/api/livejs/v1";
const api_path = "gredev";
const token = "BQOFivwVErQ5Vrin9mshSej8qbu2";

// 取得訂單列表
const orderTableWrap = document.querySelector("#orderTableWrap");
const orderListWrap = document.querySelector("#orderListWrap");
let orderData = [];
getOrderList();

function getOrderList() {
  axios
    .get(`${baseUrl}/admin/${api_path}/orders`, {
      headers: {
        Authorization: token,
      },
    })
    .then(function (response) {
      orderData = response.data.orders;
      console.log(response.data.orders);

      renderOrderList(orderData);
      renderC3(orderData);
    });
}
function renderOrderList(data) {
  let orderListHtml = "";
  data.forEach((item) => {
    let productListHtml = "";

    // 列出訂單品項
    item.products.forEach((product) => {
      productListHtml += `
      <p>${product.title}</p>
      `;
    });

    // 判斷訂單是否處理
    let isPaid;
    item.paid === true ? (isPaid = "已處理") : (isPaid = "未處理");

    // 時間轉換
    let timestamp = item.createdAt;
    let date = new Date(timestamp * 1000).toLocaleString().substring(0, 10);

    const templateOfOrderList = `
    <tr>
      <td>10088377581</td>
      <td>
        <p>${item.user.name}</p>
        <p>${item.user.tel}</p>
      </td>
      <td>${item.user.address}</td>
      <td>${item.user.email}</td>
      <td>
        ${productListHtml}
      </td>
      <td>${date}</td>
      <td class="orderStatus">
        <a class="orderStatus-btn" data-order-id="${item.id}" href="#">${isPaid}</a>
      </td>
      <td>
        <input type="button" class="delSingleOrder-btn" value="刪除" data-order-id="${item.id}">
      </td>
   </tr>
    `;

    orderListHtml += templateOfOrderList;
  });
  orderListWrap.innerHTML = orderListHtml;
}

function renderC3(data) {
  // 計算每品項數量 obj
  let obj = {};

  data.forEach((item) => {
    item.products.forEach((product) => {
      if (obj[product.title] === undefined) {
        obj[product.title] = product.quantity;
      } else {
        obj[product.title] += product.quantity;
      }
    });
  });
  // console.log(obj);

  // 轉 obj 至 c3 的 arr 格式
  let arr = [];
  let productTitles = Object.keys(obj);
  productTitles.forEach((title) => {
    arr.push([title, obj[title]]);
    // console.log(arr);
  });

  // C3.js
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: arr,
    },
  });
}

// 監聽訂單項目按鈕
orderTableWrap.addEventListener("click", (e) => {
  if (e.target.classList.contains("delSingleOrder-btn")) {
    const orderId = e.target.getAttribute("data-order-id");
    deleteOrderItem(orderId);
  }

  console.log(e.target);

  if (e.target.classList.contains("orderStatus-btn")) {
    const orderId = e.target.getAttribute("data-order-id");
    console.log(orderId);
    editOrderList(orderId);
  }
});

// PUT 修改訂單狀態
function editOrderList(orderId) {
  axios
    .put(
      `${baseUrl}/admin/${api_path}/orders`,
      {
        data: {
          id: orderId,
          paid: true,
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      console.log(response.data);
      renderOrderList(response.data.orders);
    });
}

// DELETE 刪除特定訂單
function deleteOrderItem(orderId) {
  axios
    .delete(`${baseUrl}/admin/${api_path}/orders/${orderId}`, {
      headers: {
        Authorization: token,
      },
    })
    .then(function (response) {
      console.log("刪除特定訂單");
      console.log(response.data);
      renderOrderList(response.data.orders);
      renderC3(response.data.orders);
    });
}

// DELTE 刪除全部訂單
const openDiscardAllModalBtn = document.querySelector(
  "#open-discardAllModal-btn"
);
const discardAllModal = document.querySelector("#delete-modal");

openDiscardAllModalBtn.addEventListener("click", openDiscardAllModal);
discardAllBtn.addEventListener("click", deleteAllOrder);

discardAllModal.addEventListener("click", (e) => {
  // 點擊灰色外圍關閉 modal
  e.target.classList.remove("active");

  // 點擊取消關閉 modal
  if (e.target.id === "close-discardAllModal-btn") {
    discardAllModal.classList.remove("active");
  }

  // 刪除全部訂單
  if (e.target.id === "discardAllBtn") {
    deleteAllOrder();
  }
});

function openDiscardAllModal(e) {
  e.preventDefault();
  discardAllModal.classList.add("active");
}

function deleteAllOrder() {
  console.log("刪除全部訂單");

  // axios
  //   .delete(`${baseUrl}/admin/${api_path}/orders`, {
  //     headers: {
  //       Authorization: token,
  //     },
  //   })
  //   .then(function (response) {
  //     console.log(response.data);
  //     renderOrderList(response.data);
  //     renderC3(response.data);
  //   });
}
