

document.querySelectorAll("div.menu .btn").forEach(btn => {
    btn.addEventListener("click", e => {
        const el = e.currentTarget; // o botão clicado
        if (el.classList.contains("sobre")) {
            console.log("Este botão contém a classe 'sobre'");
        } else {
            console.log("Este botão NÃO contém a classe 'sobre'");
        }
    });
});
