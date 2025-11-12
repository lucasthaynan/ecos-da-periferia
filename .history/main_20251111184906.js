

document.querySelectorAll("div.menu .btn").forEach(btn => {
    btn.addEventListener("click", e => {

        // Remove 'active' de todos os botões
        document.querySelectorAll("div.menu .btn").forEach(b => {
            b.classList.remove("active");
        });

        const el = e.currentTarget; 

        // Se o botão tiver a classe 'sobre'
        if (el.classList.contains("sobre")) {
            el.classList.add("active"); 
        } 
    });
});
