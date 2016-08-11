import xs from 'xstream';
import {makeDOMDriver, div} from '@cycle/dom';


function model(actions) {
    return xs
        .combine(actions.coords$, actions.active$)
        .filter(([coords, active]) => active)
        .map(([coords]) => coords);
}

function view(state$) {
    return state$
        .map(({x, y}) => {
            return div('.chart', [
                div([x, y].toString()),
                div('.cursor', {
                    style: {
                        transform: `translate3d(${x}px, ${y}px, 0)`
                    }
                })
            ])
        })
}

function intent(domSource) {
    const activate$ = domSource
        .select('.chart')
        .events('mousedown')
        .map(ev => true);

    const deactivate$ = domSource
        .select('.chart')
        .events('mouseup')
        .map(ev => false);

    return {
        coords$: domSource
            .select('.chart')
            .events('mousemove')
            .map(ev => ({ x: ev.offsetX, y: ev.offsetY })),
        active$: xs.merge(activate$, deactivate$)
    }
}

export function Chart(sources) {
    const domActions = intent(sources.DOM);

    const actions = {
        coords$: xs
            .merge(domActions.coords$, sources.props.coords)
            .startWith({ x: 0, y: 0 }),
        active$: xs
            .merge(domActions.active$, sources.props.active)
            .startWith(true)
    };

    return { DOM: view(model(actions)) }
}