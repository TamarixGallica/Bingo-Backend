import { themeEntries } from "../db/seeds/001_squares_and_themes";

export const getTooLongText = (): string => "".padEnd(1024, "1234567890");

export const getNonExistingThemeId = (): number => Math.max(...themeEntries.map(x => x.id)) + 1;
