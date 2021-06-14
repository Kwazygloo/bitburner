import { IMults } from "./data/upgrades";

export class GangMemberUpgrade {
    name: string;
    cost: number;
    type: string;
    desc: string;
    mults: IMults;

    constructor(name: string = "", cost: number = 0, type: string = "w", mults: IMults = {}) {
        this.name = name;
        this.cost = cost;
        //w = weapon, a = armor, v = vehicle, r = rootkit, g = Aug
        this.type = type;
        this.mults = mults;

        this.desc = this.createDescription();
    }

    getCost(gang: any) {
        return this.cost / gang.getDiscount();
    }

    createDescription(): string {
        const lines = ["Increases:"];
        if (this.mults.str != null) {
            lines.push(`* Strength by ${Math.round((this.mults.str - 1) * 100)}%`);
        }
        if (this.mults.def != null) {
            lines.push(`* Defense by ${Math.round((this.mults.def - 1) * 100)}%`);
        }
        if (this.mults.dex != null) {
            lines.push(`* Dexterity by ${Math.round((this.mults.dex - 1) * 100)}%`);
        }
        if (this.mults.agi != null) {
            lines.push(`* Agility by ${Math.round((this.mults.agi - 1) * 100)}%`);
        }
        if (this.mults.cha != null) {
            lines.push(`* Charisma by ${Math.round((this.mults.cha - 1) * 100)}%`);
        }
        if (this.mults.hack != null) {
            lines.push(`* Hacking by ${Math.round((this.mults.hack - 1) * 100)}%`);
        }
        return lines.join("<br>");
    }

    // Passes in a GangMember object
    apply(member: any) {
        if (this.mults.str != null)  { member.str_mult *= this.mults.str; }
        if (this.mults.def != null)  { member.def_mult *= this.mults.def; }
        if (this.mults.dex != null)  { member.dex_mult *= this.mults.dex; }
        if (this.mults.agi != null)  { member.agi_mult *= this.mults.agi; }
        if (this.mults.cha != null)  { member.cha_mult *= this.mults.cha; }
        if (this.mults.hack != null) { member.hack_mult *= this.mults.hack; }
    }
}