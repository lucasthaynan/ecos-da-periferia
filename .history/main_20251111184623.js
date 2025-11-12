

document.querySelectorAll("div.menu .btn").forEach(btn => {

    btn.addEventListener("click", e => {
        document.querySelectorAll("div.menu .btn").forEach(btn => {
            btn.classList.remove("active")
        });

        const el = e.currentTarget; // o botão clicado
        if (el.classList.contains("sobre")) {
            
        } else {
            console.log("Este botão NÃO contém a classe 'sobre'");
        }
    });
});
