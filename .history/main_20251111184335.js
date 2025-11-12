

document.querySelectorAll("div.menu .btn").forEach(btn => {
    console.log(btn);
    btn.addEventListener("click", e => {
        const el = e.currentTarget; // o botão clicado
        const classes = el.classList;
        console.log(classes[classes.length - 1]); // última classe
    });
});
