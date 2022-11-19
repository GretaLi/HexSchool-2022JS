// 0. DOM

const addTicketForm = document.querySelector(".addTicket-form");
const addTicketBtn = document.querySelector(".addTicket-btn");

const regionSearch = document.querySelector(".regionSearch");
const ticketCardArea = document.querySelector(".ticketCard-area");
const searchResultText = document.querySelector("#searchResult-text");

// 1. axios 取得資料

const url =
  "https://raw.githubusercontent.com/hexschool/js-training/main/travelApi.json";
let data = [];

function init() {
  axios
    .get(url)
    .then(function (response) {
      // handle success
      data = response.data.data;

      // 網頁載入渲染
      renderCards(data);
      renderResultText(data);
      renderC3(data);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
}

init();

// ----------- 第七週任務開始 -----------//

function renderC3(data) {
  const dataObj = {};
  data.forEach((item) => {
    if (dataObj[item.area] === undefined) {
      dataObj[item.area] = 1;
    } else {
      dataObj[item.area]++;
    }
  });

  const dataArr = [];
  Object.keys(dataObj).forEach((area) => {
    let areaArr = [area, dataObj[area]];
    dataArr.push(areaArr);
  });

  const chart = c3.generate({
    bindto: "#chart",
    data: {
      columns: dataArr,
      type: "donut",
      colors: {
        台北: "#64c3bf",
        台中: "#5151D3",
        高雄: "#E68618",
      },
    },
    donut: {
      title: "套票地區比重",
      width: 15,
      label: {
        show: false,
      },
    },
  });
}

// ----------- 第七週任務結束 -----------//

// 2. 事件監聽

addTicketBtn.addEventListener("click", addTicket);
regionSearch.addEventListener("change", renderSelectedCard);

// 3. 產品渲染及篩選功能

function renderSelectedCard() {
  let selectedProductArr = getSlectedProduct();
  renderCards(selectedProductArr);
  renderResultText(selectedProductArr);
  return;
}

function getSlectedProduct() {
  let region = regionSearch.value;

  if (region === "") {
    return data;
  } else {
    let selectedProductArr = data.filter((product) => {
      return region === product.area;
    });
    return selectedProductArr;
  }
}

function renderCards(productArr) {
  let cardsHtml = "";

  productArr.forEach((product) => {
    const cardHtml = `
          <li class="ticketCard">
              <div class="ticketCard-img">
              <a href="#">
                  <img
                  src="${product.imgUrl}"
                  alt="${product.name}的圖片"
                  />
              </a>
              <div class="ticketCard-region" data-region="${product.area}">${product.area}</div>
              <div class="ticketCard-rank">${product.rate}</div>
              </div>
              <div class="ticketCard-content">
              <div>
                  <h3>
                  <a href="#" class="ticketCard-name">${product.name}</a>
                  </h3>
                  <p class="ticketCard-description">
                  ${product.description}
                  </p>
              </div>
              <div class="ticketCard-info">
                  <p class="ticketCard-num">
                  <span><i class="fas fa-exclamation-circle"></i></span>
                  剩下最後 <span id="ticketCard-num"> ${product.group} </span> 組
                  </p>
                  <p class="ticketCard-price">
                  TWD <span id="ticketCard-price">$${product.price}</span>
                  </p>
              </div>
              </div>
          </li>`;
    cardsHtml += cardHtml;
  });
  ticketCardArea.innerHTML = cardsHtml;
  return;
}

function renderResultText(data) {
  searchResultText.innerHTML = `本次搜尋共 ${data.length} 筆資料`;
  if (data.length === 0) {
    document.querySelector(".cantFind-area").style.display = "block";
  }
}

// 3. 新增產品功能

function addTicket(e) {
  e.preventDefault();

  let isValid = true;

  const form = {
    name: document.querySelector("#ticketName"),
    imgUrl: document.querySelector("#ticketImgUrl"),
    area: document.querySelector("#ticketRegion"),
    description: document.querySelector("#ticketDescription"),
    group: document.querySelector("#ticketNum"),
    price: document.querySelector("#ticketPrice"),
    rate: document.querySelector("#ticketRate"),
  };

  // 檢查表單是否有空字串
  if (form.name.value === "") {
    showAlert(form.name);
  }

  if (form.imgUrl.value === "") {
    showAlert(form.imgUrl);
  }

  if (form.description.value === "") {
    showAlert(form.description);
  }

  // 檢查地區未選
  if (form.area.value === "") {
    showAlert(form.area);
  }

  // 檢查表單金額大於 0
  if (!form.price.value > 0) {
    showAlert(form.price);
  }

  // 檢查套票組數大於 0
  if (!form.group.value > 0) {
    showAlert(form.group);
  }

  // 檢查星級數在 1 ~ 10 之間
  if (form.rate.value < 1 || form.rate.value > 10) {
    showAlert(form.rate);
  }

  function showAlert(para) {
    document
      .querySelector(`#${para.id}-message`)
      .parentElement.classList.add("active");

    isValid = false;
  }

  // 如表單不符合規定，retrun 停止
  if (!isValid) {
    console.log("表單有誤停止送出");
    return;
  }

  const obj = {
    id: data.length,
    name: form.name.value,
    imgUrl: form.imgUrl.value,
    area: form.area.value,
    description: form.description.value,
    group: parseInt(form.group.value),
    price: parseInt(form.price.value),
    rate: parseInt(form.rate.value),
  };

  data.push(obj);
  renderCards(data);
  renderResultText(data);
  renderC3(data);
  addTicketForm.reset();
}

// 如警語為顯示狀態，在輸入後隱藏警語
checkForm();
function checkForm() {
  const inputs = document.querySelectorAll(".addTicket-form input");
  const textarea = document.querySelector(".addTicket-form textarea");
  const select = document.querySelector(".addTicket-form select");
  const formEls = [...inputs, textarea, select];

  formEls.forEach((el) => {
    el.addEventListener("change", () => {
      document
        .querySelector(`#${el.id}-message`)
        .parentElement.classList.remove("active");
    });
  });
}
