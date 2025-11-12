

document.querySelectorAll("div.menu .btn").forEach(btn => {
    btn.addEventListener("click", e => {

        // Remove 'active' de todos os botões
        document.querySelectorAll("div.menu .btn").forEach(b => {
            b.classList.remove("active");
        });

        e.classList.add("active"); // adiciona active ao botão clicado

        const el = e.currentTarget; // o botão clicado

        // Se o botão tiver a classe 'sobre'
        if (el.classList.contains("sobre")) {
            
        } else {
            console.log("Este botão NÃO contém a classe 'sobre'");
        }
    });
});
