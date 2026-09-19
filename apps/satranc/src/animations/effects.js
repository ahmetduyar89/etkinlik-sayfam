export function burst(anchor) {
  const rect = anchor.getBoundingClientRect();
  for (let index = 0; index < 14; index += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.left = `${rect.left + rect.width / 2}px`;
    particle.style.top = `${rect.top + rect.height / 2}px`;
    particle.style.setProperty("--angle", `${(index / 14) * 360}deg`);
    document.body.append(particle);
    particle.addEventListener("animationend", () => particle.remove());
  }
}

export function reveal(node) {
  node.classList.remove("page-enter");
  requestAnimationFrame(() => node.classList.add("page-enter"));
}
