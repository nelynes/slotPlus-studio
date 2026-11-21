import test from 'node:test';
import assert from 'node:assert/strict';
import { dbFor, serialIndex } from './libretro.js';

const DAT = `clrmamepro (
	name "Nintendo - Nintendo DS"
)

game (
	name "Mario Kart DS (USA) (En,Fr,De,Es,It) (Wii U Virtual Console)"
	serial "WUP-N-DACE"
	rom ( name "a.nds" size 33554432 crc 1FA7CE0F serial "WUP-N-DACE" )
)

game (
	name "Mario Kart DS (USA, Australia) (En,Fr,De,Es,It)"
	serial "AMCE"
	rom ( name "b.nds" size 33554432 crc A1B2C3D4 serial "AMCE" )
)

game (
	name "Mario Kart DS (USA, Australia) (En,Fr,De,Es,It) (Rev 1)"
	serial "AMCE"
	rom ( name "c.nds" size 33554432 crc 0000BEEF serial "AMCE" )
)

game (
	name "Some Game (Japan) (Demo)"
	serial "XYZJ"
	rom ( name "d.nds" size 1024 crc 12345678 serial "XYZJ" )
)
`;

test('a DS game code finds the first retail dump that carries it', () => {
  const index = serialIndex(DAT);
  assert.equal(index.get('AMCE'), 0xa1b2c3d4);
  // A code only a demo carries still finds it.
  assert.equal(index.get('XYZJ'), 0x12345678);
  // Long Virtual Console serials aren't header codes.
  assert.equal(index.has('WUP-N-DACE'), false);
});

test('a DS cart is looked up in the DS database', () => {
  assert.equal(dbFor('NDS', 'nds'), 'Nintendo - Nintendo DS');
});

test('a PokeDaisy game is looked up with its own system', () => {
  assert.equal(dbFor('PokeDaisy', 'gba'), 'Nintendo - Game Boy Advance');
  assert.equal(dbFor('PokeDaisy', 'gb'), 'Nintendo - Game Boy');
  assert.equal(dbFor('PokeDaisy', 'gbc'), 'Nintendo - Game Boy Color');
});
