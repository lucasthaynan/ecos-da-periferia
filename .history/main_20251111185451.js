

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("div.menu .btn");
  const sections = document.querySelectorAll("section");

  buttons.forEach(btn => {
    btn.addEventListener("click", e => {
      // remove 'active' de todos os botões
      buttons.forEach(b => b.classList.remove("active"));

      // esconde todas as seções
      sections.forEach(s => s.style.display = "none");

      // botão clicado
      const el = e.currentTarget;
      el.classList.add("active");

      // nome da seção correspondente (classe igual à do botão)
      const classe = [...el.classList].find(c =>
        ["catalago", "sobre", "inscricao", "mapa"].includes(c)
      );

      // mostra a seção correspondente
      const sectionToShow = document.querySelector(`section.${classe}`);
      if (sectionToShow) {
        sectionToShow.style.display = "flex";
      }
    });
  });

  // Mostra a seção "catalogo" por padrão ao carregar
  const defaultSection = document.querySelector("section.catalago");
  const defaultButton = document.querySelector("div.menu .btn.catalago");
  if (defaultSection) defaultSection.style.display = "flex";
  if (defaultButton) defaultButton.classList.add("active");
});

