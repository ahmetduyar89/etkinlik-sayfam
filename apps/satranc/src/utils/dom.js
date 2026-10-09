export function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(options).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "className") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value;
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else node.setAttribute(key, value);
  });
  children.filter(Boolean).forEach((child) => {
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  });
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function percent(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}

export function safeId(value) {
  // Türkçe küçültme önce yapılır; düz toLowerCase() "İ" harfini "i" + birleşen
  // noktaya çevirir ve "İtalyan" kimliği "i-talyan" gibi bozuk çıkardı.
  return value.toLocaleLowerCase("tr").replaceAll("ı", "i").replaceAll("ğ", "g").replaceAll("ü", "u")
    .replaceAll("ş", "s").replaceAll("ö", "o").replaceAll("ç", "c").replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
