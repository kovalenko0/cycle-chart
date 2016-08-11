import xs from 'xstream';
import {run} from '@cycle/xstream-run';
import isolate from '@cycle/isolate';
import {makeDOMDriver, div, input} from '@cycle/dom';
import {Chart} from './components/chart';

function main(sources) {
    const x$ = sources
        .DOM
        .select('.x')
        .events('change')
        .map(ev => ev.target.value);

    const y$ = sources
        .DOM
        .select('.y')
        .events('change')
        .map(ev => ev.target.value);
    
    const active$ = sources
        .DOM
        .select('.active')
        .events('click')
        .map(ev => ev.target.checked);

    const coords$ = xs
        .combine(x$, y$)
        .map(([x, y]) => ({x, y}))

    const mainChartSources = {
        DOM: sources.DOM,
        props: {
            coords: coords$.startWith({ x: 50, y: 50 }),
            active: active$.startWith(false)
        }
    };
    const mainChart = isolate(Chart, 'MainChart')(mainChartSources);
    const mainChartDom$ = mainChart.DOM;

    const vdom$ = mainChartDom$.map(mainChartDom => {
        return div('.app', [
                mainChartDom,
                input('.x', {attrs: {type: 'number'}}),
                input('.y', {attrs: {type: 'number'}}),
                input('.active', {attrs: {type: 'checkbox'}}), 'Activate'
            ])
    })

    return {
        DOM: vdom$
    };
}

const drivers = {
    DOM: makeDOMDriver('#app')
};

run(main, drivers);