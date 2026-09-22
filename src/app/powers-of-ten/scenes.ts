export type Art =
  | "web"
  | "field"
  | "galaxy"
  | "cloud"
  | "orbit"
  | "star"
  | "planet"
  | "land"
  | "grid"
  | "figure"
  | "skin"
  | "cells"
  | "virus"
  | "helix"
  | "atom"
  | "nucleus"
  | "quark"
  | "desert"
  | "string"
  | "foam"
  | "void";

export type Scene = {
  /** exponent of the scene's width in metres */
  e: number;
  title: string;
  blurb: string;
  art: Art;
  hue: number;
};

export const SCENES: Scene[] = [
  { e: 27, title: "The observable universe", blurb: "93 billion light-years across. Every galaxy whose light has had time to reach us.", art: "web", hue: 250 },
  { e: 26, title: "The cosmic web", blurb: "Matter is not sprinkled evenly. It hangs in filaments around voids the size of nothing else.", art: "web", hue: 255 },
  { e: 25, title: "Galaxy filaments", blurb: "Superclusters strung along threads left by ripples in the infant universe.", art: "field", hue: 260 },
  { e: 24, title: "Laniakea", blurb: "Our home supercluster — a hundred thousand galaxies all falling the same way.", art: "field", hue: 265 },
  { e: 23, title: "The Virgo cluster", blurb: "A thousand galaxies bound by gravity, swimming in hot X-ray gas.", art: "field", hue: 270 },
  { e: 22, title: "The Local Group", blurb: "The Milky Way, Andromeda, and fifty smaller galaxies. Andromeda is closing in.", art: "field", hue: 275 },
  { e: 21, title: "The Milky Way", blurb: "A barred spiral, 100,000 light-years wide, holding a few hundred billion stars.", art: "galaxy", hue: 220 },
  { e: 20, title: "A spiral arm", blurb: "Not a solid structure — a traffic jam of stars and gas that stars drift through.", art: "galaxy", hue: 210 },
  { e: 19, title: "The Orion Spur", blurb: "Our minor arm. The Sun takes 230 million years to lap the galaxy once.", art: "cloud", hue: 200 },
  { e: 18, title: "A molecular cloud", blurb: "Cold dust and hydrogen, a hundred light-years across, quietly collapsing into stars.", art: "cloud", hue: 320 },
  { e: 17, title: "The stellar neighbourhood", blurb: "A dozen light-years. Alpha Centauri, Barnard's Star, Sirius — all of them suns.", art: "field", hue: 190 },
  { e: 16, title: "One light-year", blurb: "9.46 trillion metres. Still inside the Sun's grip: the Oort cloud starts here.", art: "cloud", hue: 185 },
  { e: 15, title: "The inner Oort cloud", blurb: "A shell of frozen comets, loosely held, occasionally nudged inward by a passing star.", art: "cloud", hue: 180 },
  { e: 14, title: "The Kuiper belt", blurb: "Beyond Neptune: Pluto, Eris, Makemake, and a hundred thousand icy leftovers.", art: "orbit", hue: 175 },
  { e: 13, title: "The outer planets", blurb: "Neptune's orbit. Sunlight out here is a thousandth of what falls on Earth.", art: "orbit", hue: 200 },
  { e: 12, title: "Jupiter's orbit", blurb: "The giant that sweeps up comets and has quietly shaped the whole system.", art: "orbit", hue: 30 },
  { e: 11, title: "Earth's orbit", blurb: "One astronomical unit, 150 million metres per side. Light crosses it in 8 minutes.", art: "orbit", hue: 45 },
  { e: 10, title: "The inner solar system", blurb: "Mercury, Venus, Earth, Mars — four rocks in the narrow band where water can be liquid.", art: "orbit", hue: 40 },
  { e: 9, title: "The Sun", blurb: "1.4 million kilometres of hydrogen fusing into helium. 99.86% of the system's mass.", art: "star", hue: 40 },
  { e: 8, title: "Earth and Moon", blurb: "384,000 kilometres apart — the only gap humans have ever crossed.", art: "planet", hue: 205 },
  { e: 7, title: "Earth", blurb: "12,742 kilometres wide. A thin skin of water and air on a ball of iron and rock.", art: "planet", hue: 205 },
  { e: 6, title: "A continent", blurb: "Plates drifting at the speed your fingernails grow, rearranging the map over aeons.", art: "land", hue: 150 },
  { e: 5, title: "A city and its region", blurb: "A hundred kilometres. The horizon from a high window; a morning's drive.", art: "land", hue: 140 },
  { e: 4, title: "A city", blurb: "Ten kilometres of streets, laid down by a thousand years of small decisions.", art: "grid", hue: 130 },
  { e: 3, title: "A neighbourhood", blurb: "One kilometre. Roughly how far you walk without noticing it.", art: "grid", hue: 125 },
  { e: 2, title: "A city block", blurb: "A hundred metres. Close enough to recognise a friend's walk.", art: "grid", hue: 120 },
  { e: 1, title: "A garden", blurb: "Ten metres. A house, a tree, a parked car — the scale the body understands best.", art: "figure", hue: 110 },
  { e: 0, title: "A person", blurb: "One metre. Almost exactly halfway, in powers of ten, between a quark and the cosmos.", art: "figure", hue: 100 },
  { e: -1, title: "A hand", blurb: "Ten centimetres. Twenty-seven bones and a third of the brain's motor cortex.", art: "skin", hue: 20 },
  { e: -2, title: "Skin", blurb: "One centimetre of folded ridges — the fingerprint that is never repeated.", art: "skin", hue: 18 },
  { e: -3, title: "A millimetre", blurb: "A grain of salt, a mite, the thickness of a fingernail. The eye gives up near here.", art: "skin", hue: 15 },
  { e: -4, title: "A hair's width", blurb: "A hundred micrometres. Past this point everything must be borrowed from a lens.", art: "cells", hue: 340 },
  { e: -5, title: "Cells", blurb: "Ten micrometres. A red blood cell, folded into a disc so it can squeeze through capillaries.", art: "cells", hue: 350 },
  { e: -6, title: "A bacterium", blurb: "One micrometre. There are more of these on your skin than there are people on Earth.", art: "cells", hue: 300 },
  { e: -7, title: "A virus", blurb: "A hundred nanometres of protein shell — not quite alive, extremely good at copying.", art: "virus", hue: 290 },
  { e: -8, title: "A ribosome", blurb: "Ten nanometres. The machine that reads RNA and builds every protein you are made of.", art: "virus", hue: 280 },
  { e: -9, title: "DNA", blurb: "Two nanometres wide, two metres long, coiled inside almost every cell you own.", art: "helix", hue: 200 },
  { e: -10, title: "An atom", blurb: "One ångström. The electron cloud — a probability, not a surface.", art: "atom", hue: 190 },
  { e: -11, title: "Inner electron shells", blurb: "Tightly bound, moving at a meaningful fraction of the speed of light.", art: "atom", hue: 185 },
  { e: -12, title: "Emptiness", blurb: "Nothing here. Between the electrons and the nucleus lies almost the entire atom, unoccupied.", art: "void", hue: 230 },
  { e: -13, title: "Still nothing", blurb: "If the nucleus were a marble, the nearest electron would be a kilometre away.", art: "void", hue: 235 },
  { e: -14, title: "The nucleus", blurb: "Ten femtometres. A hundred-thousandth of the atom, holding 99.9% of its mass.", art: "nucleus", hue: 15 },
  { e: -15, title: "A proton", blurb: "One femtometre. Three quarks and a storm of gluons, binding with the strong force.", art: "nucleus", hue: 10 },
  { e: -16, title: "Inside the proton", blurb: "Quarks carry only 1% of the mass. The rest is pure binding energy — motion made solid.", art: "quark", hue: 300 },
  { e: -17, title: "Beyond measurement", blurb: "Colliders probe here by smashing things together and reading the wreckage.", art: "quark", hue: 310 },
  { e: -18, title: "A quark", blurb: "No measurable size. As far as anyone has looked, it is a point — and the looking continues.", art: "quark", hue: 320 },
  { e: -19, title: "The limit of the LHC", blurb: "The smallest distance any experiment has resolved. Below this, everything is inference.", art: "quark", hue: 330 },
  { e: -20, title: "Past the evidence", blurb: "To see one decade smaller you would need a collider several times larger than it is.", art: "desert", hue: 335 },
  { e: -21, title: "The great desert", blurb: "Theory predicts nothing new for many decades below here. It may be genuinely empty.", art: "desert", hue: 340 },
  { e: -22, title: "Still the desert", blurb: "Or it may not be. Extra dimensions, if they exist, could be curled up somewhere in this range.", art: "desert", hue: 345 },
  { e: -23, title: "Silence", blurb: "No particle, no force, no measurement. Only the arithmetic of ten, carrying on.", art: "desert", hue: 350 },
  { e: -24, title: "A yoctometre", blurb: "A millionth of a proton's width. The last SI prefix that had a name for a long time.", art: "desert", hue: 355 },
  { e: -25, title: "Deeper", blurb: "Some models put a fourth generation of matter down here. None has ever been seen.", art: "desert", hue: 5 },
  { e: -26, title: "Deeper still", blurb: "The electron remains pointlike to every test — no substructure has ever shown itself.", art: "desert", hue: 10 },
  { e: -27, title: "A rontometre", blurb: "A prefix only coined in 2022, because nothing had needed naming this small before.", art: "desert", hue: 15 },
  { e: -28, title: "Beyond names", blurb: "Past here the SI prefixes run out and physics speaks only in exponents.", art: "desert", hue: 20 },
  { e: -29, title: "Toward unification", blurb: "The three forces' strengths have been converging this whole way down. They nearly meet.", art: "void", hue: 260 },
  { e: -30, title: "A quectometre", blurb: "The smallest named unit there is: 10⁻³⁰ metres. Five decades of nameless space remain.", art: "void", hue: 255 },
  { e: -31, title: "Grand unification", blurb: "Around here the electromagnetic, weak and strong forces may become a single force.", art: "string", hue: 280 },
  { e: -32, title: "The GUT scale", blurb: "10¹⁶ GeV. The energy of the universe a trillionth of a trillionth of a trillionth of a second old.", art: "string", hue: 290 },
  { e: -33, title: "Strings", blurb: "If string theory is right, particles are vibrating filaments roughly this long.", art: "string", hue: 300 },
  { e: -34, title: "Spacetime frays", blurb: "Gravity is no longer negligible at particle scales. Smooth geometry stops making sense.", art: "foam", hue: 200 },
  { e: -35, title: "The Planck length", blurb: "1.616 × 10⁻³⁵ m. Below this, distance itself has no agreed meaning — no known theory reaches further.", art: "foam", hue: 190 },
];
