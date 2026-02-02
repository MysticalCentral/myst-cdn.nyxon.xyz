function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

$(document).ready(function() {
    let apiUrl = `https://api.github.com/repos/MysticalCentral/myst-cdn.nyxon.xyz/contents/${apiPath}`;
    $.get(apiUrl, function(data) {
        let items = data.filter(item => {
            if (apiPath === "") {
                return item.name !== "index.html" && item.name !== "CNAME" && item.name !== ".github" && item.name !== "style.css" && item.name !== "script.js";
            } else {
                return item.name !== "index.html" && item.name !== "style.css";
            }
        });
        let promises = items.map(item => {
            if (item.type === "file") {
                return Promise.resolve({item, count: null});
            } else {
                let subApiUrl = `https://api.github.com/repos/MysticalCentral/myst-cdn.nyxon.xyz/contents/${apiPath}${item.name}/`;
                return $.get(subApiUrl).then(subdata => {
                    let count = subdata.filter(sub => sub.name !== "index.html" && sub.name !== "style.css" && sub.type === "file").length;
                    return {item, count};
                });
            }
        });
        Promise.all(promises).then(results => {
            if (apiPath !== "") {
                $("#list").append(`<a class="item" href="../index.html"><div class="left"><div class="icon">⬅️</div><span>Previous Directory</span></div><div class="size"></div></a>`);
            }
            results.forEach(({item, count}) => {
                let href = item.type === "file" ? item.name : `${item.name}/index.html`;
                let icon = item.type === "file" ? "📄" : "📁";
                let right = item.type === "file" ? formatSize(item.size) : `${count} files`;
                $("#list").append(`<a class="item" href="${href}"><div class="left"><div class="icon">${icon}</div><span>${item.name}</span></div><div class="size">${right}</div></a>`);
            });
        });
    });
});
