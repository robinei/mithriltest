import * as m from "mithril";

let count = 0;

const Hello = {
    view() {
        return m("main", [
            m("h1", {class: "title"}, "My first app"),
            m("button", {
                onclick() {
                    count++;
                },
            }, count + " clicks"),
        ]);
    },
};

const root = document.getElementById("root");
if (!root) {
    throw new Error("root element missing");
}

m.mount(root, Hello);
