window.addEventListener("message", (event) => {
    if (!event.data || !event.data.action) return;

    // https://github.com/project-error/npwd/blob/d8dc5b7f47faf5fc581ffee30f31ff61d184cfe7/phone/src/os/phone/hooks/useClipboard.ts
    if (event.data.action == "copyToClipboard") {
        const value = event.data.value;

        const input = document.createElement("input");
        input.value = value;
        document.body.appendChild(input)
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input)
    }
});