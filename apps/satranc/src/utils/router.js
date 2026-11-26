/**
 * router.js — Hash tabanlı, kütüphanesiz yönlendirici.
 *
 * Adres çubuğunda "#/play" gibi bir hash tutar. Sunucu yapılandırması
 * gerektirmediği için dosya sisteminden (file://) bile çalışır; bu, çevrimdışı
 * kullanım ve akıllı tahtaya USB ile kopyalama senaryoları için önemlidir.
 *
 * Parametre desteği: "#/pieces?tas=knight&asama=3" biçimi çalışır. Haftalık ders
 * programı, öğretmenin tek tıkla doğru alıştırmayı açabilmesi için bunu kullanır.
 */

const listeners = new Set();

/** Hash'i rota ve parametre olarak ayırır. */
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [path, query = ""] = raw.split("?");
  return { path: path || "home", query };
}

/** Adresteki geçerli rota adı (parametreler hariç). Boşsa ana sayfa. */
export function currentRoute() {
  return parseHash().path;
}

/**
 * Geçerli rotanın parametreleri.
 * @returns {URLSearchParams}
 */
export function routeParams() {
  return new URLSearchParams(parseHash().query);
}

/** Tek bir parametreyi okur; yoksa varsayılanı verir. */
export function routeParam(name, fallback = null) {
  const value = routeParams().get(name);
  return value === null ? fallback : value;
}

/** Tüm dinleyicileri geçerli rotayla uyarır. */
function notify() {
  const route = currentRoute();
  for (const listener of listeners) listener(route);
}

/**
 * Verilen rotaya gider.
 *
 * Aynı rotaya tekrar gidildiğinde tarayıcı `hashchange` olayını TETİKLEMEZ.
 * Bu durumda menüye basan çocuk için hiçbir şey olmamış gibi görünürdü
 * (örneğin bir mini oyunun içindeyken "Mini Oyunlar"a basmak ekranı
 * tazelemezdi). Bu yüzden hash değişmiyorsa dinleyicileri elle çağırırız.
 *
 * @param {string} route "pieces" ya da "pieces?tas=knight" biçiminde.
 * @param {object} params İsteğe bağlı parametre nesnesi: { tas: "knight" }
 */
export function navigate(route, params = null) {
  let target = `#/${route}`;
  if (params && Object.keys(params).length > 0) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
    }
    const query = search.toString();
    if (query) target += (route.includes("?") ? "&" : "?") + query;
  }

  if (location.hash === target) {
    notify();
    return;
  }
  location.hash = target;
}

/**
 * Rota değişimlerini dinler.
 *
 * Olay dinleyicisi modül seviyesinde BİR KEZ bağlanır. (Daha önce her
 * onRouteChange çağrısında yeni bir hashchange dinleyicisi ekleniyordu ve her
 * biri tüm geri çağrıları geziyordu; ikinci bir abone her rota değişiminde
 * ekranı iki kez çizdirirdi.)
 */
export function onRouteChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// `window` kontrolü, modülün tarayıcı dışında (test ve doğrulama araçlarında)
// da import edilebilmesini sağlar.
if (typeof window !== "undefined") {
  window.addEventListener("hashchange", notify);
}
