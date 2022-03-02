window.onload = () => {
    let searchBar = document.getElementById("search-bar");
    let searchIcon = document.getElementById("search-icon");

    if (searchBar.value.length <= 0) searchIcon.style.display = "flex";

    searchBar.addEventListener("input", () => {
        if (searchBar.value.length <= 0) searchIcon.style.display = "flex";
        else searchIcon.style.display = "none";
    });
};
