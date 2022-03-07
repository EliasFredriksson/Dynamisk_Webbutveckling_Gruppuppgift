let searchBar = document.getElementById("search-bar");
let searchIcon = document.getElementById("search-icon");

if (searchBar.value.length <= 0) searchIcon.style.display = "flex";

searchBar.addEventListener("input", () => {
    if (searchBar.value.length <= 0) searchIcon.style.display = "flex";
    else searchIcon.style.display = "none";
});

searchBar.addEventListener("focusin", () => {
    searchIcon.style.display = "none";
});
searchBar.addEventListener("focusout", () => {
    if (searchBar.value.length <= 0) searchIcon.style.display = "flex";
    else searchIcon.style.display = "none";
});
