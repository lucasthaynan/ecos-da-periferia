document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("div.menu .btn");
  const sections = document.querySelectorAll("section");

  buttons.forEach(btn => {
    btn.addEventListener("click", e => {
      // remove 'active' de todos os botões
      buttons.forEach(b => b.classList.remove("active"));

      const el = e.currentTarget;
      el.classList.add("active");

      // identifica qual seção mostrar
      const classe = [...el.classList].find(c =>
        ["catalago", "sobre", "inscricao", "mapa"].includes(c)
      );

      // mostra apenas a seção correspondente
      sections.forEach(s => {
        if (s.classList.contains(classe)) {
          s.style.display = "flex";
        } else {
          s.style.display = "none";
        }
      });
    });
  });

  // mostra "catalogo" por padrão ao carregar
  const defaultSection = document.querySelector("section.catalago");
  const defaultButton = document.querySelector("div.menu .btn.catalago");
  if (defaultSection) defaultSection.style.display = "flex";
  if (defaultButton) defaultButton.classList.add("active");
});
