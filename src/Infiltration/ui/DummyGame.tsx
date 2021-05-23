import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import { IMinigameProps } from "./IMinigameProps";
import { KeyHandler } from "./KeyHandler";
import { GameTimer } from "./GameTimer";


export function DummyGame(props: IMinigameProps) {
    const timer = 3000;

    return (<Grid container spacing={3}>
        <Grid item xs={12}>
            <GameTimer millis={timer} onExpire={props.onFailure} />
        </Grid>
        <Grid item xs={12}>
            <h1 className={"noselect"}>Press space!</h1>
            <KeyHandler onKeyDown={() => props.onSuccess()} />
        </Grid>
    </Grid>)
}