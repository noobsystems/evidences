/* Used for the dui */
// Source: https://github.com/citizenfx/fivem/pull/2195#issuecomment-1712832684
window.addEventListener("load", (_) => {
    window.addEventListener("keydown", (event) => {
        if (event.ctrlKey) return;

        fetch(`https://${GetParentResourceName()}/keydown`, {
            method: "post",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({ key: event.key })
        });
    }, false);

    window.addEventListener("paste", (event) => {
        const clipboardData = event.clipboardData.getData("Text");
        if (!clipboardData) return;

        fetch(`https://${GetParentResourceName()}/paste`, {
            method: "post",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({ clipboard: clipboardData })
        });
    }, false);
});