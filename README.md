# Cart Studio+

Cart labels for a [slotPlus](https://nelynes.github.io/slotPlus/) SD card, previewed on the same cart
face slotPlus draws. Runs in the browser at
[nelynes.github.io/slotPlus-studio](https://nelynes.github.io/slotPlus-studio/).

Cart Studio+ is [slot's Cart Studio](https://github.com/BrandonKowalski/slot-cart-studio) for
slotPlus. It covers slot's Game Boy Advance, Game Boy and Game Boy Color, and slotPlus's
WonderSwan and WonderSwan Color, Atari Lynx, Game Gear, NeoGeo Pocket and NeoGeo Pocket Color, and
TurboGrafx-16. Its carts are drawn by slotPlus's own source, compiled for the browser from
slotPlusUltra at the commit `slot.ref` names, so a preview is the cart you will see on the handheld.

Each game's label and logo is looked for in order, and the first source that has one is used:

- **The [slotPlus art set](https://github.com/nelynes/slotPlus-art):** labels and logos made or
  scanned for slotPlus, for any system. Where it and slot's set both have art for a game, it wins.
- **slot's art set,** for Game Boy, Game Boy Color and Game Boy Advance.
- **libretro's logos,** for every system but the Lynx, which libretro has none for.
- **Any game still without one:** its title screen from libretro, set on the label in the logo's
  place. This is how Lynx carts are dressed, since libretro has no Lynx logos.

Games are matched in libretro's databases, and each label's colour is read from the game's box art.
You can drop in your own logo or label for any cart.

## Building

slotPlus is checked out beside this repository as `../slot`, at the commit in `slot.ref`:

    git clone https://github.com/nelynes/slotPlus ../slot
    git -C ../slot checkout "$(cat slot.ref)"
    task test     # the carts against slotPlus's, pixel for pixel
    task build    # the WASM package, into web/pkg

`task slot:pin-check` says whether `../slot`'s cart drawing still matches `slot.ref`.

## License

GPL-3.0-or-later, same as slot and slotPlus. See [LICENSE](LICENSE).

Game names and CRCs come from
[libretro-database](https://github.com/libretro/libretro-database) (CC BY-SA 4.0). Game Boy logos
come from [ScreenScraper](https://www.screenscraper.fr/) (CC BY-NC-SA 4.0), through slot's art set.
Logos and box art for the other systems come from
[libretro-thumbnails](https://github.com/libretro-thumbnails).

Game Boy is a trademark of Nintendo. WonderSwan is a trademark of Bandai. Lynx is a trademark of
Atari. Game Gear is a trademark of Sega. NeoGeo Pocket is a trademark of SNK. TurboGrafx-16, PC
Engine, TurboExpress and HuCard are trademarks of their respective owners. Cart Studio+ is not
affiliated with any of them.
