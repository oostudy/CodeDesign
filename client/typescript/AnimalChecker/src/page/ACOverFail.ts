import { ACOverBase } from "./ACOverBase";
import {LGAudio} from "../logic/littleGameAudio";
const {ccclass, property, menu} = cc._decorator;

@ccclass
@menu("AnimalChecker/page/ACOverFail")
export default class ACOverFail extends ACOverBase {
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        super.onLoad();
        LGAudio.youFail();
    }
    // update (dt) {}
}
