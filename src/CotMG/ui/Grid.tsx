import * as React from "react";
import {
    Fragment,
    Fragments,
    NoneFragment,
} from "../Fragment";
import { ActiveFragment } from "../ActiveFragment";
import { FragmentType } from "../FragmentType";
import { IStaneksGift } from "../IStaneksGift";
import { StdButton } from "../../ui/React/StdButton";
import { Cell } from "./Cell";
import { FragmentInspector } from "./FragmentInspector";
import { FragmentSelector } from "./FragmentSelector";

function zeros(dimensions: number[]): any {
    const array = [];

    for (let i = 0; i < dimensions[0]; ++i) {
        array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
    }

    return array;
}


function randomColor(fragment: ActiveFragment): string {
   // Can't set Math.random seed so copy casino. TODO refactor both RNG later.
    let s1 = Math.pow((fragment.x+1)*(fragment.y+1), 10);
    let s2 = s1;
    let s3 = s1;

    let colors = [];
    for(let i = 0; i < 3; i++) {
        s1 = (171 * s1) % 30269;
        s2 = (172 * s2) % 30307;
        s3 = (170 * s3) % 30323;
        colors.push((s1/30269.0 + s2/30307.0 + s3/30323.0)%1.0);
    }

    return `rgb(${colors[0]*256}, ${colors[1]*256}, ${colors[2]*256})`;
}

type GridProps = {
    gift: IStaneksGift;
}

export function Grid(props: GridProps) {
    function calculateGrid(gift: IStaneksGift): any {
        const newgrid = zeros([gift.width(), gift.height()]);
        for(let i = 0; i < gift.width(); i++) {
            for(let j = 0; j < gift.height(); j++) {
                const fragment = gift.fragmentAt(i, j);
                if(fragment === null) continue;
                newgrid[i][j] = 1;
            }
        }

        return newgrid;
    }

    const [grid, setGrid] = React.useState(calculateGrid(props.gift));
    const [ghostGrid, setGhostGrid] = React.useState(zeros([props.gift.width(), props.gift.height()]));
    const [pos, setPos] = React.useState([0, 0]);
    const [selectedFragment, setSelectedFragment] = React.useState(NoneFragment);

    function moveGhost(worldX: number, worldY: number) {
        const newgrid = zeros([props.gift.width(), props.gift.height()]);
        for(let i = 0; i < selectedFragment.shape.length; i++) {
            for(let j = 0; j < selectedFragment.shape[i].length; j++) {
                if(worldX+i > newgrid.length-1) continue;
                if(worldY+j > newgrid[worldX+i].length-1) continue;
                if(!selectedFragment.shape[i][j]) continue;
                if(worldX+j > newgrid.length-1) continue;
                if(worldY+i > newgrid[worldX+j].length-1) continue;
                newgrid[worldX+j][worldY+i] = 1;

            }
        }

        setGhostGrid(newgrid);
        setPos([worldX, worldY]);
    }

    function deleteAt(worldX: number, worldY: number) {
        const success = props.gift.deleteAt(worldX, worldY);
    }

    function clickAt(worldX: number, worldY: number) {
        if(selectedFragment.type == FragmentType.None) return;
        if(selectedFragment.type == FragmentType.Delete) {
            deleteAt(worldX, worldY);
        } else {
            if(!props.gift.canPlace(worldX, worldY, selectedFragment)) return;
            props.gift.place(worldX, worldY, selectedFragment);
        }
        setGrid(calculateGrid(props.gift));
    }

    function color(worldX: number, worldY: number): string {
        if(ghostGrid[worldX][worldY] && grid[worldX][worldY]) return "red";
        if(ghostGrid[worldX][worldY]) return "white";
        if(grid[worldX][worldY]) {
            const fragment = props.gift.fragmentAt(worldX, worldY);
            if(fragment === null) throw "ActiveFragment should not be null";
            return randomColor(fragment);
        }
        return "";
    }

    function clear() {
        props.gift.clear();
        setGrid(zeros([props.gift.width(), props.gift.height()]));
    }

    // switch the width/length to make axis consistent.
    const elems = [];
    for(let j = 0; j < props.gift.height(); j++) {
        const cells = [];
        for(let i = 0; i < props.gift.width(); i++) {
            cells.push(<Cell
                key={i}
                onMouseEnter={() => moveGhost(i, j)}
                onClick={()=>clickAt(i, j)}
                color={color(i, j)}
            />);
        }
        elems.push(<div key={j} className="staneksgift_row">
            {...cells}
        </div>)
    }

    function updateSelectedFragment(fragment: Fragment) {
        setSelectedFragment(fragment);
        const newgrid = zeros([props.gift.width(), props.gift.height()]);
        setGhostGrid(newgrid);
    }

    return (<div>
        <FragmentSelector gift={props.gift} selectFragment={updateSelectedFragment} />
        <StdButton onClick={clear} text="Clear" />
        <div style={{float: 'left'}}>
            {...elems}
        </div>
        <div>
            <FragmentInspector fragment={props.gift.fragmentAt(pos[0], pos[1])}/>
        </div>
    </div>)
}
