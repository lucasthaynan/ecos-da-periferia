

document.querySelectorAll("div.menu .btn").forEach(btn => {
    btn.addEventListener("click", e => {

        // Remove 'active' de todos os botões
        document.querySelectorAll("div.menu .btn").forEach(b => {
            b.classList.remove("active");
        });

        // Adiciona 'active' apenas ao botão clicado
        const el = e.currentTarget;
        el.classList.add("active");
    });
});
