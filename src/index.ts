import * as m from "mithril";

import {id, key} from "lens";
import {Store} from "store";


interface CounterState {
    readonly count: number;
}

interface NameState {
    readonly name: string;
}

interface State {
    readonly counter: CounterState;
    readonly name: NameState;
}

const stateKey = key<State>();
const countLens = stateKey("counter").thenKey("count");
const nameLens = stateKey("name").thenKey("name");

const increment = countLens.modify((count) => count + 1);


const store = new Store<State>({
    counter: {count: 0},
    name: {name: ""},
}, m.redraw);

console.log(store.getState());
store.modify(nameLens.set("harry"));
store.modify(increment);
store.modify(increment);
store.modify(increment);
console.log(store.getState());

const foo = nameLens.get;
console.log(foo(store.getState()));



function connectComponent<
    StoreState,
    Props,
    Actions,
    Attrs extends {store: Store<StoreState>},
    State extends m.Lifecycle<Attrs, State> & {props: Props, actions: Actions}
>(
    calcProps: (state: StoreState) => Props,
    calcActions: (store: Store<StoreState>) => Actions,
    component: m.Component<Attrs, State>,
): m.Component<Attrs, State> {
    return {...component,
        oninit(vnode) {
            this.props = calcProps(vnode.attrs.store.getState());
            this.actions = calcActions(vnode.attrs.store);
            if (component.oninit) {
                component.oninit.bind(this)(vnode);
            }
        },
        onbeforeupdate(vnode, old) {
            let result: false | undefined = false;
            const newProps = calcProps(vnode.attrs.store.getState());
            if (this.props !== newProps) {
                this.props = newProps;
                result = undefined;
            }
            if (component.onbeforeupdate) {
                result = component.onbeforeupdate.bind(this)(vnode, old);
            }
            return result;
        },
    };
}



const Dummy: m.Component<{}, {}> = {
    view() {
        console.log("dummy");
        return "dummy";
    },
    onbeforeupdate(vnode, old) {
        return undefined;
    },
};


const CountButton = connectComponent(
    (state: State) => state.counter,
    (store) => ({
        increment: () => store.modify(increment),
    }),
    {
        view(vnode) {
            console.log("view");
            return [
                m("button", {
                    onclick: () => {
                        console.log("click");
                    },
                }, "bleh"),
                m("button", {
                    onclick: () => {
                        this.actions.increment();
                    },
                }, this.props.count + " clicks"),
                m(Dummy),
            ];
        },
    },
);


const Hello: m.Component<{}, {}> = {
    view(vnode) {
        return m("main", [
            m("h1", {class: "title"}, "My first app"),
            m(CountButton, {store}),
        ]);
    },
};


const root = document.getElementById("root");
if (!root) {
    throw new Error("root element missing");
}

m.mount(root, Hello);
