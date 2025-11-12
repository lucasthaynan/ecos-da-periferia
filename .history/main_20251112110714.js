document.querySelectorAll("div.menu .btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    // Remove 'active' de todos os botões
    document
      .querySelectorAll("div.menu .btn")
      .forEach((b) => b.classList.remove("active"));

    // Esconde todas as seções
    document
      .querySelectorAll("section")
      .forEach((s) => (s.style.display = "none"));

    // Botão clicado
    const el = e.currentTarget;
    el.classList.add("active");

    // Mostra apenas a seção correspondente à classe do botão
    if (el.classList.contains("catalogo")) {
      document.querySelector("section.catalogo").style.display = "flex";
    }
    if (el.classList.contains("sobre")) {
      document.querySelector("section.sobre").style.display = "flex";
    }
    if (el.classList.contains("inscricao")) {
      document.querySelector("section.inscricao").style.display = "flex";
    }
    if (el.classList.contains("mapa")) {
      document.querySelector("section.mapa").style.display = "flex";
    }
  });
});


document.querySelector("body > div > div > div.btn-close").addEventListener("click", e => {
    document.querySelector("div.popuo").style.display = "none";
})
