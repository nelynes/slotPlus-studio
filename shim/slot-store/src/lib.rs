//! slot-store as slot's cart face sees it, with the Game Boy header reads swapped. Those open the
//! rom, which a browser cannot do, so these answer from header bytes the page read.

pub use ::slot_store_real::*;

pub mod gb {
    use std::cell::RefCell;
    use std::path::Path;

    pub use ::slot_store_real::gb::*;

    const KEY: &str = "stash:rom";

    thread_local! {
        static HEAD: RefCell<Option<Vec<u8>>> = const { RefCell::new(None) };
    }

    /// Runs `f` with a rom key whose header is `head`, for the length of one draw.
    pub fn with_header<R>(head: &[u8], f: impl FnOnce(&Path) -> R) -> R {
        with_rom(head, "", f)
    }

    /// As `with_header`, with the key ending in the rom's own extension. slotPlus reads a cart's
    /// default shell from it: a `.wsc` game came on a frosted clear WonderSwan Color cart.
    pub fn with_rom<R>(head: &[u8], ext: &str, f: impl FnOnce(&Path) -> R) -> R {
        let key = match ext {
            "" => KEY.to_string(),
            ext => format!("{KEY}.{ext}"),
        };
        HEAD.with(|s| *s.borrow_mut() = Some(head.to_vec()));
        let out = f(Path::new(&key));
        HEAD.with(|s| *s.borrow_mut() = None);
        out
    }

    fn stashed(rom: &Path) -> Option<Option<Header>> {
        if rom.with_extension("") != Path::new(KEY) {
            return None;
        }
        HEAD.with(|s| s.borrow().as_ref().map(|b| Header::parse(b)))
    }

    /// Slot's signatures; any other path is slot's own read.
    pub fn header(rom: &Path) -> Option<Header> {
        stashed(rom).unwrap_or_else(|| ::slot_store_real::gb::header(rom))
    }

    pub fn class(rom: &Path) -> Class {
        match stashed(rom) {
            Some(h) => h.map_or(Class::Original, |h| h.class()),
            None => ::slot_store_real::gb::class(rom),
        }
    }

    pub fn cached_header(rom: &Path) -> Option<Header> {
        stashed(rom).unwrap_or_else(|| ::slot_store_real::gb::cached_header(rom))
    }

    pub fn cached_class(rom: &Path) -> Class {
        match stashed(rom) {
            Some(h) => h.map_or(Class::Original, |h| h.class()),
            None => ::slot_store_real::gb::cached_class(rom),
        }
    }
}
