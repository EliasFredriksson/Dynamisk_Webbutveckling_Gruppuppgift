window.onload = () => {
    let comments = document.getElementsByClassName("comment");

    if (document.cookie.indexOf("token") != -1) {
        for (let index = 0; index < comments.length; index++) {
            const tag = comments[index];

            const editButton = tag.children[1].children[0].children[1];
            const finishButton = tag.children[1].children[0].children[2];
            const textarea = tag.children[1].children[0].children[0];

            if (!editButton || !finishButton || !textarea) continue;

            editButton.addEventListener("click", () => {
                editButton.style.display = "none";
                finishButton.style.display = "block";
                textarea.disabled = false;
            });

            finishButton.addEventListener("click", () => {
                let commentId = editButton.getAttribute("data-commentId");
                let newText = textarea.value;
                doCommentEditFetch(commentId, newText);
                editButton.style.display = "block";
                finishButton.style.display = "none";
                textarea.disabled = true;
            });
        }
    }
};

function doCommentEditFetch(commentId, newText) {
    fetch(window.location.href + "/comments/edit/" + commentId, {
        method: "POST",
        body: JSON.stringify({
            text: newText,
        }),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (response.ok) {
                window.location.reload();
            } else {
                alert("ERROR: ", response.status);
            }
        })
        .catch((error) => {
            console.log("FRONT JS ERROR: ", error);
        });
}
