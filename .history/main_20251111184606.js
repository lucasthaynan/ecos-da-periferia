

document.querySelectorAll("div.menu .btn").forEach(btn => {
    btn.classList.remove("active")
    btn.addEventListener("click", e => {
        const el = e.currentTarget; // o botão clicado
        if (el.classList.contains("sobre")) {
            
        } else {
            console.log("Este botão NÃO contém a classe 'sobre'");
        }
    });
});
