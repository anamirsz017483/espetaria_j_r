const WHATSAPP_NUMBER = "5515991198592"

const products = [
  { id: 1, name: "Carne", price: 10, image: "assets/items/carne.svg" },
  { id: 2, name: "Tulipa", price: 10, image: "assets/items/tulipa.svg" },
  { id: 3, name: "Frango com bacon", price: 10, image: "assets/items/frango-com-bacon.svg" },
  { id: 4, name: "Kafta", price: 10, image: "assets/items/kafta.svg" },
  { id: 5, name: "Kafta de costela recheada", price: 10, image: "assets/items/kafta-de-costela-recheada.svg" },
  { id: 6, name: "Panceta", price: 10, image: "assets/items/panceta.svg" },
  { id: 7, name: "Romeu e Julieta", price: 10, image: "assets/items/romeu-e-julieta.svg" },
  { id: 8, name: "Pão de alho", price: 10, image: "assets/items/pao-de-alho.svg" },
  { id: 9, name: "Queijo", price: 10, image: "assets/items/queijo.svg" },
  { id: 10, name: "Misto", price: 10, image: "assets/items/misto.svg" },
  { id: 11, name: "Linguiça", price: 10, image: "assets/items/linguica.svg" },
  { id: 12, name: "Linguiça apimentada", price: 10, image: "assets/items/linguica-apimentada.svg" },
  { id: 13, name: "Filé de frango", price: 10, image: "assets/items/file-de-frango.svg" },
  { id: 14, name: "Costela", price: 10, image: "assets/items/costela.svg" },
  { id: 15, name: "Coração", price: 10, image: "assets/items/coracao.svg" }
];

const state = {
  account: loadAccount(),
  session: loadSession(),
  cart: loadCart(),
  authMode: "register"
};

const $ = (selector) => document.querySelector(selector);

function money(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function saveAccount(account) {
  localStorage.setItem("jr_account", JSON.stringify(account));
}

function loadAccount() {
  try {
    return JSON.parse(localStorage.getItem("jr_account"));
  } catch {
    return null;
  }
}

function saveSession(user) {
  localStorage.setItem("jr_session", JSON.stringify(user));
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem("jr_session"));
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem("jr_session");
}

function saveCart() {
  localStorage.setItem("jr_cart", JSON.stringify([...state.cart.entries()]));
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("jr_cart"));
    return new Map(saved || []);
  } catch {
    return new Map();
  }
}

function totalItems() {
  return [...state.cart.values()].reduce((sum, qty) => sum + qty, 0);
}

function totalPrice() {
  return totalItems() * 10;
}

function showApp() {
  $("#cover").classList.add("hidden");
  $("#app").classList.remove("hidden");
}

function showCover() {
  $("#app").classList.add("hidden");
  $("#cover").classList.remove("hidden");
}

function setAuthMode(mode) {
  state.authMode = mode;

  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.mode === mode);
  });

  $("#registerFields").classList.toggle("hidden", mode !== "register");
  $("#loginFields").classList.toggle("hidden", mode !== "login");

  $("#authSubmit").textContent =
    mode === "register" ? "Criar cadastro e continuar" : "Entrar e continuar";

  $("#authHint").textContent =
    mode === "register"
      ? "Os dados ficam salvos apenas neste aparelho."
      : "Entre com o WhatsApp/e-mail e a senha cadastrada.";
}

function renderProducts() {
  const root = $("#products");

  root.innerHTML = products.map((product) => {
    const qty = state.cart.get(product.id) || 0;
    return `
      <article class="product-card">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy" />
        <div class="product-copy">
          <span class="pill">R$ 10,00</span>
          <h4>${product.name}</h4>
          <span class="price">${money(product.price)}</span>
          <small>Espeto individual, pronto para escolher.</small>
        </div>
        <div class="product-actions">
          <span class="qty">${qty}</span>
          <button class="btn btn-primary" data-add="${product.id}" type="button">Adicionar</button>
        </div>
      </article>
    `;
  }).join("");

  root.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => addProduct(Number(btn.dataset.add)));
  });
}

function renderCart() {
  const root = $("#cartList");
  const items = products.filter((p) => state.cart.has(p.id) && state.cart.get(p.id) > 0);

  if (!items.length) {
    root.innerHTML = `
      <div class="cart-item">
        <div>
          <strong>Carrinho vazio</strong>
          <small>Escolha seus espetos para montar o pedido.</small>
        </div>
      </div>
    `;
  } else {
    root.innerHTML = items.map((product) => {
      const qty = state.cart.get(product.id);
      return `
        <div class="cart-item">
          <div>
            <strong>${product.name}</strong>
            <small>${qty} x ${money(product.price)} = ${money(qty * product.price)}</small>
          </div>
          <div class="cart-actions">
            <button class="icon-btn" data-dec="${product.id}" type="button">−</button>
            <button class="icon-btn" data-inc="${product.id}" type="button">+</button>
          </div>
        </div>
      `;
    }).join("");

    root.querySelectorAll("[data-dec]").forEach((btn) => {
      btn.addEventListener("click", () => decreaseProduct(Number(btn.dataset.dec)));
    });
    root.querySelectorAll("[data-inc]").forEach((btn) => {
      btn.addEventListener("click", () => addProduct(Number(btn.dataset.inc)));
    });
  }

  $("#cartCount").textContent = totalItems();
  $("#totalPrice").textContent = totalPrice().toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function addProduct(id) {
  state.cart.set(id, (state.cart.get(id) || 0) + 1);
  saveCart();
  renderProducts();
  renderCart();
}

function decreaseProduct(id) {
  const current = state.cart.get(id) || 0;
  if (current <= 1) state.cart.delete(id);
  else state.cart.set(id, current - 1);
  saveCart();
  renderProducts();
  renderCart();
}

function clearOrder() {
  state.cart.clear();
  saveCart();
  renderProducts();
  renderCart();
  $("#notes").value = "";
}

function cancelOrder() {
  const confirmCancel = confirm("Tem certeza que deseja cancelar o pedido?");
  if (!confirmCancel) return;

  clearOrder();
  state.session = null;
  clearSession();
  showCover();
}

function getSelectedPayment() {
  return document.querySelector('input[name="payment"]:checked')?.value || "Débito";
}

function buildMessage() {
  const user = state.session || state.account;
  const items = products.filter((p) => state.cart.has(p.id) && state.cart.get(p.id) > 0);

  const lines = [
    "Olá, gostaria de fazer um pedido na Espetaria J&R.",
    "",
    `Cliente: ${user?.name || "Não informado"}`,
    `WhatsApp: ${user?.phone || "Não informado"}`,
    `E-mail: ${user?.email || "Não informado"}`,
    "",
    "Pedido:"
  ];

  items.forEach((product) => {
    const qty = state.cart.get(product.id);
    lines.push(`- ${qty}x ${product.name} (${money(qty * product.price)})`);
  });

  lines.push(
    "",
    `Forma de pagamento: ${getSelectedPayment()}`,
    `Total: ${money(totalPrice())}`
  );

  const notes = $("#notes").value.trim();
  if (notes) lines.push(`Observações: ${notes}`);

  return lines.join("\n");
}

function openWhatsApp() {
  if (!state.session) {
    alert("Faça o login/cadastro antes de enviar o pedido.");
    return;
  }

  if (!state.cart.size) {
    alert("Adicione pelo menos um espeto antes de enviar o pedido.");
    return;
  }

  const message = encodeURIComponent(buildMessage());
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
}

function loginOrRegister(event) {
  event.preventDefault();

  if (state.authMode === "register") {
    const account = {
      name: $("#name").value.trim(),
      phone: $("#customerPhone").value.trim(),
      email: $("#email").value.trim(),
      password: $("#password").value
    };

    if (!account.name || !account.phone || !account.email || !account.password) {
      alert("Preencha todos os campos do cadastro.");
      return;
    }

    state.account = account;
    saveAccount(account);
    state.session = account;
    saveSession(account);
    $("#userChip").textContent = `Olá, ${account.name}`;
    showApp();
    renderProducts();
    renderCart();
    return;
  }

  const loginId = normalize($("#loginId").value);
  const loginPassword = $("#loginPassword").value;

  if (!state.account) {
    alert("Nenhum cadastro encontrado. Crie sua conta primeiro.");
    return;
  }

  const matchesId = loginId === normalize(state.account.phone) || loginId === normalize(state.account.email);
  const matchesPassword = loginPassword === state.account.password;

  if (!matchesId || !matchesPassword) {
    alert("Dados de login incorretos.");
    return;
  }

  state.session = state.account;
  saveSession(state.account);
  $("#userChip").textContent = `Olá, ${state.account.name}`;
  showApp();
  renderProducts();
  renderCart();
}

function logout() {
  clearSession();
  state.session = null;
  clearOrder();
  showCover();
  setAuthMode("register");
}

function init() {
  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", () => setAuthMode(tab.dataset.mode));
  });

  $("#authForm").addEventListener("submit", loginOrRegister);
  $("#sendWhatsApp").addEventListener("click", openWhatsApp);
  $("#resetOrder").addEventListener("click", clearOrder);
  $("#cancelOrder").addEventListener("click", cancelOrder);
  $("#logoutBtn").addEventListener("click", logout);

  setAuthMode("register");

  if (state.session) {
    $("#userChip").textContent = `Olá, ${state.session.name}`;
    showApp();
  } else {
    showCover();
  }

  renderProducts();
  renderCart();
}

init();
