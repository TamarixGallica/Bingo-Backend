"use strict";

import { Theme } from "./themeModel";

export interface Square {
    id: number;
    text: string;
    themes: Theme[];
}
