# Seasonal features

The active season is explicitly selected in `config.ts`. **Christmas is currently enabled** and Halloween is disabled, including all scares, blackouts and cursed-duck effects. Christmas stays enabled until the selection is changed; it is visible throughout the day.

`christmas/ChristmasRoom.tsx` replaces the floor lamp with a layered fir tree, burgundy and champagne ornaments, warm fairy lights, a gold star, tree skirt and wrapped presents. Garlands decorate the window, media wall, shelf and experience board, with a wreath and stockings. Screens and artwork remain unobstructed.

Tree lights follow the room dimmer, including true off at zero. Bulbs use one instanced draw call and one non-shadow-casting local light; static greenery, ornaments and ribbons are batched by material. No flashing lights or additional animation loops are added.

The archived `halloween/` folder and its calendar rules remain available for a future deliberate reactivation. `SeasonalFeatures.tsx` keeps the shared lighting and duck state neutral while Halloween is disabled.
