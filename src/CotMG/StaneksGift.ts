import { Fragment, FragmentById } from "./Fragment";
import { ActiveFragment } from "./ActiveFragment";
import { FragmentType } from "./FragmentType";
import { IStaneksGift } from "./IStaneksGift";
import { IPlayer } from "../PersonObjects/IPlayer";
import { Factions } from "../Faction/Factions";
import { CalculateEffect } from "./formulas/effect";
import { CalculateCharge } from "./formulas/charge";
import {
    Generic_fromJSON,
    Generic_toJSON,
    Reviver,
} from "../../utils/JSONReviver";


export class StaneksGift implements IStaneksGift {
    fragments: ActiveFragment[] = [];

    width(): number {
        return 7;
    }
    height(): number {
        return 6;
    }

    charge(worldX: number, worldY: number, ram: number): number {
        const af = this.fragmentAt(worldX, worldY);
        if(af === null) return 0;

        // Find all the neighbooring cells
        let cells = af.neighboors();

        // find the neighbooring active fragments.
        let maybeFragments = cells.map(n => this.fragmentAt(n[0], n[1]));

        // Filter out nulls with typescript "Type guard". Whatever
        let neighboors = maybeFragments.filter((v: ActiveFragment | null): v is ActiveFragment => !!v );

        // filter unique fragments
        neighboors = neighboors.filter((value, index) => neighboors.indexOf(value) === index);

        // count number of neighbooring boosts and cooling.
        let boost = 1;
        let cool = 1;
        for(const neighboor of neighboors) {
            const f = neighboor.fragment();
            if(f.type === FragmentType.Cooling) cool *= 1+(f.power/1000);
            if(f.type === FragmentType.Booster) boost *= 1+(f.power/1000);
        }

        const [extraCharge, extraHeat] = CalculateCharge(ram, af.heat, boost, cool);
        af.charge += extraCharge;
        af.heat += extraHeat;

        Factions["Church of the Machine God"].playerReputation += extraCharge;

        return ram;
    }

    process(p: IPlayer, numCycles: number): void {
        for(const activeFragment of this.fragments) {
            const fragment = activeFragment.fragment();

            // Boosters and cooling don't deal with heat.
            if(fragment.type === FragmentType.Booster ||
                fragment.type === FragmentType.Cooling) continue;
            activeFragment.heat *= 0.98;
            activeFragment.heat -= 1;
            if(activeFragment.heat < 1) activeFragment.heat = 1;
        }

        this.updateMults(p);
    }

    canPlace(x: number, y: number, fragment: Fragment): boolean {
        if(x + fragment.width() > this.width()) return false;
        if(y + fragment.height() > this.height()) return false;
        if(this.count(fragment) >= fragment.limit) return false;
        const newFrag = new ActiveFragment({x: x, y: y, fragment: fragment});
        for(const aFrag of this.fragments) {
            if(aFrag.collide(newFrag)) return false;
        }
        return true;
    }

    place(x: number, y: number, fragment: Fragment): boolean {
        if(!this.canPlace(x, y, fragment)) return false;
        this.fragments.push(new ActiveFragment({x: x, y: y, fragment: fragment}));
        return true;
    }

    fragmentAt(worldX: number, worldY: number): ActiveFragment | null {
        for(const aFrag of this.fragments) {
            if(aFrag.fullAt(worldX, worldY)) {
                return aFrag;
            }
        }

        return null;
    }

    count(fragment: Fragment): number {
        let amt = 0;
        for(const aFrag of this.fragments) {
            if(aFrag.fragment().id === fragment.id) amt++;
        }
        return amt;
    }

    deleteAt(worldX: number, worldY: number): boolean {
        for(let i = 0; i < this.fragments.length; i++) {
            if(this.fragments[i].fullAt(worldX, worldY)) {
                this.fragments.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    clear(): void {
        this.fragments = [];
    }

    updateMults(p: IPlayer): void {
        p.reapplyAllAugmentations(true);
        p.reapplyAllSourceFiles();

        for(const aFrag of this.fragments) {
            const fragment = aFrag.fragment();
            const power = CalculateEffect(aFrag.charge, fragment.power)
            switch (fragment.type) {
            case FragmentType.HackingChance:
                p.hacking_chance_mult *= power; break;
            case FragmentType.HackingSpeed:
                p.hacking_speed_mult *= power; break;
            case FragmentType.HackingMoney:
                p.hacking_money_mult *= power; break;
            case FragmentType.HackingGrow:
                p.hacking_grow_mult *= power; break;
            case FragmentType.Hacking:
                p.hacking_mult *= power;
                p.hacking_exp_mult *= power; break;
            case FragmentType.Strength:
                p.strength_mult *= power;
                p.strength_exp_mult *= power; break;
            case FragmentType.Defense:
                p.defense_mult *= power;
                p.defense_exp_mult *= power; break;
            case FragmentType.Dexterity:
                p.dexterity_mult *= power;
                p.dexterity_exp_mult *= power; break;
            case FragmentType.Agility:
                p.agility_mult *= power;
                p.agility_exp_mult *= power; break;
            case FragmentType.Charisma:
                p.charisma_mult *= power;
                p.charisma_exp_mult *= power; break;
            case FragmentType.HacknetMoney:
                p.hacknet_node_money_mult *= power; break;
            case FragmentType.HacknetCost:
                p.hacknet_node_purchase_cost_mult *= power;
                p.hacknet_node_ram_cost_mult *= power;
                p.hacknet_node_core_cost_mult *= power;
                p.hacknet_node_level_cost_mult *= power; break;
            case FragmentType.Rep:
                p.company_rep_mult *= power;
                p.faction_rep_mult *= power; break;
            case FragmentType.WorkMoney:
                p.work_money_mult *= power; break;
            case FragmentType.Crime:
                p.crime_success_mult *= power;
                p.crime_money_mult *= power; break;
            case FragmentType.Bladeburner:
                p.bladeburner_max_stamina_mult *= power;
                p.bladeburner_stamina_gain_mult *= power;
                p.bladeburner_analysis_mult *= power;
                p.bladeburner_success_chance_mult *= power; break;
            }
        }
    }
    
    /**
     * Serialize Staneks Gift to a JSON save state.
     */
    toJSON(): any {
        return Generic_toJSON("StaneksGift", this);
    }

    /**
     * Initializes Staneks Gift from a JSON save state
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static fromJSON(value: any): StaneksGift {
        return Generic_fromJSON(StaneksGift, value.data);
    }
}

Reviver.constructors.StaneksGift = StaneksGift;