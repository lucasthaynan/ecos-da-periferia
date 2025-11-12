

document.querySelectorAll("div.menu .btn").forEach(btn => {
    console.log(btn)
    btn.addEventListener("click", e => {
        console.log(e.classList[-1])
    })
        
})