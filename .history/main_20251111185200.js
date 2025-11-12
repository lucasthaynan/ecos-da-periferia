

document.querySelectorAll("div.menu .btn").forEach(btn => {
    btn.addEventListener("click", e => {

        // Remove 'active' de todos os botões
        document.querySelectorAll("div.menu .btn").forEach(b => {
            b.classList.remove("active");
        });


        const el = e.currentTarget; 

        // Se o botão tiver a classe 'sobre'
        if (el.classList.contains("catalago")) {
            el.classList.add("active"); 
            document.querySelector("section.catalago").style.display = "flex";
        } else {
            document.querySelectorAll("section").forEach(s => {
                s.style.display = "none";
            });
        }
        if (el.classList.contains("sobre")) {
            el.classList.add("active"); 
            document.querySelector("section.sobre").style.display = "flex";
        } else {
            document.querySelectorAll("section").forEach(s => {
                s.style.display = "none";
            });
        }
        if (el.classList.contains("inscricao")) {
            el.classList.add("active"); 
            document.querySelector("section.inscricao").style.display = "flex";
        } else {
            document.querySelectorAll("section").forEach(s => {
                s.style.display = "none";
            });
        }
        if (el.classList.contains("mapa")) {
            el.classList.add("active"); 
            document.querySelector("section.mapa").style.display = "flex";
        } 
        else {
            document.querySelectorAll("section").forEach(s => {
                s.style.display = "none";
            });
        }
    });
});
