window.onload = () => {
    let searchBar = document.getElementById("search-bar");
    let searchIcon = document.getElementById("search-icon");
    searchBar.addEventListener("focusin", () => {
        searchIcon.style.display = "none";
    });
    searchBar.addEventListener("focusout", () => {
        searchIcon.style.display = "flex";
    });
};
